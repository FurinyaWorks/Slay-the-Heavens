from pathlib import Path
def put(p,s):Path(p).write_text(s,encoding='utf8',newline='\n')
def edit(p,a,b):
 s=Path(p).read_text(encoding="utf8");assert s.count(a)==1,(p,a[:110],s.count(a));put(p,s.replace(a,b))
path='tests/helpers/integrated-ci-source.mjs'
edit(path,'const priorCiSource=',"import {potionPost697CiSource,potionPost697CiCheckedSource,potionPost697HistoricalRead,potionPost697PriorInventory,assertPotionPost697CiCurrent} from './potion-post697-ci-source.mjs';\nconst priorCiSource=")
edit(path,'const priorCiSource=(path,source,before)=>','const priorCiSource=(path,source,before,read=readFileSync)=>')
edit(path,'potionClickCiSource(path,source)','potionClickCiSource(path,potionPost697CiSource(path,source,undefined,read))')
edit(path,'potionClickCiCheckedSource(path,source)','potionClickCiCheckedSource(path,potionPost697CiCheckedSource(path,source))')
edit(path,'export function integratedSource(path,source,target){','export function integratedSource(path,source,target,read=readFileSync){')
edit(path,'source=priorCiSource(path,source,row?.current);','source=priorCiSource(path,source,row?.current,read);')
edit(path,'prior=integratedSource(path,text,target);','prior=integratedSource(path,text,target,read);')
edit(path,' assertPotionClickCiCurrent(read);\n const clickPriorRead=potionClickHistoricalRead(read);'," assertPotionPost697CiCurrent(read);\n const potionRead=potionPost697HistoricalRead('potion',read);\n assertPotionClickCiCurrent(potionRead);\n const clickPriorRead=potionClickHistoricalRead(potionRead);")
edit(path,' read=potionClickHistoricalRead(read);'," paths=potionPost697PriorInventory(paths,kind,read);read=potionPost697HistoricalRead('potion',read);\n read=potionClickHistoricalRead(read);")
edit(path,"priorCiSource(path,read(path,'utf8'),integratedCiProof.files[path]?.current)","priorCiSource(path,read(path,'utf8'),integratedCiProof.files[path]?.current,read)")
edit(path,"priorCiSource(path,read(path,'utf8'),row.current)","priorCiSource(path,read(path,'utf8'),row.current,read)")

# All previously-current potion contracts stay in their complete named 3e epoch.
# Their original assertions remain; the new raw-current union is checked separately.
for path in ['tests/integrated-ci-source.cases.mjs','tests/ci-complete-calibration.test.mjs']:
 edit(path,"import {readFileSync as actualPotionClickReadFileSync,readdirSync} from 'node:fs';", "import {readFileSync as actualPost697ReadFileSync,readdirSync} from 'node:fs';\nimport {potionPost697HistoricalRead,potionPost697PriorInventory} from './helpers/potion-post697-ci-source.mjs';\nconst actualPotionClickReadFileSync=potionPost697HistoricalRead('potion',actualPost697ReadFileSync);")
 edit(path,'discoverJs as actualPotionRegressionDiscoverJs','discoverJs as actualPost697DiscoverJs')
 needle='const rawMobilePotionDiscoverJs='if 'calibration' in path else 'const discoverJs='
 edit(path,needle,"const actualPotionRegressionDiscoverJs=()=>potionPost697PriorInventory(actualPost697DiscoverJs(),'js',actualPost697ReadFileSync);\nconst potionLegacyLua=()=>potionPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualPost697ReadFileSync);\n"+needle)
 s=Path(path).read_text(encoding="utf8");physical="readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()"
 s=s.replace('const potionLegacyLua=()=>potionPost697PriorInventory('+physical,'const potionLegacyLua=()=>potionPost697PriorInventory(POST697_LUA_RAW').replace(physical,'potionLegacyLua()').replace('POST697_LUA_RAW',physical)
 s=s.replace('const {sourceEpoch,prePotionClickSourceEpoch}=', 'const {prePotionPost697SourceEpoch:sourceEpoch,prePotionClickSourceEpoch}=')
 if 'cases' in path:
  # The old projector-only fault matrix uses immutable, real 3e fixtures. Its
  # earlier whole-source comparison still authenticates actual new conversions.
  old=" const read=p=>{try{return actualPotionClickReadFileSync(p,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}};"
  assert s.count(old)==1;s=s.replace(old," const read=path=>current.current[path]?.source??null; // Explicit immutable 3e projector domain; not live-current authorization.")
  s=s.replace("test('potion click production closure", "test('legacy 3e potion click production closure")
  s=s.replace("const value=actualPotionClickReadFileSync(p,e);", "const value=actualPost697ReadFileSync(p,e);")
 put(path,s)

# The landed697 unit/CI assertions retain an explicit real 33d domain. The live
# current union, its raw discovery and copy closure get separate new guards.
path='tests/release-selection-map-source.test.mjs'
edit(path,"import {readFileSync,readdirSync,mkdtempSync,mkdirSync,rmSync,existsSync,writeFileSync} from 'node:fs';", "import {readFileSync as actualPost697ReadFileSync,readdirSync,mkdtempSync,mkdirSync,rmSync,existsSync,writeFileSync} from 'node:fs';\nimport {potionPost697HistoricalRead,potionPost697PriorInventory} from './helpers/potion-post697-ci-source.mjs';\nconst readFileSync=potionPost697HistoricalRead('selection',actualPost697ReadFileSync);")
edit(path,"import {discoverJs} from '../scripts/ci-shards.mjs';", "import {discoverJs as actualPost697DiscoverJs} from '../scripts/ci-shards.mjs';\nconst discoverJs=()=>potionPost697PriorInventory(actualPost697DiscoverJs(),'js',actualPost697ReadFileSync,'selection');")
edit(path,"import {sourceEpoch,preReleaseSelectionMapSourceEpoch} from './helpers/closeout-source-epoch.mjs';", "import {sourceEpoch as activePost697Epoch,releaseSelectionMapLegacyEpoch as sourceEpoch,preReleaseSelectionMapSourceEpoch} from './helpers/closeout-source-epoch.mjs';")
edit(path,'assertReleaseSelectionMapCiCurrent,assertReleaseSelectionMapExecutionGuards}', 'assertReleaseSelectionMapCiCurrent as priorSelectionMapCiCurrent,assertReleaseSelectionMapExecutionGuards}')
edit(path,'const hash=b=>', 'const assertReleaseSelectionMapCiCurrent=(read=readFileSync)=>priorSelectionMapCiCurrent(read);\nconst hash=b=>')
edit(path,"lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()", "lua:potionPost697PriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualPost697ReadFileSync,'selection')")
edit(path,'releaseSelectionMapPriorInventory(paths,kind)', 'releaseSelectionMapPriorInventory(paths,kind,readFileSync)')
edit(path,"const anchor=Object.keys(releaseSelectionMapSourcePacket.current)[0],raw=path=>readFileSync(path,'utf8');", "const anchor=Object.keys(releaseSelectionMapSourcePacket.current)[0],raw=path=>p.current[path]?.source??null; // Immutable, Git-proved 33d projector domain; live union is tested independently.")
edit(path,'assert.deepEqual(copied.sourceEpoch.proof,sourceEpoch.proof);','assert.deepEqual(copied.releaseSelectionMapLegacyEpoch.proof,sourceEpoch.proof);\n assert.deepEqual(copied.sourceEpoch.proof,activePost697Epoch.proof);')
s=Path(path).read_text(encoding="utf8").replace("test('release selection map ","test('legacy landed697 release selection map ")
put(path,s)

# Keep the existing StS raw/legacy contracts, preceded only by the new real union.
path='tests/sts-style-source-epoch.test.mjs'
edit(path,"import {mobilePotionPriorInventory,assertMobilePotionRawInventory} from './helpers/mobile-potion-ci-source.mjs';", "import {mobilePotionPriorInventory,assertMobilePotionRawInventory} from './helpers/mobile-potion-ci-source.mjs';\nimport {potionPost697PriorInventory,assertPotionPost697RawInventory} from './helpers/potion-post697-ci-source.mjs';")
edit(path," for(const [kind,raw]of [['js',rawJs],['lua',rawLua]]){", " for(const [kind,combined]of [['js',rawJs],['lua',rawLua]]){\n  assertPotionPost697RawInventory(combined,kind);\n  const raw=potionPost697PriorInventory(combined,kind,readFileSync);")
# Existing geometry-free 3e inventory mutation callbacks must enter that same
# explicit potion domain first; new union additions are checked separately.
s=Path(path).read_text(encoding="utf8").replace("mobilePotionPriorInventory(actual,kind,", "mobilePotionPriorInventory(potion,kind,")
put(path,s)
print('Post697 current and explicit 3e/33d legacy consumers wired')
