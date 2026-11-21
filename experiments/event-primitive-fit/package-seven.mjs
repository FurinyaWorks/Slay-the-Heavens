import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {portableHalfMasks} from './portable-half-mask.mjs';
const [repo,variants,shrine,out]=process.argv.slice(2).map(x=>resolve(x));
const {simulatorSave}=await import(pathToFileURL(join(repo,'experiments/coop-primitive-lab/build.mjs')));
const read=p=>JSON.parse(readFileSync(p)), save=(p,obj)=>writeFileSync(p,JSON.stringify(obj)+'\n');
const events=['cleric','purifier','goop','upgrade_shrine','golden_wing','shining_light','golden_shrine'];
const sweeps=read(variants),manual=read(shrine);
assert.equal(sweeps.exportHalfMaskMode,'left-mirror-x');
assert.equal(manual.exportHalfMaskMode,'left-mirror-x');
const fits={},cases=[];
mkdirSync(out,{recursive:true});
for(const id of events){
 const row=(id==='golden_shrine'?manual:sweeps).fits[id+'_48'];
 const root=structuredClone(row.controlTree);root.name=id;
 assert.equal(root.children.length,48);
 assert(root.children.every(node=>node.kind==='image'&&node.raycastTarget===false));
 fits[id]={...row,controlTree:root};
 const filename=id+'.save.json', scene=join(out,filename);
 save(scene,simulatorSave(id,{roots:[portableHalfMasks(root)]}));
 const sha256=createHash('sha256').update(readFileSync(scene)).digest('hex');
 cases.push({id,filename,sha256,expectedCreated:49,expectedInitialVisible:49,expectedPeakVisible:49});
}
save(join(out,'inventory.json'),{room:{min:1,max:2},cases});
save(join(out,'selected-native-controls.json'),{schemaVersion:1,canvas:[330,330],exportHalfMaskMode:'left-mirror-x',fits,
  integratedWithGame:false,officialCapacity:'NOT_RUN',physicalDevices:'NOT_RUN'});
