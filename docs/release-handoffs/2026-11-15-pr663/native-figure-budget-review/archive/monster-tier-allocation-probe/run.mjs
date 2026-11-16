import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {testDrawings,rowsToSlots} from './native-registry-probe.mjs';
const mode=process.argv[2]??'fixed';assert(['fixed','art-only'].includes(mode));
const out=fileURLToPath(new URL('.',import.meta.url)), repo=process.env.RELEASE_REPO?resolve(process.env.RELEASE_REPO):resolve(out,'../batch02/exact-release');process.chdir(repo);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const {prepareMonsterArt,monsterActorTemplate}=await import(pathToFileURL(join(repo,'scripts/monster-art.mjs')));
const {buildUI}=await import(pathToFileURL(join(repo,'scripts/build-ui.mjs')));
const {buildLuaData,toLua}=await import(pathToFileURL(join(repo,'scripts/build-lua-data.mjs')));
const generated=join(out,'stock-pilot-build');mkdirSync(generated,{recursive:true});
const registry=JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));
const assets=['cultist','jaw_worm','red_louse','green_louse'].map(enemy=>[enemy,'batch03-'+enemy.replaceAll('_','-'),join(process.env.BATCH03_DIR?resolve(process.env.BATCH03_DIR):resolve(out,'../batch03/final-stage'),enemy.replaceAll('_','-'),'native-layout.json')]);
const expected=testDrawings(registry,assets,toLua);
const acidPath=process.env.ACID_MEDIUM_LAYOUT??resolve(out,'../acid-medium-compat/native-layout.json');
registry.asset.slots=rowsToSlots(JSON.parse(readFileSync(acidPath)),106);
expected.acid_slime_m=registry.asset.slots;
const full=prepareMonsterArt(registry);
assert.equal(full.poolCapacity,600);
const chosen=new Set(registry.candidateAssets);
registry.additionalAssets=Object.fromEntries(Object.entries(registry.additionalAssets).filter(([id])=>chosen.has(id)));
registry.bindings=Object.fromEntries(Object.entries(registry.bindings).filter(([,id])=>chosen.has(id)));
const selected=prepareMonsterArt(registry);
assert.deepEqual(Object.keys(selected.assets).sort(),Object.keys(full.assets).sort());
for(const [id,value]of Object.entries(selected.assets))assert.deepEqual(value.slots,full.assets[id].slots);

{buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{artFeatures:{monsters:true},monsterArt:registry});}
const actorBase=monsterActorTemplate(null);
const artByTier=Object.fromEntries([41,115].map(capacity=>[capacity,monsterActorTemplate({canvas:[106,106],poolCapacity:capacity}).children[0]]));
const prefix=`local generated=require('abyss_ui_templates')
generated.AbyssMonsterActor=${toLua(actorBase)}
local tiers=${toLua(artByTier)}
local mode=${toLua(mode)}
local expected=${toLua(expected)}
`;
const fixture=prefix+readFileSync(join(out,'fixture.lua'),'utf8');
const input=join(out,'generated-'+mode+'.lua');writeFileSync(input,fixture);
const code='package.path='+JSON.stringify(generated+'/?.lua;'+join(repo,'src/lua/?.lua;'))+'..package.path;dofile('+JSON.stringify(input)+')';
const r=spawnSync(process.execPath,[join(repo,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
writeFileSync(join(out,'raw-'+mode+'.log'),r.stdout+r.stderr);console.log(r.stdout+r.stderr);if(mode==='fixed'){
 assert.equal(r.status,1);
 assert.match(r.stdout,/missing native art slot/);
 assert.match(r.stderr,/requested art not published at current tier/);
 console.log('EXPECTED_NEGATIVE_FIXED_TIER');
}else{
 assert.equal(r.status,0,String(r.error));
 for(const marker of ['REAL_FORMATION_PASS','SAME_SURFACE_SWAP_PASS','TARGET_ROUTE_PASS','RETIREMENT_PASS'])assert(r.stdout.includes(marker));
}
