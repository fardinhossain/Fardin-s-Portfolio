import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createChatHandler, createStatusHandler, sendJson } from './assistant-core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8'
};
const aliases = new Set(['/', '/index', '/index.html', '/journey', '/experience/flyrank-ai']);
function staticPath(rawUrl) {
  let path;
  try { path = decodeURIComponent(rawUrl.split('?')[0]); } catch { return null; }
  if (!path.startsWith('/') || path.includes('\\') || path.includes('\0')) return null;
  const segments = path.split('/').filter(Boolean);
  if (segments.some(segment => segment.startsWith('.') || segment === 'node_modules')) return null;
  const clean = path.replace(/\/+$/, '') || '/';
  if (aliases.has(clean)) return '/index.html';
  if (clean === '/journey.html') return clean;
  // Explicit public roots only: never serve server/, api/, tests/, .env,
  // package manifests, source maps, git metadata, or project documentation.
  if (['assets', 'Anthropic_Certificates_Images', 'experience'].includes(segments[0]) || ['/Fardin_Hossain_Resume.pdf', '/paper.pdf'].includes(clean)) {
    return Object.hasOwn(MIME, extname(clean).toLowerCase()) ? clean : null;
  }
  return null;
}
export function createDevServer({ root = ROOT, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const chat = createChatHandler({ env, fetchImpl });
  const status = createStatusHandler({ env });
  return createServer(async (req, res) => {
    const pathname = req.url?.split('?')[0];
    if (pathname === '/api/chat') return chat(req, res);
    if (pathname === '/api/assistant-status') return status(req, res);
    if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'This HTTP method is not supported.' } }, { Allow: 'GET, HEAD' });
    const publicPath = staticPath(req.url || '/');
    if (!publicPath) return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Not found.' } });
    try {
      const realRoot = await realpath(root);
      const file = await realpath(resolve(root, `.${publicPath}`));
      if (!file.startsWith(realRoot + sep) || file !== resolve(realRoot, `.${publicPath}`) || !(await stat(file)).isFile()) throw new Error('Not public');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': body.length, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Not found.' } }); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.loadEnvFile?.(resolve(ROOT, '.env')); }
  catch (error) {
    if (error.code !== 'ENOENT') { console.error('Unable to load server environment file.'); process.exitCode = 1; }
  }
  if (!process.exitCode) {
    const port = Number(process.env.PORT || 4175);
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid port number.');
    const server = createDevServer();
    server.requestTimeout = 30_000;
    server.headersTimeout = 10_000;
    server.listen(port, '127.0.0.1', () => console.log(`Portfolio dev server listening on port ${server.address().port}`));
  }
}
