from pathlib import Path
import gzip,hashlib,json,subprocess
potion='3e96a1589435f8b06645db095775a789f24b1350';selection='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9';product='a9df9dff11779cb1d850dc97b715c711881cf9c6'
git=lambda *a:subprocess.check_output(['git','-c','core.commitGraph=false','-c','core.quotePath=false',*a])
sha=lambda b:hashlib.sha256(b).hexdigest()
def row(raw):
 s=raw.decode().replace('\r\n','\n');b=s.encode();return dict(source=s,sha256=sha(b),gitBlob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest())
def put(path,s):Path(path).write_text(s,encoding='utf8',newline='\n')
def edit(path,before,after):
 s=Path(path).read_text(encoding='utf8');assert s.count(before)==1,(path,before[:100]);put(path,s.replace(before,after))
oldMap=json.loads(gzip.decompress(git('show',selection+':tests/helpers/release-selection-map-source.json.gz')))
p=dict(schemaVersion=1,normalization='LF',baseCommit=potion,selectionCommit=selection,currentCommit=product,currentTreeCommitted=True,inputs=[potion,selection],selectionProductCommit=oldMap['currentCommit'],before={},current={},producers=oldMap['producers'],inheritedPotion={})
for path in oldMap['current']:
 p['before'][path]=row(git('show',potion+':'+path));p['current'][path]=row(git('show',product+':'+path));assert p['current'][path]==oldMap['current'][path]
for path in ['src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_potion_popup.lua','src/lua/abyss_battle_ui.lua']:
 p['inheritedPotion'][path]=row(git('show',potion+':'+path));assert git('rev-parse',potion+':'+path)==git('rev-parse',product+':'+path)
data=gzip.compress((json.dumps(p,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0);Path('tests/helpers/potion-post697-source.json.gz').write_bytes(data)
code="""// Real committed union; the independent potion and landed-selection domains remain explicit.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./potion-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'PRODUCTION_SHA','complete potion post697 production packet');
export const potionPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPotionPost697Source(original,legacy,packet=potionPost697SourcePacket){
 const prior=original.proof,historical=legacy.proof;
 for(const key of ['schemaVersion','normalization','baseCommit','selectionCommit','currentCommit','currentTreeCommitted','inputs','selectionProductCommit','before','current','producers','inheritedPotion'])assert.deepEqual(packet[key],potionPost697SourcePacket[key],'exact committed potion/selection '+key);
 assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,true);
 assert.equal(historical.currentCommit,packet.selectionProductCommit,'real immutable selection producer');
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.inheritedPotion))assert.deepEqual(prior.current[path],row,'unchanged potion source: '+path);
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'real potion predecessor: '+path);
  assert.deepEqual(historical.current[path],row,'real landed selection production: '+path);current[path]=row;
 }
 const targets={...prior.targets};
 for(const [name,target]of Object.entries(historical.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared immutable historical target '+name);else targets[name]=target;
 }
 assert(!Object.hasOwn(targets,'potionBeforeSelection'));assert(!Object.hasOwn(targets,'selectionMapLanded'));
 targets.potionBeforeSelection={commit:packet.baseCommit,files:prior.current};
 targets.selectionMapLanded={commit:packet.selectionCommit,files:historical.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'real committed potion and actual landed selection-map union; source and device acceptance independent',potionPost697Producers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
"""
put('tests/helpers/potion-post697-source.mjs',code.replace('PRODUCTION_SHA',sha(data)))
path='tests/helpers/closeout-source-epoch.mjs'
edit(path,"import {extendPotionClickSource} from './potion-click-source.mjs';","import {extendPotionClickSource} from './potion-click-source.mjs';\nimport {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';\nimport {extendPotionPost697Source} from './potion-post697-source.mjs';")
edit(path,'export const sourceEpoch=extendPotionClickSource(prePotionClickSourceEpoch);','export const prePotionPost697SourceEpoch=extendPotionClickSource(prePotionClickSourceEpoch);\nexport const preReleaseSelectionMapSourceEpoch=preMobilePotionSourceEpoch;\nexport const releaseSelectionMapLegacyEpoch=extendReleaseSelectionMapSource(preReleaseSelectionMapSourceEpoch);\nexport const sourceEpoch=extendPotionPost697Source(prePotionPost697SourceEpoch,releaseSelectionMapLegacyEpoch);')
path='tests/helpers/copy-integration-source-closure.mjs'
rows=[]
for name in ['tests/helpers/closeout-source-epoch.mjs','tests/helpers/release-selection-map-source.mjs','tests/helpers/release-selection-map-source.json.gz','tests/helpers/potion-post697-source.mjs','tests/helpers/potion-post697-source.json.gz']:
 rows.append(dict(path=name,before=sha(git('show',potion+':'+name))if name.endswith('closeout-source-epoch.mjs')else None,after=sha(Path(name).read_bytes() if name.endswith('.gz') else Path(name).read_text(encoding='utf8').encode())))
edit(path,'const inside=(root,path)=>','export const potionPost697HelperCopies='+json.dumps(rows,separators=(',',':'))+";\nfor(const row of potionPost697HelperCopies){assert.equal(files[row.path]??null,row.before,'exact post697 helper-copy predecessor: '+row.path);files[row.path]=row.after;}\nconst inside=(root,path)=>")
Path('.artifacts/potion-post697/production.json').write_text(json.dumps(dict(potion=potion,selection=selection,product=product,sha256=sha(data),bytes=len(data)),indent=2)+'\n')
print('Prepared committed five-source union',sha(data),len(data))
