import {releasePreflightUnionSource} from './release-preflight-union-source.mjs';
import {fastFreezeB9Source} from './release-fast-freeze-b9-union.mjs';
import {releaseCalibrationReaderSource} from './release-calibration-reader-source.mjs';
// CI-only continuation of the exact #698 merge plus the reviewed Release gate.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-fast-b9-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6e24cdf6dae005b36b77b3cab374a833f6636df22102d019d2f99bba9827c8bf','complete Release Fast B9 CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.baseCommit,'b9bca884ed9b9831965b409885d78f719b9a567a');
assert.equal(packet.mergeCommit,'1346295a5223ff99501040a2546f4f97ac615352');
assert.equal(packet.normalization,'LF');
assert.equal(hash(packet.selectionTest.source),packet.selectionTest.sha256,'immutable standalone selection test');
for(const [path,row]of Object.entries(packet.files))assert.equal(hash(row.before.source),row.before.sha256,path+' immutable B9 source');
function currentB9Source(path,source){
 if(path!=='tests/helpers/release-bootstrap-ci-source.mjs'||hash(norm(source))!=='23ca7542e7c9b0995c3bdc8a32eed64b7fbc9131b8f9417db1475152cd3a1385')return source;
 const prior=norm(source).replace("function beforeQuickFeedbackAdvisory(path,source){\n if(path!=='.github/workflows/quick-feedback.yml'||typeof source!=='string'||source.includes('\\r\\r\\n')||hash(norm(source))!=='7eb601d4859afe2aa6331608e544205d94a3c8fdd1d864c351fdc92cad24b5f9')return source;\n const prior=norm(source).replace(\"      - name: Verify affected Release CI contracts explicitly\\n        env:\\n          BASE_SHA: ${{ github.event.pull_request.base.sha || inputs.base_sha }}\\n        run: |\\n          node --input-type=module <<'NODE'\\n          import {execFileSync} from 'node:child_process';\\n          const base=process.env.BASE_SHA;\\n          if(!/^[0-9a-f]{40}$/.test(base||''))throw new Error('exact comparison base required');\\n          const changed=execFileSync('git',['diff','--name-only','-z',base,'HEAD'],{encoding:'utf8'}).split('\\\\0');\\n          const contracts=new Set(['.github/workflows/quick-feedback.yml','scripts/release-ci.mjs','tests/helpers/release-ci.cases.mjs','tests/helpers/release-bootstrap-ci-source.mjs']);\\n          if(changed.some(path=>contracts.has(path))){\\n            console.log('Executing affected Release CI contracts: ci-impact and ci-summary-runners');\\n            execFileSync(process.execPath,['--test','tests/ci-impact.test.mjs','tests/ci-summary-runners.test.mjs'],{stdio:'inherit'});\\n          }else console.log('No Release CI contract changes');\\n          NODE\\n\",'').replace(\"    if: github.event_name == 'workflow_dispatch' || github.event.pull_request.draft == true\\n\",'');\n return hash(prior)===packet.files[path].current.sha256?prior:source;\n}\n",'')
  .replace(' source=beforeQuickFeedbackAdvisory(path,source);\n','')
  .replace(' source=beforeQuickFeedbackAdvisory(path,source);\n','')
  .replace("hash(norm(beforeQuickFeedbackAdvisory(path,read(path,'utf8'))))","hash(norm(read(path,'utf8')))");
 assert.equal(hash(prior),packet.files[path].currentSha256,'exact original 707 B9 bootstrap');
 return prior;
}
const quickPath='.github/workflows/quick-feedback.yml',quickBefore='f83265202778b448ae13f3f8839a0d36987c131bdfeb0ec671fff29539628248',quickCurrent='7eb601d4859afe2aa6331608e544205d94a3c8fdd1d864c351fdc92cad24b5f9';
export function beforeReleaseFastB9Ci(path,source,before,read=readFileSync){
 const binding=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(before&&(path===quickPath?before.sha256!==quickBefore:!binding||before.sha256!==binding.before.sha256))return source;
 source=releasePreflightUnionSource(path,source,path===quickPath?'advisory':'release');
 source=fastFreezeB9Source(path,source,'fast',read);
 if(!before)source=releaseCalibrationReaderSource(path,source,'releaseIntegration');
 if(path===quickPath){
  if(typeof source!=='string'||source.includes('\r\r\n')||before&&before.sha256!==quickBefore||hash(norm(source))!==quickCurrent)return source;
  const prior=norm(source).replace("      - name: Verify affected Release CI contracts explicitly\n        env:\n          BASE_SHA: ${{ github.event.pull_request.base.sha || inputs.base_sha }}\n        run: |\n          node --input-type=module <<'NODE'\n          import {execFileSync} from 'node:child_process';\n          const base=process.env.BASE_SHA;\n          if(!/^[0-9a-f]{40}$/.test(base||''))throw new Error('exact comparison base required');\n          const changed=execFileSync('git',['diff','--name-only','-z',base,'HEAD'],{encoding:'utf8'}).split('\\0');\n          const contracts=new Set(['.github/workflows/quick-feedback.yml','scripts/release-ci.mjs','tests/helpers/release-ci.cases.mjs','tests/helpers/release-bootstrap-ci-source.mjs']);\n          if(changed.some(path=>contracts.has(path))){\n            console.log('Executing affected Release CI contracts: ci-impact and ci-summary-runners');\n            execFileSync(process.execPath,['--test','tests/ci-impact.test.mjs','tests/ci-summary-runners.test.mjs'],{stdio:'inherit'});\n          }else console.log('No Release CI contract changes');\n          NODE\n",'').replace("    if: github.event_name == 'workflow_dispatch' || github.event.pull_request.draft == true\n",'');
  assert.equal(hash(prior),quickBefore,'exact original 707 advisory workflow');
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||before&&before.sha256!==row.before.sha256)return source;
 const original=source;
 source=currentB9Source(path,source);
 if(hash(norm(source))!==row.currentSha256)return original;
 const prior=row.before.source;
 return original.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeReleaseFastB9SelectionTest(path,source){
 if(path===quickPath)return beforeReleaseFastB9Ci(path,source);
 if(path==='tests/helpers/release-bootstrap-ci-source.mjs'&&typeof source==='string'&&!source.includes('\r\r\n'))return currentB9Source(path,source);
 const prior=beforeReleaseFastB9Ci(path,source);
 if(prior===source||path!=='tests/release-selection-map-source.test.mjs')return source;
 assert.equal(hash(norm(prior)),packet.files[path].before.sha256);
 return packet.selectionTest.source;
}
export const releaseFastB9CiBindings=Object.freeze(Object.fromEntries(Object.entries(packet.files).map(([path,row])=>[path,Object.freeze({beforeSha256:row.before.sha256,currentSha256:path==='tests/helpers/release-bootstrap-ci-source.mjs'?'23ca7542e7c9b0995c3bdc8a32eed64b7fbc9131b8f9417db1475152cd3a1385':row.currentSha256})]).concat([[quickPath,Object.freeze({beforeSha256:quickBefore,currentSha256:quickCurrent})]])));
export function releaseFastB9CiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=beforeReleaseFastB9Ci(path,text,undefined,read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
