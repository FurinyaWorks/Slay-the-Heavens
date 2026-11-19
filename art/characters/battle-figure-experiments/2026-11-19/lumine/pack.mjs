import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [tool, base, batchDir, out]=process.argv.slice(2).map(p=>path.resolve(p));
const toolPin='bcc75795ebf17271612332fc81645336686bd94c', basePin='b3b46b0412caf865ebc259c15ad8215b33a1797ab7940861eb562320541e13a2';
const sha=b=>createHash('sha256').update(b).digest('hex'), read=f=>fs.readFileSync(f);
assert.equal(execFileSync('git',['-C',tool,'rev-parse','HEAD']).toString().trim(),toolPin);
assert.equal(sha(read(base)),basePin);
assert(!fs.existsSync(out),'Use a fresh output directory');
fs.mkdirSync(out,{recursive:true});
const {listInterface,addClientTemplate,getClientUi,setClientScript,listClientScripts,addClientUi}=
 await import(pathToFileURL(path.join(tool,'src/scene-save.mjs')));
const name='LumineArtOnly', host='LumineFigureHost', template='LumineShapeTemplate';
const bm=JSON.parse(read(path.join(batchDir,'batches.json'))), canvas=bm.canvas;
assert.deepEqual(listInterface({mapPath:base}).clientInterfaces,[]);
assert.deepEqual(listClientScripts({mapPath:base}).scripts,[]);
assert(bm.batches.length&&bm.batches.length<=60);
let last=addClientTemplate({mapPath:base,name:template,kind:'image',image:100001,size:[1,1],outputName:'template'},out);
assert(Number.isInteger(last.templateIndex)&&last.templateIndex>0&&last.templateIndex!==100001);
const templateIndex=last.templateIndex, rows=[], actualLua=[];
for (const b of bm.batches) {
 assert(b.count>0&&b.count<=60&&b.start===(rows.at(-1)?.start??0)+(rows.at(-1)?.count??0));
 const exported=read(path.join(batchDir,b.name+'.lua')).toString('utf8');
 assert.equal(sha(exported),b.sha256);
 assert.equal((exported.match(/local IMAGE_PREFAB_ID = 0\b/g)||[]).length,1);
 const source=exported.replace('local IMAGE_PREFAB_ID = 0',`local IMAGE_PREFAB_ID = ${templateIndex}`);
 assert(source.includes('image:SetLocalRotation(ROTATIONS[index][1], ROTATIONS[index][2], item[14])'));
 assert(source.includes('Color.FromRGBA(item[15], item[16], item[17], item[18])'));
 // Entire script is checked by the pinned writer before it is committed to the offline copy.
 last=setClientScript({mapPath:last.mapPath,name:b.name,source,outputName:b.name},out);
 assert.deepEqual(last.callbacks,['OnStart','OnDestroy']);
 actualLua.push({name:b.name,source});
 rows.push({...b, boundSHA256:sha(source), boundBytes:Buffer.byteLength(source), scriptId:last.scriptId});
}
const drafts=bm.batches.map(b=>({name:b.name,kind:'container',position:[0,0],size:canvas,script:b.name}));
const final=addClientUi({mapPath:last.mapPath,name,controls:[{name:host,kind:'container',position:[0,0],size:canvas,children:drafts}],outputName:'Lumine-Art-Only-OFFLINE'},out);
const ir=getClientUi({mapPath:final.mapPath,ui:name});
const bHost=ir.interface.controls[0];
assert.equal(ir.interface.controls.length,1);
assert.equal(bHost.name,host);
assert.equal(bHost.kind,'container');
assert.deepEqual(bHost.size,canvas);
assert.deepEqual(bHost.position,[0,0]);
assert.equal(bHost.children.length,rows.length);
for(let i=0;i<rows.length;i++){
 const bg=bHost.children[i],row=rows[i];
 assert.equal(bg.kind,'container');
 assert.equal(bg.name,row.name);
 assert.deepEqual(bg.size,canvas);
 assert.deepEqual(bg.position,[0,0]);
 assert(!bg.children?.length);
 assert(jsScript(bg.scripts,row.name),JSON.stringify(bg.scripts));
 row.containerId=ir.ids[host+'/'+row.name];
 assert(Number.isInteger(row.containerId));
}
assert.equal(Object.keys(ir.ids).length,rows.length+3);
assert.equal(ir.rootId,final.rootId);
const templateBack=getClientUi({mapPath:final.mapPath,template});
assert.equal(templateBack.templateIndex,templateIndex);
assert.equal(templateBack.template.kind,'image');
assert.equal(templateBack.template.image,100001);
assert.equal(templateBack.template.mask??false,false);
assert.equal(templateBack.template.visible??true,true);
assert.equal(templateBack.template.active??true,true);
assert(!templateBack.template.children?.length);
const get=listClientScripts({mapPath:final.mapPath,includeSource:true}).scripts;
assert.equal(get.length,rows.length);
for(const r of rows){
 const found=get.find(s=>s.name===r.name),expected=actualLua.find(s=>s.name===r.name);
 assert.equal(found.scriptId,r.scriptId);
 assert.deepEqual(found.on,[r.name]);
 assert.equal(found.source,expected.source);
}
assert.equal(sha(read(base)),basePin);
assert.deepEqual(listInterface({mapPath:final.mapPath}).clientInterfaces.map(x=>x.name),[name]);
function jsScript(s,name){ return s?.length===1&&(s[0]===name||s[0].name===name); }
const bytes=read(final.mapPath);
const result={schemaVersion:1, scope:'Existing official editor sample-derived offline GIL. Not a project save or release; no official import/device shot/startup/fps claims.',
 toolPin,baseSHA256:basePin,baseBytes:fs.statSync(base).size,literalSHA256:bm.literalSha256,editor:bm.editor,
 name, rootId:ir.rootId, dedicatedHost:{id:ir.ids[host],name:host,canvas},
 file:path.basename(final.mapPath),sha256:sha(bytes),fileBytes:bytes.length,template:{id:templateIndex,name:template},
 count:{mountedBatches:rows.length,staticShapeControls:0,predictedNativeImagesOnStart:rows.reduce((a,b)=>a+b.count,0),
  maxDirectChildrenPerBatch:Math.max(...rows.map(r=>r.count)),dedicatedHostContainers:1,interfaceRootContainers:1},
 sourceBytes:rows.reduce((a,b)=>a+b.boundBytes,0),tests:['ordered host and batch ID readback','native image template readback with mask disabled','each bound Lua source byte-for-byte readback','all client scripts syntax-checked by existing setClientScript'],validation:'offline only; actual native renderer and device import unverified',batches:rows};
fs.writeFileSync(path.join(out,'gil-proof.json'),JSON.stringify(result,null,2)+'\n');
fs.copyFileSync(final.mapPath,path.join(out,path.basename(final.mapPath)),fs.constants.COPYFILE_EXCL);
// Intermediates are disposable local copies. Leave retained only inside workspace.
console.log(JSON.stringify(result));
