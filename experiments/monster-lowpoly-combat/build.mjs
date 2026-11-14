// Extends a validated current-source baseline; preserves all other modules and graphs.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL}from 'node:url';import {createHash,randomUUID}from 'node:crypto';
import {registry,adaptCardDisplay,sha}from './assets.mjs';import {monsterActorTemplate,monsterActorInventory}from '../../scripts/monster-art.mjs';
import {loadNativeUiEncoder}from '../../scripts/native-ui-encoder.mjs';import {embeddedScripts}from '../../scripts/native-script-inventory.mjs';import {writeScriptBatch}from '../../scripts/native-script-batch.mjs';import {runNativeClientCheck}from '../../scripts/native-client-check.mjs';import {nativeUiVariables}from '../../scripts/native-candidate-scripts.mjs';import {toLua}from '../../scripts/build-lua-data.mjs';
const [baseArg,outArg,slimeArg='350',guardArg='500']=process.argv.slice(2);assert(baseArg&&outArg);const out=path.resolve(outArg);assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
const base=JSON.parse(fs.readFileSync(baseArg));assert.equal(sha(base.candidate.path),base.candidate.sha256);assert.equal(base.statuses.staticCheck,'pass');
const tool=process.env.MILIASTRA_MCP_ROOT??'D:/MiliastraTools/genshin-miliastra-mcp';const {native}=await loadNativeUiEncoder(tool),wire=await import(pathToFileURL(tool+'/src/scene/wire.mjs')), {luaSyntaxError}=await import(pathToFileURL(tool+'/src/client-check.mjs'));
let mapPath=path.join(out,'base.gil');fs.copyFileSync(base.candidate.path,mapPath);
const parse=b=>b==='old'?'old':Number(b);
const data=registry(parse(slimeArg),parse(guardArg));const template=monsterActorTemplate(data);template.name='MonsterFitActor';
function fill(n){if(/^shape[0-9]+$/.test(n.name))n.fill={shape:'horizontal',from:'right',amount:1};for(const c of n.children??[])fill(c)}fill(template);
const actor=native.addClientTemplate({mapPath,...template,outputName:'monster-fit-actor'},out);mapPath=actor.mapPath;
const scripts=embeddedScripts({mapPath,includeSource:true},wire).scripts,sources=new Map(scripts.map(s=>[s.name,s.source]));
const binding=sources.get('abyss_monster_actor_binding').replace(/templateIndex=\d+/,`templateIndex=${actor.templateIndex}`);
sources.set('abyss_monster_actor_binding',binding);sources.set('abyss_monster_art_data','return '+toLua(data)+'\n');sources.set('abyss_card_display',adaptCardDisplay(sources.get('abyss_card_display')));
assert.equal(sources.get('abyss_art_features').split('monsters=false').length,2);
sources.set('abyss_art_features',sources.get('abyss_art_features').replace('monsters=false','monsters=true'));
const buildId=randomUUID();sources.set('abyss_ui',sources.get('abyss_ui').replace(/^print\("ABYSS_BUILD [^"]+"\)\n/,`print("ABYSS_BUILD ${buildId}")\n`)+fs.readFileSync(new URL('./demo.lua',import.meta.url),'utf8'));
const modified=['abyss_monster_actor_binding','abyss_monster_art_data','abyss_card_display','abyss_art_features','abyss_ui'];
mapPath=writeScriptBatch(mapPath,modified.map(name=>({name,source:sources.get(name),...(name==='abyss_ui'?{variables:[...nativeUiVariables(),{name:'monsterFitDemo',type:'boolean',value:true,public:true}]}:{})})),out,{...wire,clientScriptRecord:native.clientScriptRecord,luaSyntaxError});
const check=runNativeClientCheck({mapPath},tool);fs.writeFileSync(path.join(out,'native-check.json'),JSON.stringify(check,null,2));assert(check.ok);
const actual=embeddedScripts({mapPath,includeSource:true},wire).scripts;assert.equal(actual.length,scripts.length);for(const s of actual)assert.equal(s.source,sources.get(s.name),'independent readback '+s.name);
const candidatePath=path.join(out,'monster-lowpoly-combat.gil');fs.copyFileSync(mapPath,candidatePath);
const hash=s=>createHash('sha256').update(s).digest('hex');const receipt={schemaVersion:1,buildId,sourceCommit:base.sourceCommit,sourceDirty:true,candidate:{path:candidatePath,sha256:sha(candidatePath),bytes:fs.statSync(candidatePath).size},moduleDigests:Object.fromEntries(actual.map(s=>[s.name,hash(s.source)])),statuses:{staticCheck:'pass',officialImport:'not_run',playtest:'not_run'},
 experiment:{kind:'monster-lowpoly-combat',release:false,baseReceipt:{path:path.resolve(baseArg),sha256:sha(baseArg)},baseCandidate:base.candidate,sourceCommit:base.sourceCommit,modifiedModules:modified,unchangedModules:scripts.length-modified.length,nativeTemplateNames:['MonsterFitActor'],builderSha256:sha(new URL('./build.mjs',import.meta.url)),assetsSha256:sha(new URL('./assets.mjs',import.meta.url)),demoSha256:sha(new URL('./demo.lua',import.meta.url)),inventory:monsterActorInventory(template),assets:Object.values(data.assets).map(a=>({id:a.enemyId,budget:a.budget,images:a.slots.length,sourceSha256:a.sourceSha256,packSha256:a.jsonSha256})),officialPC:'UNVERIFIED',physicalPhone:'UNVERIFIED',officialCapacity:'UNVERIFIED'}};
fs.writeFileSync(path.join(out,'candidate.json'),JSON.stringify(receipt,null,2));fs.writeFileSync(path.join(out,'registry.json'),JSON.stringify(data));fs.writeFileSync(path.join(out,'actor-template.json'),JSON.stringify(template));console.log(path.join(out,'candidate.json'));
