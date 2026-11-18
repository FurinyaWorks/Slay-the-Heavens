// Actual SDK same-host surface replacement/cancellation contract, no desktop input.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const [sdkPath,outArg='build/monster-low-budget']=process.argv.slice(2);assert(sdkPath);
const out=path.resolve(outArg),read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sdk=await import(pathToFileURL(path.resolve(sdkPath)));
const jaw=read(path.join(out,'jaw_worm/sample.save.json')),hex=read(path.join(out,'hexaghost/sample.save.json'));
const project=structuredClone(jaw.assets.server),stage=project.root.children[0];
stage.name='SwitchHost';stage.children=[];
const client=structuredClone(jaw.assets.client);client.root.children=[];
const choices=[['jaw100',jaw,1],['hex400',hex,3],['jaw200',jaw,2]],ids={};
for(const [name,save,index]of choices){
 const raw=structuredClone(save.assets.server.root.children[0].children.find(n=>n.name==='actor'+index));
 raw.name=name;for(const t of Object.values(raw.transformByPlatform))t.offset={x:0,y:0};
 client.root.children.push(raw);ids[name]=raw.guid;
}
const session=sdk.Gr(project,{templatesProject:client,canvasId:'mobile-16-9'}),runtime=session.runtime;
const host=runtime.roots.find(n=>n.name==='SwitchHost');assert(host);
const hostId=host.Id,sourcePath='experiments/monster-low-budget/switch.lua';
const mounted=runtime.mountScript({path:'monster-low-budget-switch.lua',control:host,source:fs.readFileSync(sourcePath,'utf8')});
const report={schemaVersion:1,status:'running',scope:'Actual SDK template instances in one persistent host. Experimental lifecycle only; not production actor manager.',
 sdkSha256:sha(sdkPath),luaSha256:sha(sourcePath),driverSha256:sha(new URL(import.meta.url)),
 sampleSaves:['jaw_worm','hexaghost'].map(enemy=>({enemy,sha256:sha(path.join(out,enemy,'sample.save.json'))})),steps:[]};
function step(name,source){
 const before=runtime.logs.length;runtime.runChunk(mounted.env,source,name);sdk.dn(session,1/60);
 assert.equal(runtime.logs.slice(before).filter(l=>l.level==='lua-error').length,0,JSON.stringify(runtime.logs.slice(before)));
 assert.equal(host.Id,hostId);report.steps.push({name,controls:runtime.controlsById.size,hostId});
}
try{
 step('jaw100',`Request(${ids.jaw100})`);
 step('assert-jaw100','AssertState(1,0,0,0)');
 const firstCount=runtime.controlsById.size;
 step('cancel-pending-replacement',`Request(${ids.hex400});Request(${ids.jaw100})`);
 assert.equal(runtime.controlsById.size,firstCount,'Returning to live A must cancel queued B');
 const hits=[...runtime.controlsById.values()].filter(control=>control.name==='hit');assert.equal(hits.length,1);
 const boxes=sdk.wi(session),matrix=sdk.pa(session,boxes).get(hits[0].Id),box=boxes.get(hits[0].Id);
 const point=sdk.Me(matrix,box.centerX,box.centerY);sdk.vi(session,'move',point.x,point.y);
 assert.equal(sdk.vi(session,'down',point.x,point.y)?.Id,hits[0].Id);sdk.dn(session,1/60);
 sdk.vi(session,'up',point.x,point.y);sdk.dn(session,1/60);
 step('retained-owner-click','AssertState(1,0,1,0,1)');
 step('same-identity-reuse',`Request(${ids.jaw100});AssertState(1,0,2,0)`);
 assert.equal(runtime.controlsById.size,firstCount);
 step('replace-with-hex400',`Request(${ids.hex400})`);
 step('old-callback-rejected','DelayedOldCallback();AssertState(2,1,2,1)');
 step('replace-with-jaw200',`Request(${ids.jaw200})`);
 step('close','Close();DelayedOldCallback();AssertState(3,3,2,2)');
 const closedCount=runtime.controlsById.size;assert.equal(closedCount,1,'Only persistent host remains');
 step('cancel-before-construction',`Request(${ids.hex400});Close()`);
 assert.equal(runtime.controlsById.size,closedCount,'Cancelled creation revived a surface');
 step('cancel-old-callback-rejected','DelayedOldCallback();AssertState(3,3,2,3)');
 report.reusedHost=true;report.surfaceTemplatesCreated=3;report.surfaceTemplatesDestroyed=3;
 report.sameIdentityReuses=2;report.staleCallbacksRejected=3;report.cancelledCreationAllocated=0;
 report.pendingReplacementCancellations=1;report.retainedOwnerClicksAccepted=1;
 report.status='pass';
}finally{
 runtime.destroy();report.remainingControls=runtime.controlsById.size;
 assert.equal(report.remainingControls,0);fs.writeFileSync(path.join(out,'switch-receipt.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({status:report.status,steps:report.steps.length,remainingControls:report.remainingControls}));
