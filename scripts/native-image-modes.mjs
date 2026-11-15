import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

export const imageModeBindingModule='abyss_image_mode_binding';
export const imageModeDigest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function entries(tree,scope){
 const result=[];
 function visit(node,path){
  const next=[...path,node.name];
  if(node.imageType!==undefined){
   assert(node.kind==='image'&&Number.isSafeInteger(node.image)&&node.image>100006,'imageType requires a gallery image: '+next.join('/'));
   assert(['basic','stretch'].includes(node.imageType),'unknown imageType: '+next.join('/'));
   result.push({scope,path:next,image:node.image,mode:node.imageType});
  }
  const names=new Set();
  for(const child of node.children??[]){assert(!names.has(child.name),'ambiguous image binding path');names.add(child.name);visit(child,next);}
 }
 for(const node of tree)visit(node,[]);
 return result;
}
function lower(tree){
 const copy=structuredClone(tree);
 const visit=node=>{delete node.imageType;for(const child of node.children??[])visit(child);};
 copy.forEach(visit);return copy;
}
export function compileImageModes(layout,templates){
 const staticModes=entries(layout.controls,'static');
 const templateModes=templates.flatMap(template=>entries([template],template.name));
 const loweredLayout={...structuredClone(layout),controls:lower(layout.controls)},loweredTemplates=lower(templates);
 const binding={schemaVersion:1,static:staticModes,templates:templateModes,templateNames:templates.map(row=>row.name)};
 const proof={schemaVersion:1,route:'documented-runtime-imageType-v1',
  source:{layout:imageModeDigest(layout),templates:imageModeDigest(templates)},
  lowered:{layout:imageModeDigest(loweredLayout),templates:imageModeDigest(loweredTemplates)},
  bindingSha256:imageModeDigest(binding),staticRequests:staticModes.length,templateRequests:templateModes.length,
  compiler:sourceRecord(new URL(import.meta.url),'scripts/native-image-modes.mjs'),
  writer:sourceRecord(new URL('../src/lua/abyss_image_modes.lua',import.meta.url),'src/lua/abyss_image_modes.lua'),
  nativeControlsAdded:0};
 return {layout:loweredLayout,templates:loweredTemplates,binding,proof};
}
export function imageModeCodeRecord(raw,path){
 const bytes=Buffer.from(Buffer.from(raw).toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'));
 return {path,normalization:'optional-utf8-bom-and-crlf-lf-only',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
}
// SourceInputs/moduleDigests retain physical bytes. This portable code identity
// must also authenticate the same pinned Git archive on Windows and POSIX.
function sourceRecord(url,path){return imageModeCodeRecord(readFileSync(url),path);}
// Recompute from immutable intent. Missing, extra, reordered or stale rows fail;
// the lowered tree is only a static codec input, never a replacement intent tree.
export function verifyImageModes(layout,templates,compiled){
 assert.equal(imageModeDigest(compiled),imageModeDigest(compileImageModes(layout,templates)),'image mode source/lowered/binding coverage differs');
 return true;
}
const keys=(value,wanted)=>assert.deepEqual(Object.keys(value).sort(),[...wanted].sort(),'complete mode encoding fields');
const text=value=>{assert.equal(typeof value,'string');assert(value.length>0);return value;};
const integer=(value,max)=>{assert(Number.isSafeInteger(value)&&value>=1&&value<=max,'mode dictionary index');return value;};
export function packImageModes(binding){
 keys(binding,['schemaVersion','static','templates','templateNames']);assert.equal(binding.schemaVersion,1);
 const templateNames=binding.templateNames.map(text);assert.equal(new Set(templateNames).size,templateNames.length);
 const names=[],nodes=[],pool=new Map(),paths=new Map(),modes=['basic','stretch'];
 function path(parts){
  assert(Array.isArray(parts)&&parts.length>0,'complete mode path');let parent=0;
  for(const part of parts){
   text(part);if(!pool.has(part)){names.push(part);pool.set(part,names.length);}
   const key=parent+':'+part;
   if(!paths.has(key)){nodes.push([parent,pool.get(part)]);paths.set(key,nodes.length);}
   parent=paths.get(key);
  }
  return parent;
 }
 function row(r,scope){
  keys(r,['scope','path','image','mode']);assert.equal(r.scope,scope);
  assert(Number.isSafeInteger(r.image)&&r.image>100006,'gallery mode image identity');
  const mode=integer(modes.indexOf(r.mode)+1,modes.length);
  return [path(r.path),r.image,mode];
 }
 const packed={schemaVersion:1,names,nodes,modes,templateNames,
  static:binding.static.map(r=>row(r,'static')),
  templates:binding.templates.map(r=>[integer(templateNames.indexOf(r.scope)+1,templateNames.length),...row(r,r.scope)])};
 verifyImageModeDictionary(packed,binding);
 return packed;
}
export function unpackImageModes(packed){
 keys(packed,['schemaVersion','names','nodes','modes','templateNames','static','templates']);assert.equal(packed.schemaVersion,1);
 assert.deepEqual(packed.modes,['basic','stretch'],'documented mode names');
 const names=packed.names.map(text),templateNames=packed.templateNames.map(text);
 assert.equal(new Set(names).size,names.length);assert.equal(new Set(templateNames).size,templateNames.length);
 const paths=[];packed.nodes.forEach((node,index)=>{
  assert(Array.isArray(node)&&node.length===2);const[parent,id]=node;
  assert(Number.isSafeInteger(parent)&&parent>=0&&parent<=index,'acyclic preceding mode path parent');
  paths.push([...(parent?paths[parent-1]:[]),names[integer(id,names.length)-1]]);
 });
 function row(r,scope,offset){
  assert(Array.isArray(r)&&r.length===offset+3,'complete encoded mode row');
  const path=paths[integer(r[offset],paths.length)-1],image=r[offset+1],mode=packed.modes[integer(r[offset+2],packed.modes.length)-1];
  assert(Number.isSafeInteger(image)&&image>100006,'gallery mode image identity');
  return {scope,path,image,mode};
 }
 return {schemaVersion:1,static:packed.static.map(r=>row(r,'static',0)),
  templates:packed.templates.map(r=>row(r,templateNames[integer(r[0],templateNames.length)-1],1)),templateNames};
}
export function verifyImageModeDictionary(packed,binding){
 assert.equal(imageModeDigest(unpackImageModes(packed)),imageModeDigest(binding),'lossless complete mode dictionary identity');
 return true;
}
export function renderImageModeBinding(binding,toLua){
 assert.equal(typeof toLua,'function');
 const header='-- Complete gallery intent; applied before page publication.\n';
 const full=header+'return '+toLua(binding)+'\n',packed=packImageModes(binding);
 const compact=header+`-- Local dictionary indices are not native SDK enum values.
local encoded=${toLua(packed)}
assert(encoded.schemaVersion==1,'mode dictionary schema')
local paths={}
for i,node in ipairs(encoded.nodes)do
 assert(type(node[1])=='number'and node[1]>=0 and node[1]<i and node[1]%1==0,'mode path parent')
 local path={}
 if node[1]>0 then for k,v in ipairs(assert(paths[node[1]]))do path[k]=v end end
 path[#path+1]=assert(encoded.names[node[2]],'mode path name');paths[i]=path
end
local function row(value,scope,offset)
 local image=value[offset+2];assert(type(image)=='number'and image>100006 and image%1==0,'mode image')
 local mode=encoded.modes[value[offset+3]];assert(mode=='basic'or mode=='stretch','mode name')
 return{scope=scope,path=assert(paths[value[offset+1]],'mode path'),image=image,mode=mode}
end
local binding={schemaVersion=1,static={},templates={},templateNames=encoded.templateNames}
for i,value in ipairs(encoded.static)do binding.static[i]=row(value,'static',0)end
for i,value in ipairs(encoded.templates)do
 binding.templates[i]=row(value,assert(encoded.templateNames[value[1]],'mode template'),1)
end
return binding
`;
 // Tiny/default bindings keep their exact original literal: encoding never
 // increases a generated module or changes its returned runtime schema.
 return Buffer.byteLength(compact)<Buffer.byteLength(full)?compact:full;
}
