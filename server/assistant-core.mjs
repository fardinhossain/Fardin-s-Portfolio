import { SYSTEM_INSTRUCTIONS } from './profile-context.mjs';

export const LIMITS = Object.freeze({ bodyBytes: 16 * 1024, messageChars: 1000, messages: 8, outputTokens: 600, outputChars: 8000, responseBytes: 64 * 1024, timeoutMs: 15_000 });
const MESSAGES = {
  INVALID_REQUEST: 'Send a valid JSON conversation with 1–8 user or assistant messages (up to 1000 characters each), ending with a user message.',
  METHOD_NOT_ALLOWED: 'This HTTP method is not supported.',
  PAYLOAD_TOO_LARGE: 'Request body exceeds the 16 KiB limit.',
  RATE_LIMITED: 'Too many requests. Please try again shortly.',
  AI_NOT_CONFIGURED: 'The AI assistant is not configured yet. Please use the portfolio contact links.',
  AI_UNAVAILABLE: 'The AI assistant is temporarily unavailable. Please try again later.',
  AI_TIMEOUT: 'The AI assistant took too long to respond. Please try again.'
};
class HttpError extends Error {
  constructor(status, code) { super(MESSAGES[code]); this.status = status; this.code = code; }
}
const fail = (status, code) => { throw new HttpError(status, code); };
export function sendJson(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  for (const [key, value] of Object.entries({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders })) res.setHeader(key, value);
  res.end(JSON.stringify(body));
}
function sendError(res, error) {
  const safe = error instanceof HttpError ? error : new HttpError(502, 'AI_UNAVAILABLE');
  sendJson(res, safe.status, { error: { code: safe.code, message: safe.message } }, safe.status === 429 ? { 'Retry-After': '60' } : {});
}
export function getConfiguration(env = process.env) {
  const key = env.AI_API_KEY?.trim();
  const model = env.AI_MODEL?.trim();
  try {
    const base = new URL(env.AI_BASE_URL?.trim() || 'https://api.openai.com/v1');
    if (!key || !model || /[\r\n]/.test(key + model) || base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) return null;
    const endpoint = `${base.href.replace(/\/+$/, '')}/chat/completions`;
    // The credential belongs only in the Authorization header, never in URLs.
    if (endpoint.includes(key) || model.includes(key)) return null;
    return { key, model, endpoint };
  } catch { return null; }
}

// Best-effort abuse control only: in-memory, per Node process/cold start, not a
// distributed quota. Use a shared edge/store limiter before public high traffic.
// Never trust client-supplied forwarding headers. Socket peer can be shared on
// serverless platforms, making this deliberately conservative. No chat is stored.
export function createRateLimiter({ maxRequests = 12, windowMs = 60_000, maxEntries = 2048, now = Date.now } = {}) {
  const buckets = new Map();
  return {
    consume(identity) {
      const time = now();
      for (const [key, bucket] of buckets) if (bucket.until <= time) buckets.delete(key);
      const id = String(identity || 'shared').slice(0, 128);
      let bucket = buckets.get(id);
      if (!bucket) {
        if (buckets.size >= maxEntries) return false;
        bucket = { count: 0, until: time + windowMs };
        buckets.set(id, bucket);
      }
      return ++bucket.count <= maxRequests;
    },
    get size() { return buckets.size; }
  };
}
const sharedLimiter = createRateLimiter();
const byteLength = value => Buffer.byteLength(value, 'utf8');
function checkBytes(value) { if (value > LIMITS.bodyBytes) fail(413, 'PAYLOAD_TOO_LARGE'); }
async function readBody(req) {
  const length = req.headers?.['content-length'];
  if (length !== undefined) {
    if (!/^\d+$/.test(String(length))) fail(400, 'INVALID_REQUEST');
    checkBytes(Number(length));
  }
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
      checkBytes(Buffer.byteLength(req.body));
      try { return JSON.parse(req.body.toString()); } catch { fail(400, 'INVALID_REQUEST'); }
    }
    let serialized;
    try { serialized = JSON.stringify(req.body); } catch { fail(400, 'INVALID_REQUEST'); }
    if (typeof serialized !== 'string') fail(400, 'INVALID_REQUEST');
    checkBytes(byteLength(serialized));
    return req.body;
  }
  // Event-based collection lets us drain an oversized IncomingMessage without
  // destroying its socket before the clean 413 response can be sent.
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    const cleanup = () => { req.off('data', data); req.off('end', end); req.off('error', error); req.off('aborted', aborted); };
    const error = () => { cleanup(); reject(new HttpError(400, 'INVALID_REQUEST')); };
    const aborted = error;
    const data = chunk => {
      size += Buffer.byteLength(chunk);
      if (size > LIMITS.bodyBytes) { cleanup(); req.resume(); reject(new HttpError(413, 'PAYLOAD_TOO_LARGE')); }
      else chunks.push(Buffer.from(chunk));
    };
    const end = () => {
      cleanup();
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new HttpError(400, 'INVALID_REQUEST')); }
    };
    req.on('data', data); req.on('end', end); req.on('error', error); req.on('aborted', aborted);
  });
}
export function validateConversation(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !Object.hasOwn(body, 'messages')) fail(400, 'INVALID_REQUEST');
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > LIMITS.messages) fail(400, 'INVALID_REQUEST');
  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || Object.keys(item).length !== 2 || !Object.hasOwn(item, 'role') || !Object.hasOwn(item, 'content') || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim() || item.content.length > LIMITS.messageChars || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(item.content)) fail(400, 'INVALID_REQUEST');
  }
  if (messages.at(-1).role !== 'user') fail(400, 'INVALID_REQUEST');
  return messages.map(({ role, content }) => ({ role, content }));
}
async function providerReply(config, messages, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new HttpError(504, 'AI_TIMEOUT')); }, timeoutMs);
  });
  try {
    return await Promise.race([timeout, (async () => {
      const response = await fetchImpl(config.endpoint, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
        body: JSON.stringify({ model: config.model, messages: [{ role: 'system', content: SYSTEM_INSTRUCTIONS }, ...messages], max_tokens: LIMITS.outputTokens, stream: false })
      });
      if (!response.ok) { await response.body?.cancel(); fail(502, 'AI_UNAVAILABLE'); }
      if (Number(response.headers.get('content-length')) > LIMITS.responseBytes) { await response.body?.cancel(); fail(502, 'AI_UNAVAILABLE'); }
      if (!response.body) fail(502, 'AI_UNAVAILABLE');
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > LIMITS.responseBytes) { await reader.cancel(); fail(502, 'AI_UNAVAILABLE'); }
        chunks.push(Buffer.from(value));
      }
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== 'string' || !reply.trim() || reply.includes(config.key)) fail(502, 'AI_UNAVAILABLE');
      return reply.trim().slice(0, LIMITS.outputChars);
    })()]);
  } catch (error) {
    if (controller.signal.aborted) fail(504, 'AI_TIMEOUT');
    if (error instanceof HttpError) throw error;
    fail(502, 'AI_UNAVAILABLE');
  } finally { clearTimeout(timer); controller.abort(); }
}
export function createChatHandler({ env = process.env, fetchImpl = globalThis.fetch, limiter = sharedLimiter, timeoutMs = LIMITS.timeoutMs } = {}) {
  return async function chat(req, res) {
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); fail(405, 'METHOD_NOT_ALLOWED'); }
      if (!limiter.consume(req.socket?.remoteAddress)) fail(429, 'RATE_LIMITED');
      if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(req.headers?.['content-type'] || '')) fail(400, 'INVALID_REQUEST');
      const messages = validateConversation(await readBody(req));
      const config = getConfiguration(env);
      if (!config) fail(503, 'AI_NOT_CONFIGURED');
      const reply = await providerReply(config, messages, fetchImpl, timeoutMs);
      sendJson(res, 200, { reply });
    } catch (error) { sendError(res, error); }
  };
}
export function createStatusHandler({ env = process.env } = {}) {
  return function status(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return sendError(res, new HttpError(405, 'METHOD_NOT_ALLOWED'));
    }
    const configured = Boolean(getConfiguration(env));
    sendJson(res, 200, { configured, message: configured ? 'AI provider configured. Connection is checked only when a chat request succeeds.' : MESSAGES.AI_NOT_CONFIGURED });
  };
}
