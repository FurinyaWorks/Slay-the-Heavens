import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,basename,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {bridge} from '../art-tech-lab/rpc.mjs';
import {inventory} from './scenes.mjs';

const [directory,filter]=process.argv.slice(2);
assert(directory,'run.mjs <generated directory> [case prefix]');
const {room,cases}=JSON.parse(readFileSync(join(directory,'inventory.json')));
const selected=cases.filter(row=>!filter || row.id.startsWith(filter));
assert(selected.length,'No matching experiment case');
const bridgeClient=bridge();
const unpack = result=>result.structuredContent??JSON.parse(result.content.find(item=>item.type==='text').text);
const call = async (name,args)=>unpack(await bridgeClient.call(name,args));
const save = (path,data)=>writeFileSync(path,data,{flag:'wx'});
const sha = data=>createHash('sha256').update(data).digest('hex');
const report={environment:{node:process.version,platform:process.platform,simulator:'beyond-simulator-mcp@0.5.2',
  canvas:'mobile-16-9',clockMode:'manual'},room,official:'UNVERIFIED',cases:[]};

try {
  await bridgeClient.request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'coop-primitive-lab',version:'1'}});
  for (const row of selected) {
    const out=join(directory,row.id);
    mkdirSync(out);
    const file=join(directory,row.filename);
    assert.equal(sha(readFileSync(file)),row.sha256);
    const result={id:row.id,saveSha256:row.sha256,samples:[],exports:[]};
    report.cases.push(result);
    const {handle}=await call('qxqy_project_open',{path:relative(process.cwd(),resolve(file))});
    const play=(action,args={})=>call('qxqy_studio_play',{handle,action,args});
    try {
      const t=performance.now();
      const state=await play('start',{inspect:true,paint:true,canvasId:'mobile-16-9',clockMode:'manual',
        playerCount:row.view ? room.max : room.min,viewPlayerIndex:row.view==='B'?2:1});
      result.hostStartRpcMs=performance.now()-t;
      result.viewPlayerIndex=state.viewPlayerIndex;
      result.playerCount=state.playerCount;
      result.canvas=[state.canvasWidth,state.canvasHeight];
      function sample(snapshot) {
        result.logs=snapshot.logs;
        assert.equal(snapshot.mountError,null);
        const faults=snapshot.logs.filter(log=>/error|failed|timeout/i.test(log.level+' '+log.text));
        assert.deepEqual(faults,[]);
        const counts=inventory(snapshot.tree);
        result.samples.push({time:snapshot.time,frame:snapshot.frame,...counts,
          ...(snapshot.paint.length && {paintEntries:snapshot.paint.length})});
        assert.equal(counts.created,row.expectedCreated);
      }
      sample(state);
      assert.equal(result.samples[0].visible,row.expectedInitialVisible);
      assert.equal(state.playerCount,row.view ? room.max : room.min);
      assert.equal(state.viewPlayerIndex,row.view==='B'?2:1);
      if (row.view) {
        const shot=await bridgeClient.call('qxqy_studio_play_screenshot',{handle});
        const png=shot.content.find(item=>item.type==='image');
        assert(png,'Simulator did not produce a screenshot');
        const bytes=Buffer.from(png.data,'base64');
        save(join(out,'static.png'),bytes);
        result.screenshot={...unpack(shot),sha256:sha(bytes)};
        assert.deepEqual(result.screenshot.assetWarnings,[]);
        for (let i=0;i<12;i++) sample(await play('step',{dt:1.001,inspect:true,paint:i===3}));
        for (const phase of [0,1,2,3,4,5]) assert(result.logs.some(log=>log.text==='COOP_LAB phase='+phase));
      }
      result.peakVisible=Math.max(...result.samples.map(sample=>sample.visible));
      assert.equal(result.peakVisible,row.expectedPeakVisible);
      result.simulator='PASS';
    } catch (error) {
      result.simulator='FAIL';
      result.error=String(error);
      process.exitCode=1;
    } finally {
      await play('stop');
    }
    try {
      const format=row.dynamic ? 'save-gia' : 'gia';
      const exported=await call('qxqy_studio_export',{handle,action:'export',args:{format,
        assetType:'server-control-template'}});
      const files=exported.files??[exported];
      assert(files.length && files.every(asset=>asset.data),'Simulator did not export an asset');
      for (const asset of files) {
        const data=Buffer.from(asset.data,'base64'), filename=basename(asset.filename);
        save(join(out,filename),data);
        result.exports.push({filename,bytes:data.length,sha256:sha(data),warnings:asset.warnings??[]});
      }
    } catch (error) {
      result.exportError=String(error);
      process.exitCode=1;
    }
    console.log(row.id,result.simulator,result.samples[0]?.created,result.peakVisible,result.error??result.exportError??'');
  }
} finally {
  bridgeClient.close();
  save(join(directory,`simulator-${filter??'all'}.json`),JSON.stringify(report,null,2)+'\n');
}
