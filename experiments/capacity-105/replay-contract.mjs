import assert from 'node:assert/strict';
import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync} from 'node:fs';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';

export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inside=(root,path)=>{const rel=relative(root,path);return rel!==''&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../')&&!rel.startsWith('..\\');};
export function reserveOutput(path){
 if(lstatSync('build').isSymbolicLink())throw Error('Build root is a link');
 const root=realpathSync('build'),target=resolve(path);
 if(!inside(resolve('build/capacity-105'),target))
  throw Error('Output must be a new child of build/capacity-105');
 for(let parent=target;inside(root,parent);parent=dirname(parent)){
  if(existsSync(parent)&&lstatSync(parent).isSymbolicLink())throw Error('Output parent is a link');
 }
 if(existsSync(target))throw Error('Output already exists');
 mkdirSync(dirname(target),{recursive:true});mkdirSync(target);
 return target;
}
export function assertStableInputs(before,after){
 assert.deepEqual(after,before,'Experiment input changed during replay');
}
export function assertMappedModules(mapped,inventory){
 assert.equal(mapped.length,inventory.modules.length,'Mapped module count differs');
 assert.equal(new Set(mapped.map(m=>m.name)).size,mapped.length,'Duplicate mapped module');
 assert.deepEqual(mapped.map(m=>m.name).sort(),inventory.modules.map(m=>m.name).sort());
 for(const original of inventory.modules){
  if(['abyss_original_v4_data','abyss_traveler_portrait_assets'].includes(original.name))continue;
  const actual=mapped.find(m=>m.name===original.name);
  assert.equal(actual.bytes,original.bytes,'Unrelated module bytes changed');
  assert.equal(actual.sha256,original.sha256,'Unrelated module identity changed');
 }
}
export function verifyRows(rows,inventories,out){
 assert.ok(Array.isArray(rows),'Experiment coverage must be an array');
 const keys=rows.map(row=>`${row.scheme}:${row.additionalRoles}`);
 assert.equal(new Set(keys).size,keys.length,'Duplicate experiment row');
 const schemes=['independent','trimmed','shared','fallback'],counts=[0,1,2,10,20,30,100];
 assert.ok(rows.every(row=>schemes.includes(row.scheme)&&typeof row.additionalRoles==='number'
  &&counts.includes(row.additionalRoles)),'Experiment coverage has an unknown scheme or role count');
 assert.deepEqual([...keys].sort(),schemes.flatMap(scheme=>counts.map(count=>`${scheme}:${count}`)).sort(),
  'Experiment coverage must be exactly four schemes by seven role counts');
 for(const row of rows){
  const file=resolve(out,row.artifact.path);
  if(!inside(resolve(out),file))throw Error('Artifact path escape');
  const bytes=readFileSync(file);
  assert.equal(bytes.length,row.artifact.bytes,'Artifact byte mismatch');
  assert.equal(hash(bytes),row.artifact.sha256,'Artifact hash mismatch');
  const payload=gunzipSync(bytes);
  assert.equal(hash(payload),row.payloadSha256,'Payload hash mismatch');
  const decoded=JSON.parse(payload);
  assert.deepEqual(Object.keys(decoded).sort(),['cardsLua','portraitLua']);
  assert.equal(Buffer.byteLength(decoded.cardsLua),row.dataLuaBytes);
  assert.equal(Buffer.byteLength(decoded.portraitLua),row.portraitLuaBytes);
  const inventory=inventories[row.scheme==='fallback'?'fallback':'current'];
  const changed=new Set(['abyss_original_v4_data','abyss_traveler_portrait_assets']);
  assert.equal(row.mappedModuleCount,inventory.modules.length);
  assert.equal(row.changedModules.length,2);
  assert.deepEqual(new Set(row.changedModules.map(m=>m.name)),changed);
  for(const [name,body] of [['abyss_original_v4_data',decoded.cardsLua],['abyss_traveler_portrait_assets',decoded.portraitLua]]){
   const module=row.changedModules.find(m=>m.name===name);
   assert.equal(module.bytes,Buffer.byteLength(body));assert.equal(module.sha256,hash(body));
  }
  const stable=inventory.modules.filter(m=>!changed.has(m.name)).reduce((sum,m)=>sum+m.bytes,0);
  assert.equal(row.luaBytes,stable+row.dataLuaBytes+row.portraitLuaBytes,'Mapped byte total differs');
  assert.equal(row.deltaLuaBytes,row.luaBytes-inventories.current.luaBytes);
  for(const key of ['layoutJsonBytes','templateJsonBytes','controls'])assert.equal(row[key],inventory[key]);
 }
 return true;
}
