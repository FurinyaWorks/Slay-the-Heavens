import json,copy,pathlib,hashlib
out=pathlib.Path('pc18-shared-pool-geometry');src=pathlib.Path('profile-matrix-695-699/repo/build/default/game-ui.json')
tree=json.loads(src.read_text())
def find(n,name):
 if n.get('name')==name:return n
 for c in n.get('controls',n.get('children',[])):
  r=find(c,name)
  if r:return r
entry=find(tree,'potionEntry');open_=find(entry,'open');hit=find(open_,'hit');before=copy.deepcopy(entry)
faces={s:next(c for c in hit['children'] if c['name']==s) for s in ['normal','hover','pressed','disabled']}
rows=[]
for i in range(1,6):
 slot=next(c for c in faces['normal']['children'] if c['name']==f'slot{i}');x,y=slot['position']
 for state,face in faces.items():
  other=next(c for c in face['children'] if c['name']==slot['name']);assert other['position']==[x,y]
  scale=face['scale'];rows.append({'slot':i,'state':state,'authored_center':[x*scale[0],y*scale[1]],'outside_naive_delta':[x*(1-scale[0]),y*(1-scale[1])],'bottle_width':16*scale[0]})
 # structurally isolated optional prototype. Remains hidden; no claimed runtime writer.
 open_['children'].append({'name':f'sharedBottleArt{i}','kind':'container','position':[x,y],'size':[100,100],'scale':[.16,.16],'visible':False,'raycastTarget':False,'children':[{'name':f'shape{j}','kind':'image','size':[1,1],'image':100001,'visible':False,'raycastTarget':False} for j in range(10)]})
assert find(entry,'hit')==find(before,'hit')
stripped=copy.deepcopy(entry);find(stripped,'open')['children']=[c for c in find(stripped,'open')['children'] if not c['name'].startswith('sharedBottleArt')];assert stripped==before
# capacity-dependent runtime geometry if mapSlots were enabled, rather than authored static positions.
runtime={n:[{'slot':i,'normal_x':(i-(n+1)/2)*42,'pressed_x':(i-(n+1)/2)*42*.96,'outside_naive_delta':(i-(n+1)/2)*42*.04} for i in range(1,n+1)] for n in [3,5]}
proof={'defaultTreeSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'addedNodes':55,'fourFaceAlternativeNodes':220,'nodesSaved':165,'originalSubtreeUnchanged':True,'faceGeometry':rows,'conditionalRuntimeGeometry':runtime,'explicitClipProperties':{k:v for k,v in entry.items() if 'clip' in k.lower() or 'mask' in k.lower()}}
(out/'proof.json').write_text(json.dumps(proof,indent=2));(out/'prototype-entry.json').write_text(json.dumps(entry,indent=2));print('PASS structural preservation; +55 inert nodes vs +220; pressed differs (scale .96); no runtime visibility claim')
