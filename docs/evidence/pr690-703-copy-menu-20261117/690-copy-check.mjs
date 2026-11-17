import assert from 'node:assert/strict';import {mkdtempSync,readFileSync,readdirSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=process.cwd();const c=await import(pathToFileURL(root+'/tests/helpers/copy-integration-source-closure.mjs'));
const out=mkdtempSync(join(tmpdir(),'690-copy-'));let checks=0;
try{
 c.copyIntegrationSourceClosure(out);checks++;
 const m=await import(pathToFileURL(out+'/tests/helpers/closeout-source-epoch.mjs'));const original=await import(pathToFileURL(root+'/tests/helpers/closeout-source-epoch.mjs'));
 assert.deepEqual(m.sourceEpoch.proof,original.sourceEpoch.proof);checks++;
 for(const group of ['releaseNavigationHelperCopies','releaseSelectionMapHelperCopies','releasePc22BasicFeedbackHelperCopies'])for(const row of c[group]){
  const bytes=readFileSync(join(out,row.path));if(row.path!=='tests/helpers/closeout-source-epoch.mjs')assert.equal(createHash('sha256').update(bytes).digest('hex'),row.after);checks++;
 }
 const paths=[];const walk=d=>{for(const e of readdirSync(d,{withFileTypes:true})){const p=join(d,e.name);e.isDirectory()?walk(p):paths.push(p.slice(out.length+1));}};walk(out);
 assert(!paths.some(p=>p.includes('release-pc22-basic-feedback-ci-source')||p.includes('navigation-inventory-reader')||p.includes('690-outer')||p.includes('navigation-map-integration')||p.includes('release-card-contact-integration')||p.startsWith('src/')));checks++;
 // Real copy proves source drift rejection before copying the changed dependency.
 const path='tests/helpers/release-pc22-basic-feedback-source.mjs',before=readFileSync(path);
 try{writeFileSync(path,Buffer.concat([before,Buffer.from('\n')]));assert.throws(()=>c.copyIntegrationSourceClosure(out),/fresh helper copy identity/);checks++;}finally{writeFileSync(path,before);}
 c.copyIntegrationSourceClosure(out);checks++;
 console.log(JSON.stringify({result:'PASS',checks,copiedHelpers:paths.length,productionBindings:Object.keys(m.sourceEpoch.proof.current).length,targets:Object.keys(m.sourceEpoch.proof.targets).length}));
}finally{rmSync(out,{recursive:true,force:true});}
