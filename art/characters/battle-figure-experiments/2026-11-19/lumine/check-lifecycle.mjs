/** Drive each exact bound GIL Lua body using the established image-only native API mock. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {runInThisContext} from 'node:vm';
import {createHash} from 'node:crypto';
const [tool, fengariPath, fixture, literalPath, reportPath] = process.argv.slice(2).map(p=>path.resolve(p));
const require = createRequire(import.meta.url), fengari = require(fengariPath);
const fn= (a,b)=>path.join(a,b);
const read=f=>fs.readFileSync(f), json=f=>JSON.parse(read(f));
const sha=(b,how='sha256')=>createHash(how).update(b).digest('hex');
const proof=json(reportPath), literal=json(literalPath);
const {listClientScripts}=await import(pathToFileURL(path.join(tool,'src/scene-save.mjs')));
const mapPath=fn(path.dirname(reportPath),proof.file);
assert.equal(sha(read(mapPath)),proof.sha256);
assert.equal(sha(read(literalPath)),proof.literalSHA256);
const checker=read(fixture), blob=sha(Buffer.concat([Buffer.from(`blob ${checker.length}\0`),checker]),'sha1');
assert.equal(blob,'ced76db25cd9e386d9c2dd683ea8f0aeef1b35aa');
const source=checker.toString('utf8');
const start=source.indexOf('function vm(script) {'), end=source.indexOf('\nvm(source)(');
assert(start>0&&end>start);
const exact=runInThisContext(`(deps=>{const {assert,lua,lauxlib,lualib,to_luastring,to_jsstring,maskSlots,controlCount}=deps;${source.slice(start,end)}return vm})`)(
 {...fengari,assert,maskSlots:[],controlCount:60});
const {lua,lauxlib,lualib,to_luastring}=fengari;
const init=lualib.luaL_openlibs,allocate=lauxlib.luaL_newstate;
lualib.luaL_openlibs=L=>{
 init(L);
 assert.equal(lauxlib.luaL_dostring(L,to_luastring('io=nil;os=nil;package=nil;require=nil;dofile=nil;loadfile=nil;load=nil;fengari=nil;debug=nil')),lua.LUA_OK);
};
let state;
lauxlib.luaL_newstate=()=>(state=allocate());
const saved=listClientScripts({mapPath,includeSource:true}).scripts;
const results=[];
for(const b of proof.batches){
 const src=saved.find(s=>s.scriptId===b.scriptId).source;
 assert.equal(sha(src),b.boundSHA256);
 const run=exact(src);
 try {
  run(`
  function BindTemplate(failAt, failSetter)
    local create = game.InstantiateClientUIControl
    local n=0
    game.InstantiateClientUIControl=function(id,parent)
        assert(id==${proof.template.id})
        n=n+1
        if n==failAt and not failSetter then return nil end
        local c=create(1234,parent)
        if n==failAt and failSetter then c.SetSizeDelta=function()error("injected setter")end end
        return c
    end
    return create
  end
  function LiveCount()local n=0;for _,c in ipairs(controls)do if c.alive then n=n+1 end end;return n end
  nativeMock = BindTemplate()
  OnStart(); assert(#errors == 0 and LiveCount() == ${b.count}, table.concat(errors,'|'))
  `);
  const batchRows=literal.rows.slice(b.start,b.start+b.count);
  for(const [i,r] of batchRows.entries()){
   const control=`controls[${i+1}]`;
   const v=(name,expected)=>expected.map((value,j)=>`assert(math.abs(${control}.${name}[${j+1}] - (${value}))<0.00021, "${b.name} #${i+1} ${name}")`).join(';');
   run(`assert(${control}.asset==${r[0]} and ${control}.source=='static' and ${control}.top and ${control}.parent==script.object and not ${control}.enableMask);
   ${v('SetAnchoredPositionValue',r.slice(1,3))};${v('SetSizeDeltaValue',r.slice(3,5))};${v('SetPivotValue',r.slice(5,7))};
   ${v('SetAnchorMinValue',r.slice(7,9))};${v('SetAnchorMaxValue',r.slice(9,11))};${v('SetLocalScaleValue',r.slice(11,13))};
   ${v('SetLocalRotationValue',[...literal.rotations[b.start+i],r[13]])};${v('imageColor',r.slice(14,18))}`);
  }
  run(`OnStart(); assert(LiveCount()==${b.count} and destroyed==${b.count} and #errors==0)
  OnDestroy(); OnDestroy(); assert(LiveCount()==0 and destroyed==${b.count*2})
  game.InstantiateClientUIControl=nativeMock; BindTemplate(${Math.min(10,b.count)});
  OnStart(); assert(#errors==1 and LiveCount()==0)
  OnStart(); assert(#errors==1 and LiveCount()==${b.count})
  OnDestroy(); assert(LiveCount()==0)
  game.InstantiateClientUIControl=nativeMock; BindTemplate(${Math.min(10,b.count)},true);
  OnStart(); assert(#errors==2 and LiveCount()==0)
  OnStart(); assert(#errors==2 and LiveCount()==${b.count})
  OnDestroy(); OnDestroy(); assert(LiveCount()==0)`);
 } finally { lua.lua_close(state); }
 results.push({group:b.name,images:b.count,verifiedOrderedControlRows:b.count,verification:'create/recreate; all transforms including rotation X/Y/Z; asset IDs/RGBA/order; destroy/idempotence; nil instantiation and setter rejection both clean/recover'});
}
const result={scope:'Exact Lua bodies read from fixture-derived GIL, existing Fengari/native API mock verification, NOT official import or device runtime',gilSHA256:proof.sha256,literalSHA256:proof.literalSHA256,checkerGitBlob:blob,templateIndex:proof.template.id,verifiedImages:results.reduce((x,r)=>x+r.images,0),extraMasks:0,results};
assert.equal(result.verifiedImages,proof.count.predictedNativeImagesOnStart);
fs.writeFileSync(path.join(path.dirname(reportPath),'lua-lifecycle.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
