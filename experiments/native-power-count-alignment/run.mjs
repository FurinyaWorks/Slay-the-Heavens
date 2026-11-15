// Generates evidence, never replaces a failing Lua status with product acceptance.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {runLua} from '../../scripts/test-lua.mjs';
import {luaString} from '../../scripts/build-lua-data.mjs';
import {page} from '../../scripts/official-assets-preview.mjs';
const out=resolve(process.argv[2]??'build/native-power-count-alignment-'+Date.now());assert(!existsSync(out),'new evidence directory required');mkdirSync(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),results=[];
const inputs=['experiments/native-power-count-alignment/capture.lua','tests/fixtures/native-power-count-before.lua',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p),...readdirSync('build/lua').filter(p=>p.endsWith('.lua')).map(p=>'build/lua/'+p)];
const sourceInputs=Object.fromEntries(inputs.map(p=>[p,hash(readFileSync(p))]));
for(const group of ['Lots of Slimes','Gremlin Gang'])for(const version of ['before','after']){
 const tag=group.replaceAll(' ','_')+'-'+version,entry=out+'/'+tag+'.lua';
 const before=readFileSync('tests/fixtures/native-power-count-before.lua','utf8').replaceAll('\r\n','\n');
 const prelude=version==='before'?`package.preload.abyss_monster_power_view=assert(load(${luaString(before)},'@frozen-count-before'))\n`:'';
 writeFileSync(entry,`${prelude}POWER_ALIGNMENT_GROUP=${luaString(group)}\ndofile('experiments/native-power-count-alignment/capture.lua')\n`);
 const r=runLua(entry,{maxBuffer:12*1024*1024});writeFileSync(out+'/'+tag+'.log.gz',gzipSync(r.stdout+r.stderr));
 const summaries=r.stdout.split('\n').filter(s=>s.startsWith('POWER_COUNT_CLEARANCE ')).map(s=>JSON.parse(s.slice('POWER_COUNT_CLEARANCE '.length)));
 const encoded=r.stdout.split('\n').find(s=>s.startsWith('OFFICIAL_VISUAL_SCENES '));assert(encoded,'full scenes required even on known clearance failure');
 const scenes=JSON.parse(encoded.slice(23));writeFileSync(out+'/'+tag+'.scenes.json.gz',gzipSync(JSON.stringify(scenes)));
 for(const scene of scenes)writeFileSync(out+'/'+tag+'-'+scene.name+'.html',page(scene));
 results.push({group,version,luaStatus:r.status,summaries});console.log(JSON.stringify(results.at(-1)));
}
writeFileSync(out+'/result.json',JSON.stringify({kind:'offline-real-Host-native-font-budget',originalH0Measured:false,pixelEquivalent:false,official:false,device:false,sourceInputs,results},null,2)+'\n');
console.log('evidence: '+out);
