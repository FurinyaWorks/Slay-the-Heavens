// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./mobile-forethought-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'d8c9875fbc221614d01ed752cc851b7a502e3f9ec09f7aa749c1de3c671277de','complete mobile forethought production packet');
export const mobileForethoughtSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendMobileForethoughtSource(original,packet=mobileForethoughtSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'f564aea6a3c517b71a85534a81be5e2e36278baf');
 assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.deepEqual(packet.prerequisites,['f564aea6a3c517b71a85534a81be5e2e36278baf']);
 assert.deepEqual(packet.originalSources,mobileForethoughtSourcePacket.originalSources,'exact original forethought source producers');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,mobileForethoughtSourcePacket.currentCommit,'exact committed mobile forethought producer');
 assert.deepEqual(packet.current,mobileForethoughtSourcePacket.current,'complete approved mobile forethought after bindings');
 assert.deepEqual(packet.producers,mobileForethoughtSourcePacket.producers,'exact mobile forethought source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete mobile forethought before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 assert.deepEqual(packet.inheritedSources,mobileForethoughtSourcePacket.inheritedSources,'exact inherited potion corpus');
 assert.deepEqual(packet.combinedProducers,mobileForethoughtSourcePacket.combinedProducers,'real five-owner producer lineage');
 for(const [path,row]of Object.entries(packet.inheritedSources))assert.deepEqual(row,prior.current[path],'unchanged inherited potion owner: '+path);
 assert.deepEqual(packet.dataTheme,mobileForethoughtSourcePacket.dataTheme,'exact separately registered data theme');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete mobile forethought predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed mobile forethought owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'mobileForethoughtPrior'));
 targets.mobileForethoughtPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed mobile forethought repair; official candidate and device acceptance remain independent',
  mobileForethoughtProducers:packet.producers,mobileCombinedProducers:packet.combinedProducers,mobileForethoughtTheme:packet.dataTheme}),{allowConfigLayout:true,reuseFrozenInput:true});
}

// The generic runtime projector intentionally accepts only config/src paths.
// Keep data-theme source identity and its inverse explicit and complete.
export function assertMobileForethoughtDataThemeCurrent(read=(p)=>readFileSync(p,'utf8')){
 const p=mobileForethoughtSourcePacket;
 for(const [path,row]of Object.entries({...p.inheritedSources,...p.current,[p.dataTheme.path]:p.dataTheme.current})){
  const source=read(path),message='fresh complete forethought runtime and data theme: '+path;
  assert.equal(typeof source,'string',message);
  assert.equal(hash(source.replaceAll('\r\n','\n')),row.sha256,message);
 }
}
export function preMobileForethoughtDataThemeSource(path,source,{readSource}={}){
 const p=mobileForethoughtSourcePacket,row=p.dataTheme;
 if(path!==row.path||typeof source!=='string'||hash(source.replaceAll('\r\n','\n'))!==row.current.sha256)return source;
 assertMobileForethoughtDataThemeCurrent(readSource);
 return row.before.source;
}
