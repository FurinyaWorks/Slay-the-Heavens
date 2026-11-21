// Exact full-source continuation for historical receipts. Product tests use live files.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/sts-selection-fade-source.json',import.meta.url));
assert.equal(hash(bytes),'4480ccefd25d5f77423a95e1d3f63e298bd6f2ee7aa5f54d2119a328a3ad292b');
const {base,files}=JSON.parse(bytes);
assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
export function beforeStsSelectionFade(path,source){
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.after)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
export function beforeAuthenticatedStsSelectionFade(path,source,read){
 const prior=beforeStsSelectionFade(path,source);
 if(prior!==source)for(const [owner,row]of Object.entries(files)){
  const live=read(owner);
  assert(typeof live==='string'&&!live.includes('\r\r\n')&&hash(live.replaceAll('\r\n','\n'))===row.after,'fresh linked STS fade source: '+owner);
 }
 return prior;
}
