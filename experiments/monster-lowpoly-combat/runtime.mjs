// Real candidate Lua, game battle commands, SDK controls and software PNG.
// Test-local encounter/HP setup is explicit; this is not an official device test.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL}from 'node:url';import {createRequire}from 'node:module';import {sha}from './assets.mjs';
const [saveArg,sdkArg,rendererArg,outArg]=process.argv.slice(2);assert(saveArg&&sdkArg&&rendererArg&&outArg);const out=path.resolve(outArg);assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
const sdk=await import(pathToFileURL(path.resolve(sdkArg))),{vc}=await import(pathToFileURL(path.resolve(rendererArg))),canvas=createRequire(import.meta.url)('F:/New folder/.artifacts/art-lab-runtime/node_modules/@napi-rs/canvas');
const report={status:'running',scope:'Actual candidate Lua/GameUI/Combat + installed SDK software native controls. Synthetic five-enemy load and controlled HP setup. No official PC/phone/GPU/capacity claims.',saveSha256:sha(saveArg),sdkSha256:sha(sdkArg),rendererSha256:sha(rendererArg),scriptSha256:sha(new URL(import.meta.url)),checks:[],cold:[],stepsMs:[],warm:[],officialPC:'UNVERIFIED',physicalPhone:'UNVERIFIED',officialCapacity:'UNVERIFIED'};
let session;const enc=s=>new TextEncoder().encode(s),d=sdk.d,images=new Map(),missing=new Set();
let allocations={created:0,destroyed:0,peak:0};const observed=new WeakSet(),addRoot=sdk.Qi.prototype.addRoot;
sdk.Qi.prototype.addRoot=function(options){const map=this.controlsById;if(!observed.has(map)){observed.add(map);const put=map.set,remove=map.delete;map.set=function(k,v){if(!this.has(k)||this.get(k)!==v)allocations.created++;const r=put.call(this,k,v);allocations.peak=Math.max(allocations.peak,this.size);return r};map.delete=function(k){const r=remove.call(this,k);if(r)allocations.destroyed++;return r}}return addRoot.call(this,options)};
function value(L,i,depth=0){assert(depth<8);const t=d.lua_type(L,i);if(t===0)return null;if(t===1)return d.lua_toboolean(L,i);if(t===3)return d.lua_tonumber(L,i);if(t===4)return Buffer.from(d.lua_tolstring(L,i)).toString();if(t!==5)return '<'+t+'>';const a=d.lua_absindex(L,i),r={};d.lua_pushnil(L);while(d.lua_next(L,a)!==0){r[value(L,-2,depth+1)]=value(L,-1,depth+1);d.lua_pop(L,1)}return r;}
let L;
function check(name,source){const at=session.runtime.logs.length;session.runtime.runChunk(L,source,'MONSTER_FIT_'+name);const faults=session.runtime.logs.slice(at).filter(l=>l.level==='lua-error');assert.equal(faults.length,0,JSON.stringify(faults));report.checks.push(name);}
function query(source){const top=d.lua_gettop(L);session.runtime.runChunk(L,'function __MFC_QUERY() '+source+' end','MFC_QUERY_DEF');d.lua_getglobal(L,enc('__MFC_QUERY'));assert.equal(d.lua_pcall(L,0,1,0),0);const v=value(L,-1);d.lua_settop(L,top);return v;}
function attach(){const mounted=session.runtime.mountedScripts.find(s=>/abyss_ui(?:\.lua)?$/.test(s.path));assert(mounted);L=mounted.env;d.lua_getglobal(L,enc('OnUpdate'));let found=false;for(let i=1;i<50;i++){const k=d.lua_getupvalue(L,-1,i);if(!k)break;if(Buffer.from(k).toString()==='view'){d.lua_setglobal(L,enc('__MFC_VIEW'));found=true;break;}d.lua_pop(L,1)}d.lua_pop(L,1);assert(found);}
const count=()=>session.runtime.controlsById.size;
function step(dt=1/60){const at=performance.now();sdk.dn(session,dt);report.stepsMs.push(performance.now()-at);report.peakControls=Math.max(report.peakControls??0,count());}
async function render(name){const snapshot=sdk.ya(session,{view:true,paint:true,compact:true});const cache='F:/New folder/.artifacts/simulator-runtime/state/beyond-simulator/images/sprite-v1';for(const n of snapshot.paint??[]){if(n.kind!=='image'||n.imageId<=100006)continue;const key=`${n.imageSource??'StaticReference'}:${n.imageId}`;if(images.has(key)||missing.has(key))continue;let found=false;for(const dir of fs.readdirSync(cache)){const f=path.join(cache,dir,n.imageId+'.png');if(fs.existsSync(f)){images.set(key,await canvas.loadImage(f));found=true;break}}if(!found)missing.add(key);}
 const at=performance.now(),png=vc(snapshot.scene,snapshot.canvasWidth,snapshot.canvasHeight,{images});fs.writeFileSync(path.join(out,name+'.png'),png.data);return {pngSha256:sha(path.join(out,name+'.png')),softwareRenderMs:performance.now()-at,paintNodes:snapshot.paint.length,canvas:[snapshot.canvasWidth,snapshot.canvasHeight]};}
const setup=`local v=__MFC_VIEW;local p=v.root:GetChild('battlePanel');local s=v.run.combat;local manager=require('abyss_monster_surfaces').get(p)`;
try{
 const save=JSON.parse(fs.readFileSync(saveArg));
 const coldCycles=Number(process.env.MONSTER_COLD_CYCLES??3);report.coldCycles=coldCycles;
 for(let cycle=0;cycle<coldCycles;cycle++){
  allocations={created:0,destroyed:0,peak:0};const at=performance.now();session=sdk.Gr(save.assets.server,{templatesProject:save.assets.client,scripts:save.assets.scripts,serverConfig:save.serverLogic,canvasId:'pc-16-9',language:'LanguageChs'});const createMs=performance.now()-at;
  assert(session.runtime.logs.some(l=>l.text==='MONSTER_FIT battle ready'),JSON.stringify(session.runtime.logs));assert.equal(session.runtime.logs.filter(l=>l.level==='lua-error').length,0,JSON.stringify(session.runtime.logs));report.cold.push({cycle,initializeToBattleMs:createMs,controls:count(),heap:process.memoryUsage().heapUsed,allocations:{...allocations}});
  if(cycle<coldCycles-1){for(const r of session.runtimes??[])r.destroy();assert.equal(count(),0)}
 }
 attach();
 check('two-real-monster-art-bindings',setup+`
 assert(v.mode=='battle' and #s.enemies==2)
 for _,a in ipairs(s.enemies)do local box=assert(manager:find(a.id));assert(box:GetChild('monsterArt').visible);assert(not box:GetChild('portrait').visible);assert(box:GetChild('hp').visible)end
 assert(s.enemies[1].definitionId=='spike_slime_l' and s.enemies[2].definitionId=='lagavulin')
 `);
 for(let i=0;i<40;i++)step();report.battle=await render('two-monsters-idle');
 const beforeIds=[...session.runtime.controlsById.keys()].sort(),beforeIdleCreated=allocations.created;for(let i=0;i<120;i++)step();assert.deepEqual([...session.runtime.controlsById.keys()].sort(),beforeIds,'idle recreated controls');assert.equal(allocations.created,beforeIdleCreated);report.idleCreated=allocations.created-beforeIdleCreated;report.checks.push('120-idle-updates-no-control-recreation');
 check('gallery-fallback-and-restore',setup+`local data=require('abyss_monster_art_data');data.enabled=false;v:refresh();for _,a in ipairs(s.enemies)do local b=manager:find(a.id);assert(b:GetChild('portrait').visible and not b:GetChild('monsterArt').visible)end;data.enabled=true;v:refresh();for _,a in ipairs(s.enemies)do local b=manager:find(a.id);assert(not b:GetChild('portrait').visible and b:GetChild('monsterArt').visible)end`);
 check('ten-card-combination',setup+`require('abyss_combat').draw(s,10-#s.hand);assert(#s.hand==10);v:refresh()`);for(let i=0;i<60;i++)step();report.tenHand=await render('ten-hand');report.tenHand.controls=count();
 check('enemy-attack-command',`__MFC_VIEW.battleUI:endTurn()`);for(let i=0;i<300;i++)step();
 check('enemy-turn-completed',setup+`assert(not v.battleUI.busy and s.turn>=2)`);
 for(let round=0;round<3;round++){check('enemy-round-'+round,`__MFC_VIEW.battleUI:endTurn()`);for(let i=0;i<360;i++)step();}
 check('enemy-damage-observed',setup+`assert(not v.battleUI.busy and s.player.hp<s.player.maxHp)`);report.attack=await render('enemy-attack-completed');
 // Drive card selection and target through actual SDK hit geometry.
 const targetInfo=query(setup+`local index;for i,c in ipairs(s.hand)do if c.cardId=='strike'then index=i;break end end;assert(index);local b=manager:find(s.enemies[1].id);return {card=index,target=b:GetChild('hit').Id,hp=s.enemies[1].hp}`);
 function find(trail){let n=session.runtime.roots[0];for(const name of trail.split('/')){n=n.children.find(c=>c.name===name);assert(n,trail)}return n;}
 function tap(n,upper=false){const boxes=sdk.wi(session),b=boxes.get(n.Id),m=sdk.pa(session,boxes).get(n.Id);assert(b&&m);const p=sdk.Me(m,b.centerX,b.centerY+(upper?.45*b.height:0));sdk.vi(session,'move',p.x,p.y);const hit=sdk.vi(session,'down',p.x,p.y);step();sdk.vi(session,'up',p.x,p.y);step();const trail=c=>{const a=[];for(;c;c=c.parent)a.unshift(c.name);return a.join('/')};(report.inputs??=[]).push({expected:n.Id,expectedPath:trail(n),actual:hit?.Id,actualPath:trail(hit),x:p.x,y:p.y,localBox:b});assert.equal(hit?.Id,n.Id,'actual native hit differs');}
 tap(find('stage/battlePanel/card'+targetInfo.card+'/hit'));tap(session.runtime.controlsById.get(targetInfo.target),true);
 check('real-hit-committed',setup+`assert(s.enemies[1].hp<${targetInfo.hp})`);for(let i=0;i<8;i++)step();report.hit=await render('hit-feedback');for(let i=0;i<240;i++)step();
 // Controlled one-HP precondition permits lethal animation without changing definitions.
 check('lethal-precondition',setup+`v.battleUI.feedback:cancel();s.enemies[1].hp=1;s.energy=3;v:refresh();local i;for slot,c in ipairs(s.hand)do if c.cardId=='strike'then i=slot;break end end;assert(i);v.battleUI:playSlot(i);v.battleUI:playSelected(1)`);
 for(let i=0;i<15;i++)step();report.death=await render('death-feedback');for(let i=0;i<180;i++)step();
 check('lethal-removes-source-actor',setup+`assert(s.enemies[1].hp==0);assert(not manager:find(s.enemies[1].id))`);
 check('guard-lethal-precondition',setup+`s.enemies[2].hp=1;s.enemies[2].block=0;s.energy=3;require('abyss_combat').draw(s,10-#s.hand);v:refresh()`);for(let i=0;i<60;i++)step();
 const guardInfo=query(setup+`local index;for i,c in ipairs(s.hand)do if c.cardId=='strike'then index=i;break end end;assert(index);return {card=index,target=manager:find(s.enemies[2].id):GetChild('hit').Id}`);
 tap(find('stage/battlePanel/card'+guardInfo.card+'/hit'));tap(session.runtime.controlsById.get(guardInfo.target),true);for(let i=0;i<15;i++)step();report.guardDeath=await render('guard-death-feedback');for(let i=0;i<220;i++)step();
 check('both-dead-reward-and-surfaces-retired',setup+`assert(s.enemies[2].hp==0 and v.run.phase=='reward');assert(not manager:find(s.enemies[2].id))`);
 check('restart-battle',`MonsterFitBattle()`);for(let i=0;i<30;i++)step();
 const warmCount=count();for(let i=0;i<5;i++){const at=performance.now(),created=allocations.created,destroyed=allocations.destroyed;check('restart-'+i,'MonsterFitBattle()');for(let j=0;j<5;j++)step();report.warm.push({ms:performance.now()-at,controls:count(),created:allocations.created-created,destroyed:allocations.destroyed-destroyed});assert.equal(count(),warmCount,'restart leaks controls')}
 check('five-monsters-ten-hand',setup+`v.battleUI.feedback:cancel();v.run.combat=require('abyss_combat').new(v.run.data,{enemies={'spike_slime_l','lagavulin','spike_slime_l','lagavulin','spike_slime_l'},deck={'strike','strike','strike','strike','strike','defend','defend','defend','defend','defend'},seed=1258});for i,a in ipairs(v.run.combat.enemies)do a.sourcePosition={x=-780+(i-1)*240,y=(i%2)*140}end;require('abyss_combat').draw(v.run.combat,5);v:refresh();assert(#v.run.combat.hand==10)`);
 for(let i=0;i<30;i++)step();report.syntheticFive=await render('five-monsters-ten-hand');report.syntheticFive.controls=count();
 check('five-all-painted',setup+`for _,a in ipairs(s.enemies)do local b=assert(manager:find(a.id));assert(b:GetChild('monsterArt').visible and not b:GetChild('portrait').visible)end`);
 check('five-combo-effects',`__MFC_VIEW.battleUI:endTurn()`);for(let i=0;i<12;i++)step();report.fiveEffects=await render('five-monsters-effects');for(let i=0;i<400;i++)step();
 check('single-monster-cleanup',setup+`v.battleUI.feedback:cancel();v.run.combat=require('abyss_combat').new(v.run.data,{enemies={'spike_slime_l'},deck={'strike','strike','defend'},seed=1258});v:refresh()`);for(let i=0;i<20;i++)step();report.singleControls=count();
 check('disable-cleans',`__MFC_VIEW:disable()`);report.afterDisable=count();
 assert.equal(session.runtime.logs.filter(l=>l.level==='lua-error').length,0,JSON.stringify(session.runtime.logs));report.status='pass';
}catch(e){report.status='failed';report.error=String(e.stack);process.exitCode=1;console.error(e);}
finally{report.logs=session?.runtime.logs??[];report.missingGalleryImages=[...missing];if(session)for(const r of session.runtimes??[])r.destroy();report.remainingControls=session?.runtime.controlsById.size;report.allocations={...allocations};sdk.Qi.prototype.addRoot=addRoot;fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks,remainingControls:report.remainingControls,error:report.error}));}
