// Historical regression fixtures, never a live-source authorization API.
// Each test opens a fresh, completely authenticated current corpus and then
// exercises the original predecessor contract on its exact immutable bytes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {handEnemyCiPacket,assertHandEnemyCiCurrent} from './hand-enemy-ci-source.mjs';
const domains=new Map();
export function prepareHandEnemyTestDomain(target){
 assertHandEnemyCiCurrent(readFileSync);
 const files=new Map();
 for(const [path,row]of Object.entries(handEnemyCiPacket.files)){
  const before=row.views[target];if(before)files.set(path,Buffer.from(before.source));
 }
 for(const path of Object.keys(handEnemyCiPacket.immutableArchives))files.set(path,Buffer.from(readFileSync(path)));
 domains.set(target,files);
}
export function handEnemyTestRead(target,path,encoding){
 const files=domains.get(target);assert(files,'historical fixture requires a fresh per-test setup');
 let bytes=files.get(path);
 if(!bytes){
  const blob=handEnemyCiPacket.viewBlobInventories[target][path];
  if(!blob)throw Object.assign(Error('unknown historical fixture path: '+path),{code:'ENOENT'});
  bytes=readFileSync(path);
  const normalized=/\.(mjs|js|json|lua|md|yml|yaml)$/.test(path)?Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n')):bytes;
  assert.equal(createHash('sha1').update(Buffer.from('blob '+normalized.length+'\0')).update(normalized).digest('hex'),blob,'exact unchanged historical fixture: '+path);
  bytes=normalized;
 }
 return encoding?bytes.toString(encoding):Buffer.from(bytes);
}
export const handTestRead=(path,encoding)=>handEnemyTestRead('hand',path,encoding);
export const enemyTestRead=(path,encoding)=>handEnemyTestRead('enemy',path,encoding);
