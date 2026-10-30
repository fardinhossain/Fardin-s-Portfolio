import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createDevServer} from '../server/dev-server.mjs';
export async function startServer(rootUrl, options={}){
 const server=createDevServer({root:path.resolve(fileURLToPath(rootUrl)),env:{},...options});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {baseUrl:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>server.close(resolve))};
}
