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
function sourceRecord(url,path){const bytes=readFileSync(url);return {path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
// Recompute from immutable intent. Missing, extra, reordered or stale rows fail;
// the lowered tree is only a static codec input, never a replacement intent tree.
export function verifyImageModes(layout,templates,compiled){
 assert.equal(imageModeDigest(compiled),imageModeDigest(compileImageModes(layout,templates)),'image mode source/lowered/binding coverage differs');
 return true;
}
