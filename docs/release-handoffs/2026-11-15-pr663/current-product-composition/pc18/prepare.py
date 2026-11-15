import json,pathlib,hashlib,subprocess
out=pathlib.Path('pc18-default-runtime-2314');repo=pathlib.Path('profile-matrix-695-699/repo')
def lua(v):
 if isinstance(v,dict):return '{'+','.join('['+lua(k)+']='+lua(x) for k,x in v.items())+'}'
 if isinstance(v,list):return '{'+','.join(map(lua,v))+'}'
 if isinstance(v,str):return json.dumps(v,ensure_ascii=False)
 if isinstance(v,bool):return str(v).lower()
 if v is None:return 'nil'
 return str(v)
def find(n,name):
 if isinstance(n,dict):
  if n.get('name')==name:return n
  for x in n.values():
   r=find(x,name)
   if r:return r
 elif isinstance(n,list):
  for x in n:
   r=find(x,name)
   if r:return r
j=json.load(open(repo/'build/default/game-ui.json'));entry=find(j,'potionEntry');assert entry
(out/'entry.lua').write_text('return '+lua(entry))
p='src/lua/abyss_potion_discard_ui.lua';raw=subprocess.check_output(['git','-C','wake-1314/merge-rehearsal','show','verification-pr699-profile:'+p]);assert raw==(repo/p).read_bytes()
(out/'proof.json').write_text(json.dumps({'head':'73da2626d37fb52f90e71cd65838c08a1b9cae7c','moduleSha256':hashlib.sha256(raw).hexdigest(),'defaultTreeSha256':hashlib.sha256((repo/'build/default/game-ui.json').read_bytes()).hexdigest(),'entrySha256':hashlib.sha256((out/'entry.lua').read_bytes()).hexdigest()},indent=2))
