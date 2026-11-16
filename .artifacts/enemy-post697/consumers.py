from pathlib import Path
import subprocess
def put(p,s):Path(p).write_text(s,encoding='utf8',newline='\n')
def edit(p,a,b):
 s=Path(p).read_text(encoding='utf8');assert s.count(a)==1,(p,a[:100]);put(p,s.replace(a,b))
p='tests/helpers/integrated-ci-source.mjs'
edit(p,"import {enemyGeometryCiSource,","import {enemyPost697CiSource,enemyPost697HistoricalRead,enemyPost697PriorInventory,assertEnemyPost697CiCurrent} from './enemy-post697-ci-source.mjs';\nimport {enemyGeometryCiSource,")
edit(p,'source=enemyGeometryCiSource(path,source,undefined,read);',"source=enemyPost697CiSource(path,source,undefined,read);\n source=enemyGeometryCiSource(path,source,undefined,enemyPost697HistoricalRead('enemy',read));")
edit(p,'export function assertIntegratedCurrent(read=readFileSync){',"export function assertIntegratedCurrent(read=readFileSync){\n assertEnemyPost697CiCurrent(read);\n read=enemyPost697HistoricalRead('enemy',read);")
edit(p,'paths=enemyGeometryPriorInventory(paths,kind,read);',"paths=enemyPost697PriorInventory(paths,kind,read);read=enemyPost697HistoricalRead('enemy',read);\n paths=enemyGeometryPriorInventory(paths,kind,read);")
for p in ['tests/integrated-ci-source.cases.mjs','tests/ci-complete-calibration.test.mjs']:
 edit(p,'readFileSync as actualEnemyGeometryReadFileSync,readdirSync','readFileSync as actualEnemyPost697ReadFileSync,readdirSync')
 edit(p,"import {enemyGeometryCiRead,","import {enemyPost697HistoricalRead,enemyPost697PriorInventory} from './helpers/enemy-post697-ci-source.mjs';\nconst actualEnemyGeometryReadFileSync=enemyPost697HistoricalRead('enemy',actualEnemyPost697ReadFileSync);\nimport {enemyGeometryCiRead,")
 edit(p,'discoverJs as actualEnemyGeometryDiscoverJs','discoverJs as actualEnemyPost697DiscoverJs')
 edit(p,"from '../scripts/ci-shards.mjs';","from '../scripts/ci-shards.mjs';\nconst actualEnemyGeometryDiscoverJs=()=>enemyPost697PriorInventory(actualEnemyPost697DiscoverJs(),'js',actualEnemyPost697ReadFileSync);\nconst enemyLegacyLua=()=>enemyPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualEnemyPost697ReadFileSync);")
 s=Path(p).read_text(encoding='utf8').replace("readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()","enemyLegacyLua()")
 s=s.replace("enemyPost697PriorInventory(enemyLegacyLua(),'lua',actualEnemyPost697ReadFileSync)","enemyPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualEnemyPost697ReadFileSync)")
 if p.endswith('cases.mjs'):
  s=s.replace('const value=actualEnemyGeometryReadFileSync(p,e);\n   return p!==path?', 'const value=actualEnemyPost697ReadFileSync(p,e);\n   return p!==path?')
  s=s.replace('/fresh complete integration source/','/fresh complete (?:integration|enemy post697) source/')
  s=s.replace('const {sourceEpoch,preEnemyGeometrySourceEpoch}=await import', 'const {preEnemyPost697SourceEpoch:sourceEpoch,preEnemyGeometrySourceEpoch}=await import')
  s=s.replace("enemyGeometryCiSource,enemyGeometryPriorInventory", "enemyGeometryCiSource as priorEnemyGeometryCiSource,enemyGeometryPriorInventory")
  marker="const rawReadFileSync=enemyGeometryCiRead(actualEnemyGeometryReadFileSync);"
  s=s.replace(marker,marker+"\nconst enemyGeometryCiSource=(path,source,before,read=actualEnemyGeometryReadFileSync)=>priorEnemyGeometryCiSource(path,source,before,read);")
  s=s.replace("test('enemy geometry composition", "test('legacy13a enemy geometry composition")
 put(p,s)
# The immutable original697 contract keeps its complete standalone domain.
model=subprocess.check_output(['git','show','d0de2f65454c307f7048bcceac86400dbb40fb35:tests/release-selection-map-source.test.mjs']).decode('utf8')
model=model.replace('intentPost697','enemyPost697').replace('IntentPost697','EnemyPost697').replace('intent-post697','enemy-post697').replace("'release'","'selection'")
model=model.replace('preEnemyPost697SourceEpoch as sourceEpoch','releaseSelectionMapLegacyEpoch as sourceEpoch')
model=model.replace('copied.preEnemyPost697SourceEpoch.proof','copied.releaseSelectionMapLegacyEpoch.proof')
model=model.replace("enemyPost697PriorInventory(actualEnemyPost697DiscoverJs(),'js',actualEnemyPost697ReadFileSync)","enemyPost697PriorInventory(actualEnemyPost697DiscoverJs(),'js',actualEnemyPost697ReadFileSync,'selection')").replace(".sort(),'lua',actualEnemyPost697ReadFileSync)",".sort(),'lua',actualEnemyPost697ReadFileSync,'selection')")
put('tests/release-selection-map-source.test.mjs',model)
p='tests/sts-style-source-epoch.test.mjs'
edit(p,"import {enemyGeometryPriorInventory,assertEnemyGeometryRawInventory} from './helpers/enemy-geometry-ci-source.mjs';","import {enemyGeometryPriorInventory,assertEnemyGeometryRawInventory} from './helpers/enemy-geometry-ci-source.mjs';\nimport {enemyPost697PriorInventory,enemyPost697HistoricalRead,assertEnemyPost697RawInventory} from './helpers/enemy-post697-ci-source.mjs';")
edit(p,' for(const [kind,paths]of Object.entries(currentRaw)){'," for(const [kind,paths]of Object.entries(currentRaw)){\n  assertEnemyPost697RawInventory(paths,kind);\n  const legacy=enemyPost697PriorInventory(paths,kind,readFileSync),legacyRead=enemyPost697HistoricalRead('enemy',readFileSync);")
edit(p,'  assertEnemyGeometryRawInventory(paths,kind);\n  historical[kind]=enemyGeometryPriorInventory(paths,kind,readFileSync);', '  assertEnemyGeometryRawInventory(legacy,kind);\n  historical[kind]=enemyGeometryPriorInventory(legacy,kind,legacyRead);')
# Old added-inventory guards retain their exact prior domain; current raw has its own gate above.
edit(p,'for(const path of paths.filter(path=>!historical[kind].includes(path))){','for(const path of legacy.filter(path=>!historical[kind].includes(path))){')
edit(p,'assertEnemyGeometryRawInventory(paths.filter(p=>p!==path),kind)','assertEnemyGeometryRawInventory(legacy.filter(p=>p!==path),kind)')
edit(p,"for(const value of [null,readFileSync(path,'utf8')+'\\n'])assert.throws(()=>enemyGeometryPriorInventory(paths,kind,(p,e)=>p===path?value:readFileSync(p,e))", "for(const value of [null,legacyRead(path,'utf8')+'\\n'])assert.throws(()=>enemyGeometryPriorInventory(legacy,kind,(p,e)=>p===path?value:legacyRead(p,e))")
print('Composed real enemy and landed-selection consumers without changing either legacy packet')
