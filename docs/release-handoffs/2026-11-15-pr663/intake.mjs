// Read-only intake aid. NOT a replacement for platform/UI/runtime/release gates.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export function inspect({frozenSource,gil,receipt,startup,official,aliasGil,alias}) {
 const errors=[]; const check=(ok,msg)=>{if(!ok)errors.push(msg)};
 const digest=b=>createHash('sha256').update(b).digest('hex');
 const sha=digest(gil); const id=receipt.buildId;
 check(/^[a-f0-9]{40}$/.test(frozenSource??''),'Explicit frozen source SHA required');
 check(receipt.sourceCommit===frozenSource&&receipt.sourceDirty===false,'Receipt source differs from frozen clean source');
 check(/^[a-f0-9-]{36}$/.test(id??''),'Build ID missing');
 check(/^[a-f0-9]{64}$/.test(receipt.payloadDigest??''),'Payload digest missing');
 check(/^[a-f0-9]{64}$/.test(receipt.release?.notesSha256??''),'Frozen release notes hash missing');
 check(receipt.candidate?.sha256===sha,'Canonical receipt differs from final GIL');
 if(receipt.sha256!==undefined)check(receipt.sha256===sha,'Audio receipt differs from final GIL');
 check(startup.candidateHash===sha&&startup.buildId===id,'Startup evidence differs from final GIL/build');
 check(startup.expected?.candidateHash===sha&&startup.expected?.buildId===id,'Startup expected identity differs from final GIL/build');
 check(official.candidateSha256===sha&&official.buildId===id&&official.sourceCommit===frozenSource&&official.payloadDigest===receipt.payloadDigest,'Official record differs from frozen candidate identity');
 check(digest(aliasGil)===sha,'Stable alias bytes differ from final GIL');
 check(alias.sha256===sha&&alias.buildId===id&&alias.sourceCommit===frozenSource&&alias.sourceDirty===false&&alias.bytes===aliasGil.length,'Stable alias metadata differs from final GIL/build/source/length');
 return {status:errors.length?'BLOCKED':'IDENTITY_MATCH_ONLY',candidateSha256:sha,sourceCommit:frozenSource,buildId:id,errors,disclaimer:'Identity consistency only. Does not authenticate receipts, validate runtime/raw evidence, current payload, official capacity, mobile acceptance, CI or publication. Run repository gates separately.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const [frozenSource,g,r,s,o,ag,a]=process.argv.slice(2);
  if(process.argv.length!==9)throw Error('Usage: node intake.mjs <frozen-source-sha> <final.gil> <canonical-candidate.json> <startup-evidence.json> <official-evidence.json> <latest.gil> <latest.json>');
  const json=p=>JSON.parse(readFileSync(p,'utf8'));
  const result=inspect({frozenSource,gil:readFileSync(g),receipt:json(r),startup:json(s),official:json(o),aliasGil:readFileSync(ag),alias:json(a)});
  console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;
 }catch(e){console.log(JSON.stringify({status:'BLOCKED',errors:[e.message]}));process.exitCode=1;}
}
