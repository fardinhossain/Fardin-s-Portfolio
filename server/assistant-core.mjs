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
const FREE_AI_BASE = 'https://api.free.ai/v1';
const FREE_AI_ENDPOINT = 'https://api.free.ai/v1/chat/completions';
const FREE_AI_DEFAULT_MODEL = 'qwen7b';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

function normalizeModel(val) {
  if (!val || typeof val !== 'string') return '';
  let m = val.trim();
  if (/^qwen\s*3\.6\s*35b$/i.test(m) || /^qwen-3\.6-35b$/i.test(m) || /^qwen\s*7b$/i.test(m)) {
    return 'qwen7b';
  }
  if (/^qwen\s*3[\s-]*8b$/i.test(m)) {
    return 'qwen3-8b';
  }
  if (m.toLowerCase().includes('flash') && m.toLowerCase().includes('light')) {
    m = m.replace(/light/gi, 'lite');
  }
  if (/^[23]\.\d/i.test(m) && /(flash|pro)/i.test(m) && !m.toLowerCase().startsWith('gemini-')) {
    m = `gemini-${m}`;
  }
  if (/gemini|flash|pro|qwen/i.test(m)) m = m.toLowerCase();
  m = m.replace(/\s+/g, '-');
  if (m === 'gemini-3.5-flash-lite' || m === 'gemini-3.5-flash') return 'gemini-2.5-flash';
  if (m === 'gemini-3.6-flash' || m === 'gemini-3.6-pro') return 'gemini-2.5-pro';
  return m;
}

function defaultBaseForModel(model) {
  const lower = (model || '').toLowerCase();
  if (lower === 'qwen7b' || lower === 'qwen3-8b') return FREE_AI_BASE;
  if (lower.startsWith('gemini-')) return GEMINI_BASE;
  return 'https://api.openai.com/v1';
}

export function getConfiguration(env = process.env) {
  const rawKey = (env.AI_API_KEY || env.FREE_CODE_TOKEN || env.GEMINI_API_KEY)?.trim();
  const rawModel = (env.AI_MODEL || env.FREE_CODE_MODEL || env.GEMINI_MODEL)?.trim();
  if (!rawKey || !rawModel) return null;

  let key = rawKey;
  let fallbackKey = (env.AI_FALLBACK_API_KEY || env.AI_SECONDARY_KEY || env.AI_SECONDARY_API_KEY || env.AI_FALLBACK_KEY || env.GEMINI_API_KEY || env.GEMINI_API_KEY_2)?.trim();
  if (fallbackKey === key) fallbackKey = undefined;

  // Support multiple keys if provided comma-separated or newline-separated in AI_API_KEY
  if (rawKey.includes(',') || rawKey.includes('\n')) {
    const keyParts = rawKey.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
    key = keyParts[0] || '';
    if (!fallbackKey && keyParts.length > 1) {
      fallbackKey = keyParts[1];
    }
  }

  let rawPrimary = rawModel;
  let rawFallbackList = [];
  const rawFallbackEnv = (env.AI_FALLBACK_MODEL || env.AI_SECONDARY_MODEL)?.trim();

  if (rawModel.includes(',')) {
    const parts = rawModel.split(',').map(s => s.trim()).filter(Boolean);
    rawPrimary = parts[0] || '';
    if (parts.length > 1) {
      rawFallbackList.push(...parts.slice(1));
    }
  }
  if (rawFallbackEnv) {
    rawFallbackList.push(...rawFallbackEnv.split(',').map(s => s.trim()).filter(Boolean));
  }

  const model = normalizeModel(rawPrimary);
  let fallbackModels = rawFallbackList.map(normalizeModel).filter(Boolean);

  if (fallbackModels.length === 0) {
    if (model === 'qwen7b' || model === 'qwen3-8b') {
      fallbackModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    } else if (model === 'gemini-2.5-flash') {
      fallbackModels = ['gemini-2.5-pro'];
    } else if (model === 'gemini-2.5-pro') {
      fallbackModels = ['gemini-2.5-flash'];
    }
  }

  try {
    const defaultBase = !env.AI_BASE_URL ? defaultBaseForModel(model) : 'https://api.openai.com/v1';
    const baseInput = env.AI_BASE_URL?.trim() || defaultBase;
    const base = new URL(baseInput);
    const allText = key + model + fallbackModels.join('') + (fallbackKey || '');
    if (!model || /[\r\n]/.test(allText) || base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) return null;

    const cleanHref = base.href.replace(/\/+$/, '').replace(/\/chat\/completions$/, '');
    const endpoint = `${cleanHref}/chat/completions`;

    // The credential belongs only in the Authorization header, never in URLs.
    if (endpoint.includes(key) || model.includes(key) || fallbackModels.some(fm => fm.includes(key))) return null;

    const fallbacks = [];
    const effectiveFbKey = fallbackKey || key;
    const hasDifferentKey = Boolean(fallbackKey && fallbackKey !== key);

    const candidateFbModels = fallbackModels.length > 0 ? fallbackModels : (hasDifferentKey ? [model] : []);
    for (const fbModel of candidateFbModels) {
      if (fbModel === model && !hasDifferentKey) continue;
      const sameFamily = defaultBaseForModel(fbModel) === defaultBaseForModel(model);
      const fbBaseUrl = env.AI_FALLBACK_BASE_URL?.trim() || (sameFamily ? baseInput : defaultBaseForModel(fbModel));
      const fbBase = new URL(fbBaseUrl);
      if (fbBase.protocol === 'https:' && !fbBase.username && !fbBase.password && !fbBase.search && !fbBase.hash) {
        const cleanFbHref = fbBase.href.replace(/\/+$/, '').replace(/\/chat\/completions$/, '');
        const fbEndpoint = `${cleanFbHref}/chat/completions`;
        if (!fbEndpoint.includes(effectiveFbKey) && !fbModel.includes(effectiveFbKey)) {
          fallbacks.push({ key: effectiveFbKey, model: fbModel, endpoint: fbEndpoint });
        }
      }
    }

    const fallback = fallbacks[0] || null;
    const freeAiPrimary = env.AI_FREE_PRIMARY !== 'false' && (
      model === 'qwen7b' ||
      model === 'qwen3-8b' ||
      endpoint.includes('generativelanguage.googleapis.com')
    );

    return {
      key,
      model,
      endpoint,
      fallback,
      fallbacks,
      fallbackModel: fallback ? fallback.model : null,
      freeAiPrimary
    };
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
async function callSingleProvider(endpoint, key, model, messages, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new HttpError(504, 'AI_TIMEOUT')); }, timeoutMs);
  });
  try {
    return await Promise.race([timeout, (async () => {
      const response = await fetchImpl(endpoint, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: SYSTEM_INSTRUCTIONS }, ...messages], max_tokens: LIMITS.outputTokens, stream: false })
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
      if (typeof reply !== 'string' || !reply.trim() || reply.includes(key)) fail(502, 'AI_UNAVAILABLE');
      return reply.trim().slice(0, LIMITS.outputChars);
    })()]);
  } catch (error) {
    if (controller.signal.aborted) fail(504, 'AI_TIMEOUT');
    if (error instanceof HttpError) throw error;
    fail(502, 'AI_UNAVAILABLE');
  } finally { clearTimeout(timer); controller.abort(); }
}
async function providerReply(config, messages, fetchImpl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const fallbackList = Array.isArray(config.fallbacks) && config.fallbacks.length > 0
    ? config.fallbacks
    : (config.fallback ? [config.fallback] : []);

  const candidates = [];
  if (fetchImpl === globalThis.fetch && config.freeAiPrimary && config.endpoint !== FREE_AI_ENDPOINT) {
    candidates.push({ endpoint: FREE_AI_ENDPOINT, key: config.key, model: FREE_AI_DEFAULT_MODEL });
  }
  candidates.push({ endpoint: config.endpoint, key: config.key, model: config.model });
  for (const fb of fallbackList) {
    if (!candidates.some(c => c.endpoint === fb.endpoint && c.model === fb.model && c.key === fb.key)) {
      candidates.push(fb);
    }
  }

  let lastError;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const remainingTime = i === 0 ? timeoutMs : (deadline - Date.now());
    if (i > 0 && remainingTime <= 200) break;
    try {
      const reply = await callSingleProvider(candidate.endpoint, candidate.key, candidate.model, messages, fetchImpl, remainingTime);
      if (candidates.some(c => c.key && reply.includes(c.key))) fail(502, 'AI_UNAVAILABLE');
      return reply;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new HttpError(502, 'AI_UNAVAILABLE');
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
