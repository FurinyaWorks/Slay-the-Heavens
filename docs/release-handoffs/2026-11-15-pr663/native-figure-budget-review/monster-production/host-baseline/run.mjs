import {resolve,join} from 'node:path';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=process.cwd(),out=fileURLToPath(new URL('.',import.meta.url));
const {buildUI}=await import(pathToFileURL(resolve('scripts/build-ui.mjs')));
const {prepareMonsterArt}=await import(pathToFileURL(resolve('scripts/monster-art.mjs')));
const generated=join(out,'build');mkdirSync(generated,{recursive:true});
prepareMonsterArt();
const registry=JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));delete registry.candidateAssets;
if(!process.argv.includes('--reuse-generated'))buildUI(generated,undefined,{artFeatures:{monsters:true},monsterArt:registry});
assert.match(readFileSync(join(generated,'abyss_art_features.lua'),'utf8'),/monsters=true/);
const fixturePath='tests/lua/support/native_monster_art_host.lua';
const original=readFileSync(fixturePath,'utf8');
let src=original;
function replace(needle,to) {
 assert.equal(src.split(needle).length,2,'fixture anchor changed: '+needle.slice(0,80));
 src=src.replace(needle,to);
}
const lua=JSON.stringify;
replace("local Run=require('abyss_run')",`local Probe=dofile(${lua(join(out,'observe-art.lua'))})\nlocal Run=require('abyss_run')`);
replace("Native.decorate(box:GetChild('monsterArt'))end","Native.decorate(box:GetChild('monsterArt'));Probe.attach(box:GetChild('monsterArt'))end");
replace('for _=1,12 do host:update(1/60)end',"Probe.begin('idle-two-bound-12');for _=1,12 do host:update(1/60)end;Probe.finish()");
replace("local id=state.enemies[2].id",`local aliveId=state.enemies[2].id
local hpOriginal=state.enemies[2].hp
local aliveStrike
for slot,card in ipairs(state.hand)do if card.cardId=='strike' then aliveStrike=slot;break end end
assert(aliveStrike and hpOriginal>6)
panel:GetChild('card'..aliveStrike):GetChild('hit').click();box:GetChild('hit').click()
assert(state.enemies[2].hp<hpOriginal and state.enemies[2].hp>0)
Probe.begin('nonlethal-hit-120')
for _=1,120 do host:update(.01) end
Probe.finish()
assert(not ui.feedback.dying[aliveId] and art.visible)
ui.feedback:cancel()
state=battle({'cultist','acid_slime_m','acid_slime_m'});arts=drawings(state);art=arts[2]
box=boxFor(state.enemies[2]);portrait=box:GetChild('portrait')
local id=state.enemies[2].id`);
replace('for _=1,100 do host:update(.01);if ui.feedback.dying[id]then break end end',"Probe.begin('lethal-windup-through-contact');for _=1,100 do host:update(.01);if ui.feedback.dying[id]then break end end;Probe.finish()");
replace('host:update(.05)\nassert(near(art.localScaleY',"Probe.begin('post-contact-first-death-sample');host:update(.05);Probe.finish()\nassert(near(art.localScaleY");
replace('for _=1,150 do if not ui.busy then break end;host:update(.01)end',"Probe.begin('death-during-action');for _=1,150 do if not ui.busy then break end;host:update(.01)end;Probe.finish()");
replace("local counts={}\nfor i=1,#arts",`Probe.begin('first-update-six-bound');host:update(1/60);Probe.finish()
Probe.begin('steady-idle-six-bound-120');for _=1,120 do host:update(1/60)end;Probe.finish()
local counts={}
for i=1,#arts`);
const instrumented=join(out,'instrumented.lua');writeFileSync(instrumented,src);
const source="package.path="+lua(generated+"/?.lua;"+resolve("build/formal")+"/?.lua;"+resolve("src/lua")+"/?.lua;")+"..package.path;dofile("+lua(instrumented)+")";
const result=spawnSync(process.execPath,[resolve("node_modules/fengari-node-cli/src/lua-cli.js"),'-e',source],{cwd:root,encoding:'utf8',timeout:125000,maxBuffer:4e6});
writeFileSync(join(out,'raw.log'),result.stdout+result.stderr);
console.log(result.stdout);console.error(result.stderr);assert.equal(result.status,0,String(result.error));
assert.match(result.stdout,/NATIVE_MONSTER_HOST_PASS/);
const cases=Object.fromEntries(result.stdout.split('\n').filter(l=>l.startsWith('MONSTER_ART_COUNTS\t')).map(l=>{
 const [,k,reads,readAll,tint,identical,image,rotation]=l.split('\t');return [k,{GetChild:+reads,GetChildren:+readAll,imageColor:+tint,identicalRGBA:+identical,SetImage:+image,SetLocalRotation:+rotation}];
}));
assert.equal(Object.keys(cases).length,7);
assert.equal(cases['idle-two-bound-12'].imageColor,0);
assert.equal(cases['steady-idle-six-bound-120'].imageColor,0);
assert(cases['post-contact-first-death-sample'].imageColor>0);
const report={base:'1cc5479b713edab6fd26db4e20f8eb22b7401cb2',fixture:fixturePath,fixtureSha256:createHash('sha256').update(original).digest('hex'),catalog:'existing explicit monsters:true full-catalog test; static accepted fixture, not 44/119 enabled production',cases};
writeFileSync(join(out,'counts.json'),JSON.stringify(report,null,2)+'\n');
