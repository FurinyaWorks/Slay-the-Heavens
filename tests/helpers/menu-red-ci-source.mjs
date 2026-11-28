// CI-only exact text views; production projectors never import this archive.
import assert from 'node:assert/strict';
import {integratedSource,integratedRead,integratedPriorInventory} from './integrated-ci-source.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {menuCiBytes} from './menu-red-ci-binding.mjs';
import {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const menuRedCiProof=freeze(JSON.parse(gunzipSync(menuCiBytes)));
assert.equal(menuRedCiProof.schemaVersion,1);assert.equal(menuRedCiProof.baseCommit,'e805a87dc4df1a048ba5995931d98a4e4899b5e9');
for(const [path,row]of Object.entries(menuRedCiProof.files))for(const side of ['before','after']){
 const b=row[side];if(b===null)continue;
 assert.equal(typeof b.source,'string');assert.equal(norm(b.source),b.source);
 assert.equal(hash(b.source),b.sha256,path+'/'+side);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(b.source)}\0`).update(b.source).digest('hex'),b.gitBlob);
}
export function preMenuRedCiSource(path,source){
 source=integratedSource(path,source,'menu');
 const row=Object.hasOwn(menuRedCiProof.files,path)?menuRedCiProof.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.after.sha256)return source;
 return row.before.source;
}
export function menuRedPriorRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=preMenuRedCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// #1080 adds three live Lua contracts. Only this frozen Menu inventory
// projects them out, and only after authenticating the complete cohort.
const stsDetailLuaAdditions=Object.freeze({
 'tests/lua/event_option_preview.lua':{sha256:'0d32f9491fdad75fc31850d221df0a87857f2edfda2d63765fd5b5b6c9f9dd96',gitBlob:'b0565d59039b99009fa1f9f4fc904f0d58957075'},
 'tests/lua/sts_browse_keywords.lua':{sha256:'6aa39fb954ed259d28c8639a2a6115dff5b5ce8285aecee7889c29b53987c7d6',gitBlob:'dd34d14da8912495ad29aec20c82d8c4ba81b4c7'},
 'tests/lua/sts_forge_keywords.lua':{sha256:'ddebd1255693f021701c18ca208ee6bb456772a7e397727cfd88ff7a05bb2f70',gitBlob:'ba5433f38c2f15725762717d248288637be7b03c'},
});
export function menuRedPriorLua(paths,read=readFileSync){
 const additions=Object.keys(stsDetailLuaAdditions);
 if(additions.some(path=>paths.includes(path))){
  for(const path of additions){
   assert.equal(paths.filter(p=>p===path).length,1,'complete STS detail Lua inventory: '+path);
   const source=read(path,'utf8'),lf=norm(source),binding=stsDetailLuaAdditions[path];
   assert(!lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n')),'uniform STS detail Lua source: '+path);
   assert.equal(hash(lf),binding.sha256,'exact STS detail Lua source: '+path);
   assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(lf)}\0`).update(lf).digest('hex'),binding.gitBlob,'exact STS detail Lua blob: '+path);
  }
  paths=paths.filter(path=>!Object.hasOwn(stsDetailLuaAdditions,path));
 }
 paths=integratedPriorInventory(paths,'menu','lua',read);
 assert.deepEqual([...paths].sort(),menuRedCiProof.afterLua,'complete current menu Lua discovery');
 for(const [path,row]of Object.entries(menuRedCiProof.addedLua)){
  const source=beforeCurrentReplayFixes(path,read(path,'utf8'));
  assert.equal(hash(norm(source)),row.sha256,'complete added menu Lua source: '+path);
 }
 return [...menuRedCiProof.beforeLua];
}
export function extendMenuRedHelperClosure(original){
 const patch=menuRedCiProof.helperClosure,current={...original};
 assert.deepEqual(Object.keys(patch).sort(),['tests/helpers/closeout-source-epoch.mjs','tests/helpers/menu-red-production-source.json.gz','tests/helpers/menu-red-source-epoch.mjs']);
 for(const [path,row]of Object.entries(patch)){
  assert.equal(row.before,original[path]??null,'complete menu helper predecessor: '+path);
  assert.match(row.after,/^[a-f0-9]{64}$/);current[path]=row.after;
 }
 return freeze(current);
}
export function assertMenuRedCiCurrent(read=readFileSync){
 read=integratedRead('menu',{read});
 for(const [path,row]of Object.entries(menuRedCiProof.files))assert.equal(hash(norm(read(path,'utf8'))),row.after.sha256,'fresh menu CI source: '+path);
 for(const [path,row]of Object.entries(menuRedCiProof.helperClosure)){
  const value=path.endsWith('.gz')?read(path):norm(read(path,'utf8'));
  assert.equal(hash(value),row.after,'fresh menu copy dependency: '+path);
 }
}
export function renderMenuRedCiBinding(sha){
 assert.match(sha,/^[a-f0-9]{64}$/);
 return `// Fixed trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const menuCiBytes=readFileSync(new URL('./menu-red-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(menuCiBytes).digest('hex'),${JSON.stringify(sha)},'complete menu CI continuation');\n`;
}
