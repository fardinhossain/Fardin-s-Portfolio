import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
export async function startServer(rootUrl) {
  const root = path.resolve(fileURLToPath(rootUrl));
  const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.pdf':'application/pdf','.json':'application/json'};
  const server = http.createServer(async (req,res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(['/','/journey','/experience/flyrank-ai'].includes(pathname)) pathname='/index.html';
      let file=path.resolve(root,'.'+pathname);
      if(!file.startsWith(root+path.sep) && file!==root) {res.writeHead(403);res.end();return;}
      const stat=await fs.stat(file); if(stat.isDirectory()) file=path.join(file,'index.html');
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
      res.end(await fs.readFile(file));
    } catch {res.writeHead(404);res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {baseUrl:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>server.close(resolve))};
}
