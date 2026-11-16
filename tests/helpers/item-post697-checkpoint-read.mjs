// Test fixtures for the two immutable parent domains. These are declared
// historical inputs, never runtime authorization or current-to-history readers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {itemPost697CiPacket} from './item-post697-ci-source.mjs';
import {itemBeforeMapSourceEpoch,preItemPost697SourceEpoch} from './closeout-source-epoch.mjs';
const epochs={item:itemBeforeMapSourceEpoch,release:preItemPost697SourceEpoch};
export function itemPost697CheckpointRead(target,read=readFileSync){
 assert(Object.hasOwn(epochs,target),'explicit immutable parent fixture');
 const production=epochs[target].proof.current;
 return(path,encoding)=>{
  const row=typeof path==='string'&&Object.hasOwn(production,path)?production[path]
   :typeof path==='string'&&Object.hasOwn(itemPost697CiPacket.files,path)?itemPost697CiPacket.files[path].views[target]:null;
  if(!row)return read(path,encoding);
  const bytes=Buffer.from(row.source);
  return typeof encoding==='string'?bytes.toString(encoding):bytes;
 };
}
