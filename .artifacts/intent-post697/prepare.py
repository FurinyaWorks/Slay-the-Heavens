from pathlib import Path
import subprocess,json,gzip,hashlib,re
intent='f448a9df48054f49af792312cd866c03b53b0197';release='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9';product='38efba8119e3b812d530e32915907ef842bcafae';model='10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0'
git=lambda *a:subprocess.check_output(['git',*a])
sha=lambda b:hashlib.sha256(b).hexdigest()
def put(p,s):Path(p).write_text(s,encoding='utf8',newline='\n')
def edit(p,a,b):
 s=Path(p).read_text(encoding='utf8');assert s.count(a)==1,(p,a[:90]);put(p,s.replace(a,b))
def row(raw):
 s=raw.decode('utf8').replace('\r\n','\n');b=s.encode();return dict(source=s,sha256=sha(b),gitBlob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest())
runtime=['src/lua/abyss_battle_intent_view.lua','src/lua/abyss_battle_render_actors.lua'];maps=['src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua']
p=dict(schemaVersion=1,normalization='LF',baseCommit=release,intentCommit=intent,currentCommit=product,currentTreeCommitted=True,before={},current={},intentBeforeMap={})
for path in runtime:
 p['before'][path]=row(git('show',release+':'+path));p['current'][path]=row(git('show',product+':'+path));assert git('rev-parse',intent+':'+path)==git('rev-parse',product+':'+path)
for path in maps:
 p['intentBeforeMap'][path]=row(git('show',intent+':'+path));assert git('rev-parse',release+':'+path)==git('rev-parse',product+':'+path)
data=gzip.compress((json.dumps(p,ensure_ascii=False,separators=(',',':'))+'\n').encode(),mtime=0);Path('tests/helpers/intent-post697-source.json.gz').write_bytes(data)
code="""// Committed orthogonal intent dismissal and actual landed selection/map composition.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./intent-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'PRODUCTION_SHA','complete intent post697 production packet');
export const intentPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendIntentPost697Source(original,packet=intentPost697SourcePacket){
 const prior=original.proof;
 assert.deepEqual(packet,intentPost697SourcePacket,'exact committed intent and actual Release identities');
 assert.equal(packet.currentTreeCommitted,true);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'actual landed Release predecessor: '+path);current[path]=row;
 }
 const intent={...current,...packet.intentBeforeMap};
 const targets={...prior.targets,intentPost697Release:{commit:packet.baseCommit,files:prior.current},intentBeforeMap:{commit:packet.intentCommit,files:intent}};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'real committed intent and landed selection/map union; device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
"""
put('tests/helpers/intent-post697-source.mjs',code.replace('PRODUCTION_SHA',sha(data)))
edit('tests/helpers/closeout-source-epoch.mjs',"import {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';","import {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';\nimport {extendIntentPost697Source} from './intent-post697-source.mjs';")
edit('tests/helpers/closeout-source-epoch.mjs','export const sourceEpoch=extendReleaseSelectionMapSource(preReleaseSelectionMapSourceEpoch);','export const preIntentPost697SourceEpoch=extendReleaseSelectionMapSource(preReleaseSelectionMapSourceEpoch);\nexport const sourceEpoch=extendIntentPost697Source(preIntentPost697SourceEpoch);')
rows=[]
for path in ['tests/helpers/closeout-source-epoch.mjs','tests/helpers/intent-post697-source.mjs','tests/helpers/intent-post697-source.json.gz']:
 rows.append(dict(path=path,before=sha(git('show',release+':'+path))if path.endswith('closeout-source-epoch.mjs')else None,after=sha(Path(path).read_bytes()if path.endswith('.gz')else Path(path).read_text(encoding='utf8').encode())))
edit('tests/helpers/copy-integration-source-closure.mjs','const inside=(root,path)=>','export const intentPost697HelperCopies='+json.dumps(rows,separators=(',',':'))+";\nfor(const row of intentPost697HelperCopies){assert.equal(files[row.path]??null,row.before,'exact intent post697 helper predecessor: '+row.path);files[row.path]=row.after;}\nconst inside=(root,path)=>")
# Reuse the already reviewed thin trust-leaf mechanism, only with actual intent/Release inputs.
s=git('show',model+':tests/helpers/potion-post697-ci-source.mjs').decode('utf8').replace('potionPost697','intentPost697').replace('PotionPost697','IntentPost697').replace('potion-post697','intent-post697').replace('potion post697','intent post697').replace("'potion'","'release'").replace("'selection'","'intent'").replace("potion:'3e96a1589435f8b06645db095775a789f24b1350',selection:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9'","release:'"+release+"',intent:'"+intent+"'").replace('a9df9dff11779cb1d850dc97b715c711881cf9c6',product)
s=re.sub(r"assert.equal\(hash\(bytes\),'[a-f0-9]{64}'", "assert.equal(hash(bytes),'POST697_CI_SHA'",s)
s=s.replace("// Only assertIntegratedCurrent calls this private comparison, after authenticating\n// the whole declared current corpus with the same raw reader.\nexport const intentPost697CiCheckedSource=(path,source,before)=>checked(path,source,'release',before);\n",'').replace('fresh complete post697 source: ','fresh complete intent post697 source: ')
put('tests/helpers/intent-post697-ci-source.mjs',s)
c=git('show',model+':.artifacts/potion-post697/capture.py').decode('utf8').replace('potion-post697','intent-post697').replace("views=dict(potion='3e96a1589435f8b06645db095775a789f24b1350',selection='33d71575c5f186a1b54f7bf3e4f1826c145aa1d9')","views=dict(release='"+release+"',intent='"+intent+"')").replace('a9df9dff11779cb1d850dc97b715c711881cf9c6',product)
c=c.replace("changed|={'src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_potion_popup.lua','src/lua/abyss_battle_ui.lua'}","changed|="+repr(set(runtime+maps)))
c=c.replace("'scripts/','config/'","'scripts/','config/','.github/'")
put('.artifacts/intent-post697/capture.py',c)
Path('.artifacts/intent-post697/production.json').write_text(json.dumps(dict(intent=intent,release=release,product=product,sha256=sha(data),bytes=len(data)),indent=2)+'\n',encoding='utf8')
print('Prepared actual intent/release production union',sha(data))
