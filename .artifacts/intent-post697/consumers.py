from pathlib import Path
def put(p,s):Path(p).write_text(s,encoding='utf8',newline='\n')
def edit(p,a,b):
 s=Path(p).read_text(encoding='utf8');assert s.count(a)==1,(p,a[:80]);put(p,s.replace(a,b))
p='tests/helpers/integrated-ci-source.mjs'
edit(p,"import {releaseSelectionMapCiRead} from './release-selection-map-ci-source.mjs';","import {releaseSelectionMapCiRead} from './release-selection-map-ci-source.mjs';\nimport {intentPost697CiSource,intentPost697HistoricalRead,intentPost697PriorInventory,intentPost697CiPacket,assertIntentPost697CiCurrent} from './intent-post697-ci-source.mjs';")
edit(p,'export function integratedSource(path,source,target){','export function integratedSource(path,source,target,read=readFileSync){')
edit(p,'source=releaseBootstrapCiSource(path,releaseSelectionMapCiSource(path,source),row?.current);','source=intentPost697CiSource(path,source,undefined,read);\n source=releaseBootstrapCiSource(path,releaseSelectionMapCiSource(path,source),row?.current);')
edit(p,'prior=integratedSource(path,text,target);','prior=integratedSource(path,text,target,read);')
edit(p,'export function assertIntegratedCurrent(read=readFileSync){','export function assertIntegratedCurrent(read=readFileSync){\n assertIntentPost697CiCurrent(read);\n read=intentPost697HistoricalRead(\'release\',read);')
edit(p,'return [...releaseSelectionMapCiPacket.currentInventory[kind]];','return [...intentPost697CiPacket.currentInventory[kind]];')
edit(p,'paths=releaseSelectionMapPriorInventory(paths,kind,read);',"paths=intentPost697PriorInventory(paths,kind,read);read=intentPost697HistoricalRead('release',read);\n paths=releaseSelectionMapPriorInventory(paths,kind,read);")
for p,alias in [('tests/integrated-ci-source.cases.mjs','rawReadFileSync'),('tests/ci-complete-calibration.test.mjs','rawReleaseReadFileSync')]:
 edit(p,'readFileSync as '+alias+',readdirSync',"readFileSync as actualIntentPost697ReadFileSync,readdirSync")
 edit(p,"import {releaseSelectionMapCiRead,", "import {intentPost697HistoricalRead,intentPost697PriorInventory} from './helpers/intent-post697-ci-source.mjs';\nconst "+alias+"=intentPost697HistoricalRead('release',actualIntentPost697ReadFileSync);\nimport {releaseSelectionMapCiRead,")
 name='discoverJs'if alias=='rawReadFileSync'else 'rawReleaseDiscoverJs'
 edit(p,'discoverJs as rawReleaseDiscoverJs,'if name=='rawReleaseDiscoverJs'else 'discoverJs}', 'discoverJs as actualIntentPost697DiscoverJs,'if name=='rawReleaseDiscoverJs'else 'discoverJs as actualIntentPost697DiscoverJs}')
 # Both existing consumer inventories now explicitly enter the authenticated old domain.
 import_end="from '../scripts/ci-shards.mjs';"
 edit(p,import_end,import_end+"\nconst "+name+"=()=>intentPost697PriorInventory(actualIntentPost697DiscoverJs(),'js',actualIntentPost697ReadFileSync);\nconst intentLegacyLua=()=>intentPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualIntentPost697ReadFileSync);")
 s=Path(p).read_text(encoding='utf8').replace("readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()","intentLegacyLua()")
 # Keep the helper definition real rather than recursive.
 s=s.replace("intentPost697PriorInventory(intentLegacyLua(),'lua',actualIntentPost697ReadFileSync)","intentPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualIntentPost697ReadFileSync)")
 if alias=='rawReadFileSync':
  s=s.replace('const value=rawReadFileSync(p,e);','const value=actualIntentPost697ReadFileSync(p,e);').replace('/fresh complete integration source/','/fresh complete (?:integration|intent post697) source/')
 put(p,s)
p='tests/release-selection-map-source.test.mjs'
edit(p,'readFileSync,readdirSync,','readFileSync as actualIntentPost697ReadFileSync,readdirSync,')
edit(p,"import {join} from 'node:path';","import {intentPost697HistoricalRead,intentPost697PriorInventory} from './helpers/intent-post697-ci-source.mjs';\nconst readFileSync=intentPost697HistoricalRead('release',actualIntentPost697ReadFileSync);\nimport {join} from 'node:path';")
edit(p,"import {discoverJs} from '../scripts/ci-shards.mjs';","import {discoverJs as actualIntentPost697DiscoverJs} from '../scripts/ci-shards.mjs';\nconst discoverJs=()=>intentPost697PriorInventory(actualIntentPost697DiscoverJs(),'js',actualIntentPost697ReadFileSync);")
edit(p,'import {sourceEpoch,preReleaseSelectionMapSourceEpoch}', 'import {sourceEpoch as activeIntentPost697Epoch,preIntentPost697SourceEpoch as sourceEpoch,preReleaseSelectionMapSourceEpoch}')
edit(p,'assertReleaseSelectionMapCiCurrent,assertReleaseSelectionMapExecutionGuards}', 'assertReleaseSelectionMapCiCurrent as priorSelectionMapCiCurrent,assertReleaseSelectionMapExecutionGuards}')
edit(p,'const hash=b=>', 'const assertReleaseSelectionMapCiCurrent=(read=readFileSync)=>priorSelectionMapCiCurrent(read);\nconst hash=b=>')
edit(p,"lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()","lua:intentPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualIntentPost697ReadFileSync)")
edit(p,'releaseSelectionMapPriorInventory(paths,kind)','releaseSelectionMapPriorInventory(paths,kind,readFileSync)')
edit(p,"const anchor=Object.keys(releaseSelectionMapSourcePacket.current)[0],raw=path=>readFileSync(path,'utf8');","// Immutable landed697 projector domain; current117 is verified independently.\n const anchor=Object.keys(releaseSelectionMapSourcePacket.current)[0],raw=path=>p.current[path]?.source??null;")
edit(p,'assert.deepEqual(copied.sourceEpoch.proof,sourceEpoch.proof);','assert.deepEqual(copied.preIntentPost697SourceEpoch.proof,sourceEpoch.proof);\n assert.deepEqual(copied.sourceEpoch.proof,activeIntentPost697Epoch.proof);')
s=Path(p).read_text(encoding='utf8').replace("test('release selection map", "test('legacy landed697 release selection map");put(p,s)
p='tests/sts-style-source-epoch.test.mjs'
edit(p,"import {releaseSelectionMapPriorInventory} from './helpers/release-selection-map-ci-source.mjs';","import {releaseSelectionMapPriorInventory} from './helpers/release-selection-map-ci-source.mjs';\nimport {intentPost697PriorInventory,intentPost697HistoricalRead,assertIntentPost697RawInventory} from './helpers/intent-post697-ci-source.mjs';")
edit(p," const rawJs=releaseSelectionMapPriorInventory(discoverJs(),'js',readFileSync),rawLua=releaseSelectionMapPriorInventory(readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort(),'lua',readFileSync);", " const currentJs=discoverJs(),currentLua=readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort();\n assertIntentPost697RawInventory(currentJs,'js');assertIntentPost697RawInventory(currentLua,'lua');\n const releaseRead=intentPost697HistoricalRead('release',readFileSync);\n const rawJs=releaseSelectionMapPriorInventory(intentPost697PriorInventory(currentJs,'js',readFileSync),'js',releaseRead),rawLua=releaseSelectionMapPriorInventory(intentPost697PriorInventory(currentLua,'lua',readFileSync),'lua',releaseRead);")
print('Wired new actual-current domain and explicit unchanged landed697 historical consumers')
