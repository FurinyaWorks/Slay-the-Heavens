from pathlib import Path
import json,hashlib
root=Path(__file__).parent
res={}
for mode in ['default','official','v25']:
 p=root/'repo/build'/mode/'game-ui.json';b=p.read_bytes();d=json.loads(b)
 def get(path):
  n=d
  for name in path.split('/'):
   n=next((v for v in n.get('children',[])+n.get('controls',[]) if v.get('name')==name),None)
   if n is None:return None
  return n
 def summary(path):
  n=get(path)
  return None if n is None else {k:n[k] for k in ['kind','position','size','visible','image','colour'] if k in n}
 res[mode]={'gameUiSha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'markers':{k:summary(v) for k,v in {
 'settingsReplacement':'stage/exitEntry/open/hit/normal/officialBattleHud/symbol',
 'pickerChrome':'stage/nodePanel/pickerView/previous/sharedButtonChrome',
 'pickerPrevious':'stage/nodePanel/pickerView/previous',
 'mapReturn':'stage/mapPanel/previewBack',
 'mapReturnFace':'stage/mapPanel/previewBack/v25Face',
 'characterVeil':'stage/characterPanel/officialBackdropVeil',
 'menuTitleMark':'stage/menuPanel/v25MainMenu/titleMark',
 }.items()}}
assert all(res['default']['markers'][x] is None for x in ['settingsReplacement','pickerChrome','mapReturnFace','menuTitleMark'])
assert all(res['official']['markers'][x] is not None for x in ['settingsReplacement','pickerChrome','mapReturnFace','menuTitleMark'])
assert res['official']['markers']['settingsReplacement']['kind']=='image'
assert res['official']['markers']['characterVeil']['visible']==False
assert res['v25']['markers']['menuTitleMark'] is not None
assert all(res['v25']['markers'][x] is None for x in ['settingsReplacement','pickerChrome','mapReturnFace'])
(root/'matrix.json').write_text(json.dumps(res,indent=2)); print(json.dumps(res,indent=2))
