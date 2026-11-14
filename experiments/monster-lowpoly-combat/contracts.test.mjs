import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {asset,registry,adaptCardDisplay,sha}from './assets.mjs';import {monsterActorTemplate}from '../../scripts/monster-art.mjs';
test('all six actual placement outputs honor native budgets and use only legal primitives',()=>{
 for(const [id,budgets]of [['large-geo-slime',[100,200,350]],['ruin-guard',[200,350,500]]])for(const b of budgets){const a=asset(id,b);assert(a.slots.length>0&&a.slots.length<=b);assert(a.slots.every(s=>[100001,100002,100003].includes(s.image)));assert(a.slots.some(s=>s.image===100002),'source-derived eye/core ellipses missing');assert(a.slots.some(s=>s.fitHalf),'masked fallback must remain represented');}
});
test('all three candidate registries retain bounded production actor groups and exact source identities',()=>{
 const sourceBefore=sha('data/presentation/native-monster-art.json');
 for(const [s,g]of [[200,350],[350,500],['old','old']]){const r=registry(s,g),t=monsterActorTemplate(r);assert.deepEqual(r.bindings,{spike_slime_l:'large-geo-slime',lagavulin:'ruin-guard'});function visit(n){assert((n.children??[]).length<=60,n.name);for(const c of n.children??[])visit(c)}visit(t);assert(r.poolCapacity<=600);for(const a of Object.values(r.assets))assert.equal(a.capacity,r.poolCapacity);}
 assert.equal(sha('data/presentation/native-monster-art.json'),sourceBefore);assert.equal(registry('old','old').assets['ruin-guard'].slots.length,590);
});
test('unknown budgets fail rather than silently selecting another art variant',()=>{for(const args of [[0,500],[350,999],[NaN,500],['../',500]])assert.throws(()=>registry(...args));});
test('candidate half-fill adapter rejects runtime drift and accepts actual LF/CRLF source',()=>{const source=fs.readFileSync('src/lua/abyss_card_display.lua','utf8');for(const s of [source.replaceAll('\r\n','\n'),source.replaceAll('\r\n','\n').replaceAll('\n','\r\n')]){const result=adaptCardDisplay(s);assert(result.includes('SetFillHorizontal(Enum.ImageFillHorizontalType.Right,.5)'));assert(result.includes('control:SetFillUnused()'));}assert.throws(()=>adaptCardDisplay('return {}'));});
