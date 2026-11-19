// Evidence-only: execute unchanged current fixtures with a data-loader fault.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {runLua} from '../../../scripts/test-lua.mjs';
const out='build/v4-payload-preflight';mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const fixtures=['tests/lua/formal_campaign_entry.lua','tests/lua/full_source_campaign_entry.lua'];
const sourcePaths=['src/lua/abyss_ui.lua','src/lua/abyss_run_admission.lua','src/lua/abyss_character_select.lua','src/lua/abyss_original_v4_profiles.lua','src/lua/abyss_battle_render_hud.lua',...fixtures];
const before=Object.fromEntries(sourcePaths.map(p=>[p,hash(p)]));
const cases=[];
for(const fixture of fixtures)for(const blocked of [false,true]){
 const name=fixture.split('/').at(-1).replace('.lua','')+(blocked?'-blocked':'-original');
 const wrapper=`local real=require\nlocal calls=0\nfunction require(name)\n if name=='abyss_original_v4_data' then calls=calls+1;${blocked?"error('V4_DATA_FORBIDDEN',0)":""} end\n return real(name)\nend\ndofile('${fixture}')\nprint('V4_DATA_REQUIRE_COUNT '..calls)\n`;
 const path=`${out}/${name}.lua`;writeFileSync(path,wrapper);
 const r=runLua(path);const expectedFailure=blocked&&fixture===fixtures[1];
 writeFileSync(`${out}/${name}.txt`,r.stdout+r.stderr);
 if(expectedFailure){assert.notEqual(r.status,0);assert.match(r.stderr,/V4_DATA_FORBIDDEN/);}
 else{assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,fixture===fixtures[0]?/FORMAL_CAMPAIGN_ENTRY_PASS 4/:/FULL_SOURCE_CAMPAIGN_ENTRY_PASS 3/);}
 if(fixture===fixtures[0])assert.match(r.stdout,/V4_DATA_REQUIRE_COUNT 0/);
 cases.push({name,status:r.status,signal:r.signal,expectedFailure,output:r.stdout+r.stderr});
 console.log(name,r.status,expectedFailure?'expected negative control':r.stdout.trim().split('\n').at(-1));
}
for(const p of sourcePaths)assert.equal(hash(p),before[p],`source changed: ${p}`);
const report={sourceCommit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),measurement:'offline unchanged fixture with actual runtime; controlled room completion; not native/client/device',generatedData:{bytes:readFileSync('build/lua/abyss_original_v4_data.lua').length,sha256:hash('build/lua/abyss_original_v4_data.lua')},sourceSha256:before,cases};
writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2)+'\n');
