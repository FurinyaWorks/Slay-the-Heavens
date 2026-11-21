// Exact full-source continuation for historical receipts. Product tests use live files.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/sts-selection-fade-source.json',import.meta.url));
assert.equal(hash(bytes),'aa738acfea89d0c38209c903dca0b0a573e217ce11c0542a022cf18e0b784717');
const {base,files,inventory}=JSON.parse(bytes);
assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
export function beforeStsSelectionFade(path,source){
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
export function beforeAuthenticatedStsSelectionFade(path,source,read){
 const prior=beforeStsSelectionFade(path,source);
 if(prior!==source)for(const [owner,row]of Object.entries(files)){
  if(!owner.startsWith('src/'))continue; // Detached production fixtures intentionally copy only source owners.
  let live;try{live=read(owner);}catch{assert.fail('fresh linked STS fade source missing: '+owner);}
  assert(typeof live==='string'&&!live.includes('\r\r\n')&&hash(live.replaceAll('\r\n','\n'))===row.after,'fresh linked STS fade source: '+owner);
 }
 return prior;
}

export function stsCurrentJsDiscovery(paths,read=readFileSync){
 assert.deepEqual([...paths].sort(),[...inventory.before,inventory.addition].sort(),'complete STS raw JS discovery inventory');
 const source=read(inventory.addition,'utf8');
 assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(source.replaceAll('\r\n','\n'))===inventory.sha256,'fresh STS added test source');
 return paths.filter(path=>path!==inventory.addition);
}
export function stsHistoricalJsDiscovery(paths,read=readFileSync){
 return paths.includes(inventory.addition)?stsCurrentJsDiscovery(paths,read):paths;
}
