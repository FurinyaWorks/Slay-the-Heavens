import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
// Run from the repository root.
const root=process.cwd();
const {assertSettingsMapCurrent,settingsMapSource,settingsMapPacket}=await import(root+'/tests/helpers/settings-map-integration.mjs');
const {integratedPriorInventory,integratedCurrentInventory,assertIntegratedCurrent}=await import(root+'/tests/helpers/integrated-ci-source.mjs');
const r=JSON.parse(gunzipSync(readFileSync('tests/helpers/settings-map-inventory-repair.json.gz')));
assert.equal(r.before,execFileSync('git',['show','6cdfd8dbe23aa115e45c1c37a5bc7883d0c46c41:'+r.path],{encoding:'utf8'}));assert.equal(r.current,readFileSync(r.path,'utf8'));
let n=2;assertSettingsMapCurrent();assertIntegratedCurrent();n+=2;
for(const kind of ['js','lua'])for(const target of ['selection','release','native']){const out=integratedPriorInventory(integratedCurrentInventory(kind),target,kind);if(target==='native')assert.deepEqual(integratedPriorInventory(out,target,kind),out);else assert.throws(()=>integratedPriorInventory(out,target,kind));n++;}
for(const p of [...Object.keys(settingsMapPacket.files),...Object.keys(settingsMapPacket.archives),'tests/helpers/settings-map-inventory-repair.json.gz']){
 for(const mode of ['missing','empty','drift']){
  const read=(path,enc)=>{if(path!==p)return readFileSync(path,enc);if(mode==='missing')throw Error('missing '+p);const x=readFileSync(path,enc);return mode==='empty'?(typeof x==='string'?'':Buffer.alloc(0)):(typeof x==='string'?x+'\n':Buffer.concat([x,Buffer.from('\n')]));};
  assert.throws(()=>integratedPriorInventory(integratedCurrentInventory(),'selection','js',read),p+' '+mode);n++;
 }
}
assertSettingsMapCurrent();n++;
assert.throws(()=>assertSettingsMapCurrent((p,e)=>p===r.path?readFileSync(p):readFileSync(p,e)));n++;
const crlf=(p,e)=>{const x=readFileSync(p,e);return typeof x==='string'?x.replaceAll('\n','\r\n'):x;};assertSettingsMapCurrent(crlf);n++;
assert.equal(settingsMapSource('foreign','x'),'x');assert.equal(settingsMapSource(r.path,r.current+'\n'),r.current+'\n');assert.equal(settingsMapSource(r.path,null),null);n+=3;
console.log(JSON.stringify({status:'PASS',checks:n,gitBeforeExact:true,currentExact:true}));
