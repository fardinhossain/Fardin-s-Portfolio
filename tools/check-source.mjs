import {readdir,readFile} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');let count=0;
async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){
 if(['node_modules','artifacts','.git','dist','__pycache__'].includes(item.name))continue;
 const p=resolve(dir,item.name);if(item.isDirectory())await visit(p);else if(['.js','.mjs'].includes(extname(p))){execFileSync(process.execPath,['--check',p],{stdio:'pipe'});count++;}
}}
for(const dir of ['assets/js','api','server','tests','tools','verification'])await visit(resolve(root,dir));
for(const name of ['package.json','vercel.json','verification/package.json'])JSON.parse(await readFile(resolve(root,name),'utf8'));
console.log(`Source checks passed: ${count} JavaScript modules parsed; JSON configuration valid.`);
