import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {buildStatic} from '../tools/build-static.mjs';
test('static output excludes environment files, server sources and test/tooling data',async()=>{
 const root=await mkdtemp(join(tmpdir(),'portfolio-build-'));
 try{
  for(const d of ['assets','Anthropic_Certificates_Images','experience','server'])await mkdir(join(root,d));
  for(const f of ['index.html','journey.html','Fardin_Hossain_Resume.pdf','paper.pdf'])await writeFile(join(root,f),'public fixture');
  await writeFile(join(root,'assets/public.js'),'public code');await writeFile(join(root,'assets/.env'),'not-a-real-key');
  await writeFile(join(root,'.env'),'not-a-real-key');await writeFile(join(root,'server/secret.mjs'),'server fixture');
  const out=await buildStatic(root,join(root,'dist'));
  assert.equal(await readFile(join(out,'assets/public.js'),'utf8'),'public code');
  for(const f of ['.env','server/secret.mjs','assets/.env'])await assert.rejects(access(join(out,f)));
 }finally{await rm(root,{recursive:true,force:true});}
});
