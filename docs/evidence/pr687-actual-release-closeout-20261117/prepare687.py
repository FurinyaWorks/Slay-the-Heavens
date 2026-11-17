from pathlib import Path
import subprocess,hashlib,re,json,gzip
git=lambda *a:subprocess.check_output(['git','-c','core.quotePath=false',*a])
base='af77fb2461c548f0faf104761d107397f75dca08'; intent='e1221ee0abc265a720cd71a87d01b9d109c51475'
sha=lambda b:hashlib.sha256(b).hexdigest()
def text(p):return Path(p).read_text()
def put(p,s):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(s,newline='\n')
def edit(p,a,b):
 s=text(p);assert s.count(a)==1,(p,a[:100],s.count(a));put(p,s.replace(a,b))
p='tests/helpers/closeout-source-epoch.mjs'
edit(p,"import {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';","import {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';\nimport {extendIntentPost697Source} from './intent-post697-source.mjs';")
edit(p,'export const sourceEpoch=joinReleaseSources();', '''export const preIntentReleaseSourceEpoch=joinReleaseSources();
// The original intent producer remains the exact standalone 33d/38ef corpus.
export const preIntentPost697SourceEpoch=releaseSelectionMapSourceEpoch;
export const intentPost697StandaloneEpoch=extendIntentPost697Source(preIntentPost697SourceEpoch);
function joinIntentRelease(){
 const release=preIntentReleaseSourceEpoch.proof,intent=intentPost697StandaloneEpoch.proof;
 const current={...release.current},targets={...release.targets};
 for(const [path,row]of Object.entries(intentPost697StandaloneEpoch.proof.current)){
  if(row?.sha256===preIntentPost697SourceEpoch.proof.current[path]?.sha256)continue;
  assert.deepEqual(current[path],preIntentPost697SourceEpoch.proof.current[path],'disjoint approved intent owner: '+path);
  current[path]=row;
 }
 for(const [name,target]of Object.entries(intent.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'complete retained intent history: '+name);
  else targets[name]=target;
 }
 targets.intentReleaseAf77Reviewed={commit:'af77fb2461c548f0faf104761d107397f75dca08',files:release.current};
 targets.intentStandaloneReviewed={commit:intent.currentCommit,files:intent.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...release,current,targets,owners,currentTreeCommitted:false,
  currentCommitRole:'actual af77 Release plus original committed intent producer; current composition captured separately'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
export const sourceEpoch=joinIntentRelease();''')
# Preserve both original helper-copy lineages; the final production closure uses
# the newly composed module and the unchanged original intent production leaf.
p='tests/helpers/copy-integration-source-closure.mjs'
old="files['tests/helpers/closeout-source-epoch.mjs']='3101ebf6deee9f081fad6e3c8d4617b6db4bf17ee01453c82fc8d8a3fb742215';"
new="files['tests/helpers/closeout-source-epoch.mjs']='"+sha(Path('tests/helpers/closeout-source-epoch.mjs').read_bytes())+"';\n"
for f in ['tests/helpers/intent-post697-source.mjs','tests/helpers/intent-post697-source.json.gz']:
 new+="assert.equal(files["+json.dumps(f)+"]??null,null,'new original intent production dependency');files["+json.dumps(f)+"]='"+sha(Path(f).read_bytes())+"';\n"
edit(p,old,new.rstrip())
# The original af77 tests retain their exact source, assertion and inventory
# domains through an explicit historical reader. The current union is tested
# separately below. No old assertion values are changed.
tests=['tests/ci-complete-calibration.test.mjs','tests/defect-final-source-epoch.test.mjs','tests/encounter-formation-source-epoch.test.mjs','tests/integrated-ci-source.cases.mjs','tests/release-selection-map-source.test.mjs','tests/sts-style-source-epoch.test.mjs','tests/release-card-contact-integration.test.mjs']
for p in tests:
 s=text(p)
 # Give each historical file a raw-fs alias, then its original local name an
 # explicit af77 reader; injected negative readers still reach outer auth.
 m=re.search(r"import \{([^}]*\breadFileSync\b[^}]*)\} from 'node:fs';",s);assert m,p
 fields=m.group(1);q=re.search(r'\breadFileSync(?: as (\w+))?',fields);name=q.group(1) or 'readFileSync'
 fields=fields[:q.start()]+'readFileSync as unionActualReadFileSync'+fields[q.end():]
 replacement="import {"+fields+"} from 'node:fs';\nimport {intentReleaseHistoricalRead,intentReleasePriorInventory} from './helpers/intent-release-union.mjs';\nconst "+name+"=intentReleaseHistoricalRead('release',unionActualReadFileSync);"
 s=s[:m.start()]+replacement+s[m.end():]
 # Every raw discoverJs entering the old test is first reduced only after
 # complete new-current authentication, preserving the af77 inventory.
 m=re.search(r"import \{([^}]*\bdiscoverJs\b[^}]*)\} from '../scripts/ci-shards.mjs';",s)
 if m:
  fields=m.group(1);q=re.search(r'\bdiscoverJs(?: as (\w+))?',fields);name=q.group(1) or 'discoverJs'
  fields=fields[:q.start()]+'discoverJs as unionActualDiscoverJs'+fields[q.end():]
  s=s[:m.start()]+"import {"+fields+"} from '../scripts/ci-shards.mjs';\nconst "+name+"=()=>intentReleasePriorInventory(unionActualDiscoverJs(),'js','release',unionActualReadFileSync);"+s[m.end():]
 s=s.replace("readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()","intentReleasePriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua','release',unionActualReadFileSync)")
 s=s.replace("readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()","intentReleasePriorInventory(readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort(),'lua','release',unionActualReadFileSync)")
 # af77's existing current source assertions keep their real historical epoch.
 s=re.sub(r'(?<!\w)sourceEpoch(?=[,}])',lambda m:m.group(0),s)
 s=s.replace("import {sourceEpoch,preReleasePc22BasicFeedbackSourceEpoch,", "import {preIntentReleaseSourceEpoch as sourceEpoch,preReleasePc22BasicFeedbackSourceEpoch,")
 s=s.replace("const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs')", "const {preIntentReleaseSourceEpoch:sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs')")
 put(p,s)
# Restore all six original intent contracts as an explicit standalone domain.
p='tests/helpers/intent-standalone-integrated-ci-source.mjs'
Path(p).write_bytes(git('show',intent+':tests/helpers/integrated-ci-source.mjs'))
p='tests/integrated-ci-source.cases.mjs'
blocks=Path('/workspace/release-closeout-evidence/intent-original-cases.mjs').read_text()
blocks=blocks.replace("const {integratedRead}=await import('./helpers/integrated-ci-source.mjs');","const {integratedRead,integratedSource}=await import('./helpers/intent-standalone-integrated-ci-source.mjs');")
blocks=blocks.replace("const {sourceEpoch,preIntentPost697SourceEpoch}=", "const {intentPost697StandaloneEpoch:sourceEpoch,preIntentPost697SourceEpoch}=")
blocks=blocks.replace("lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()", "lua:intentReleasePriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua','intent',unionActualReadFileSync)")
intro="""
import {intentPost697HistoricalRead,intentPost697PriorInventory} from './helpers/intent-post697-ci-source.mjs';
const actualIntentPost697ReadFileSync=intentReleaseHistoricalRead('intent',unionActualReadFileSync);
const actualIntentPost697DiscoverJs=()=>intentReleasePriorInventory(unionActualDiscoverJs(),'js','intent',unionActualReadFileSync);
"""
put(p,text(p)+'\n'+intro+blocks)
print('prepared disjoint product union, both original historical test domains and exact copy closure')
