import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/workspace/work/monster-fit-evidence');
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const {runLua}=await import(pathToFileURL(path.join(root,'scripts/test-lua.mjs')));
const {toLua,luaString}=await import(pathToFileURL(path.join(root,'scripts/build-lua-data.mjs')));
fs.mkdirSync(out,{recursive:true});
const original='d31c400972d380d119c48e4ef92573670cd5a2e8';
const old=spawnSync('git',['show',original+':experiments/monster-low-budget/switch.lua'],{encoding:'utf8'});
assert.equal(old.status,0);fs.writeFileSync(path.join(out,'switch-original.lua'),old.stdout);
const results=[];
for(const [name,controller] of [['before',path.join(out,'switch-original.lua')],['after',path.join(root,'experiments/monster-low-budget/switch.lua')]]){
 const wrapper=path.join(out,'probe-'+name+'.lua');
 fs.writeFileSync(wrapper,`arg={[1]=${luaString(controller)}};dofile(${luaString(path.join(root,'experiments/monster-low-budget/switch.test.lua'))})\n`);
 const result=runLua(wrapper);fs.writeFileSync(path.join(out,'switch-'+name+'.log'),result.stdout+result.stderr);
 assert.equal(result.status,name==='before'?1:0);
 if(name==='before')assert.match(result.stderr,/LATEST_REQUEST_LOST/);
 results.push({name,status:result.status,controllerSha256:sha(controller),logSha256:sha(path.join(out,'switch-'+name+'.log'))});
}
const theme=JSON.parse(fs.readFileSync('data/presentation/ui_theme.json'));
const probe=path.join(out,'geometry-probe.lua');
fs.writeFileSync(probe,`package.loaded.abyss_theme=${toLua(theme)}\nlocal view=require('abyss_battle_enemy_view')\nfor _,id in ipairs({'jaw_worm','hexaghost'})do local g=view.geometry({definitionId=id});print(id,g.portrait,g.hitWidth,g.hitHeight,g.healthY,g.intentY)end\n`);
const result=runLua(probe);assert.equal(result.status,0,result.stdout+result.stderr);
fs.writeFileSync(path.join(out,'geometry.log'),result.stdout);
const geometry=Object.fromEntries(result.stdout.trim().split(/\r?\n/).map(line=>{const [enemy,...values]=line.split(/\s+/);return [enemy,Object.fromEntries(['portrait','hitWidth','hitHeight','healthY','intentY'].map((key,i)=>[key,Number(values[i])]))]}));
fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify(geometry,null,2)+'\n');
const receipt=JSON.parse(fs.readFileSync('build/monster-low-budget/fit-receipt.json'));
const packs=[];
for(const sample of receipt.samples)for(const budget of [100,200,400]){
 const file=`build/monster-low-budget/${sample.enemy}/budget-${budget}.json`,pack=JSON.parse(fs.readFileSync(file));
 const count=pack.shapes.reduce((n,shape)=>n+(shape.type==='polygon'?2:1),0);
 assert.equal(pack.sourceSha256,sample.sourceSha256);assert.equal(count,pack.nativeImages);assert(count>0&&count<=budget);assert.equal(pack.opaqueBackground,false);
 packs.push({enemy:sample.enemy,budget,images:count,packBytes:fs.statSync(file).size,sha256:sha(file)});
}
const inputs=['experiments/monster-low-budget/fit.py','experiments/monster-low-budget/switch.lua','experiments/monster-low-budget/switch.test.lua','scripts/art/segment-lowpoly.py','scripts/art/native-triangle-placement.py','src/lua/abyss_battle_enemy_view.lua','src/lua/abyss_monster_source_geometry.lua','data/presentation/ui_theme.json'];
fs.writeFileSync(path.join(out,'replay.json'),JSON.stringify({schemaVersion:1,baseSha:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),sourceStudy:original,workingTree:'dirty experimental slice; input hashes below identify actual files',scope:'Fresh geometric fitting and real Lua controller with a minimal fake host. Not SDK-native rendering, official import, capacity or devices.',officialCapacity:'UNVERIFIED',officialClient:'NOT_RUN',physicalMobile:'NOT_RUN',sdkReplay:'NOT_RUN',geometry,inputs:inputs.map(file=>({path:file,sha256:sha(file)})),controllerRegression:results,packs},null,2)+'\n');
console.log(JSON.stringify({controllerRegression:results.map(({name,status})=>({name,status})),geometry,packs:packs.map(({enemy,budget,images})=>({enemy,budget,images}))}));
