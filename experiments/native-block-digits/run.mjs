// Reproduce and reject an insufficient UI fix; this is not a passing product test.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildLuaData,luaString} from '../../scripts/build-lua-data.mjs';
import {buildUI} from '../../scripts/build-ui.mjs';
import {runLua} from '../../scripts/test-lua.mjs';
import {page} from '../../scripts/official-assets-preview.mjs';

const out=resolve(process.argv[2]??'build/native-block-digits-study');
const baselineCommit='9f2f44e4c79789fbcb64a515938765dbc240f830';
const baseline=spawnSync('git',['diff','--name-only',baselineCommit,'--','src/lua','scripts','data','config','tests/lua/support','package.json','package-lock.json'],{encoding:'utf8'});
assert.equal(baseline.status,0,baseline.stderr);assert.equal(baseline.stdout.trim(),'','runtime must match the reviewed source base');
mkdirSync(out,{recursive:true});buildLuaData();buildUI();
const target='src/lua/abyss_battle_unit_view.lua';
const source=readFileSync(target,'utf8').replaceAll('\r\n','\n');
const hash=value=>createHash('sha256').update(value).digest('hex');
const original='            return source.blockX,position,source.blockWidth,height';
assert.equal(source.split(original).length,2,'candidate requires the exact current source branch');
const candidate=source.replace(original,`            local width=math.max(source.blockWidth,chip)
            local padding=name=='blockEdge' and S.border*2 or 0
            local x=barX-barWidth/2-L.blockBadge.gap-S.border*2-width/2
            return x,position,width+padding,height`);
const results=[];
for(const [name,input]of [['baseline',source],['widen-left',candidate]]){
 const entry=out+'/'+name+'.lua';
 writeFileSync(entry,`package.preload.abyss_battle_unit_view=assert(load(${luaString(input)},'@${target}'))\ndofile('experiments/native-block-digits/capture.lua')\n`);
 const r=runLua(entry);
 assert.equal(r.status,1,'current experiment must retain the unresolved product failure');
 writeFileSync(out+'/'+name+'.log.gz',gzipSync(r.stdout+r.stderr));
 const lines=(r.stderr??'').split('\n');
 const problems=lines.filter(line=>/clips Block|invades own HP|covers neighbour/.test(line));
 assert(problems.length>0,'expected named geometry diagnostics, not a harness error');
 const encoded=r.stdout.split('\n').find(line=>line.startsWith('OFFICIAL_VISUAL_SCENES '));
 assert(encoded,'real Host export missing');
 const scenes=JSON.parse(encoded.slice(23));assert.equal(scenes.length,4);
 let actors=0;
 const walk=node=>{if(node.name==='AbyssMonsterActor')actors++;for(const c of Object.values(node.children??{}))walk(c);};
 for(const scene of scenes){walk(scene.tree);writeFileSync(out+'/'+name+'-'+scene.name+'.html',page(scene));}
 assert.equal(actors,15,'all 5 pressure + 1 boss + 5 slimes + 4 gremlins must be exported');
 writeFileSync(out+'/'+name+'-scenes.json',JSON.stringify(scenes,null,2));
 results.push({name,sourceSha256:hash(input),productStatus:'FAIL',
  clippedDigits:problems.filter(line=>line.includes('clips Block')).length,
  ownHpOverlaps:problems.filter(line=>line.includes('invades own HP')).length,
  neighbourOverlaps:problems.filter(line=>line.includes('covers neighbour')).length,
  problems,sceneCount:scenes.length,actorCount:actors});
}
assert(results[0].clippedDigits>0&&results[0].ownHpOverlaps>0,'baseline must reproduce both confirmed source defects');
assert.equal(results[1].clippedDigits,0);assert.equal(results[1].ownHpOverlaps,0);
assert(results[1].neighbourOverlaps>results[0].neighbourOverlaps,'reject the proposed fix for expanding real adjacency failures');
assert.equal(hash(readFileSync(target,'utf8').replaceAll('\r\n','\n')),hash(source),'experiment changed production source');
const identityPaths=[target,'experiments/native-block-digits/run.mjs','experiments/native-block-digits/capture.lua',
 'src/lua/abyss_battle_enemy_view.lua','src/lua/abyss_monster_source_geometry.lua',
 'src/lua/abyss_encounter_formation.lua','src/lua/abyss_battle_render_actors.lua',
 'scripts/build-ui.mjs','scripts/ui-layout.mjs','scripts/official-assets-preview.lua',
 'scripts/official-assets-preview.mjs','tests/lua/support/game_ui_fixture.lua',
 'build/lua/abyss_ui_templates.lua','build/lua/abyss_theme.lua','build/lua/abyss_data.lua'];
for(const dir of ['src/lua','build/lua'])for(const entry of readdirSync(dir,{recursive:true}))if(entry.endsWith('.lua'))identityPaths.push(dir+'/'+entry.replaceAll('\\','/'));
const receipt={schemaVersion:1,study:'TASK-4.5-native-block-digits',
 baselineCommit,
 conclusion:'DIAGNOSED; widen-left candidate REJECTED; product remains FAIL',
 evidenceBoundary:'Real generated Lua Host controls, project text capacity budget and rectangles; explicit digit/Block injections, not natural acquisition, official rendering or devices.',
 inputs:Object.fromEntries([...new Set(identityPaths)].map(path=>[path,hash(readFileSync(path))])),
 outputs:Object.fromEntries(readdirSync(out).filter(name=>/^(?:baseline|widen-left).*(?:\.json|\.html|\.log\.gz)$/.test(name)).map(name=>[name,hash(readFileSync(out+'/'+name))])),results};
writeFileSync(out+'/receipt.json',JSON.stringify(receipt,null,2));
console.log(JSON.stringify({conclusion:receipt.conclusion,results:results.map(({problems,...r})=>r),out},null,2));
