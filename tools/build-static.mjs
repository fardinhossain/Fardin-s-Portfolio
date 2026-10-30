import {cp, mkdir, readdir, rm, stat, lstat} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const PUBLIC=['index.html','journey.html','assets','Anthropic_Certificates_Images','experience','Fardin_Hossain_Resume.pdf','paper.pdf'];
export async function buildStatic(root=ROOT,out=resolve(root,'dist')){
 if(resolve(out)===resolve(root))throw Error('Refusing to overwrite source root');
 await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
 async function copy(from,to){
  if((await lstat(from)).isSymbolicLink())throw Error('Symlink is not a public asset');
  if((await stat(from)).isDirectory()){
   await mkdir(to,{recursive:true});
   for(const name of await readdir(from))if(!name.startsWith('.')&&name!=='node_modules')await copy(join(from,name),join(to,name));
  }else await cp(from,to);
 }
 for(const name of PUBLIC)await copy(join(root,name),join(out,name));
 return out;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 await buildStatic();console.log('Static build ready in dist (server code and environment files excluded).');
}
