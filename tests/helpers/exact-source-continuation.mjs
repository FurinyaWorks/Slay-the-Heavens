import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const hash=source=>createHash('sha256').update(source).digest('hex');
const normalize=source=>source.replaceAll('\r\n','\n');

export function exactSourceContinuation({path,before,after}){
 function same(source,binding){
  if(typeof source!=='string')return false;
  return typeof binding.source==='string'?normalize(source)===binding.source:hash(normalize(source))===binding.sha256;
 }
 function exact(binding,expected){
  return binding?.sha256===expected.sha256&&binding?.gitBlob===expected.gitBlob&&same(binding.source,expected);
 }
 function project(file,source,binding){
  return file===path&&exact(binding,before)&&same(source,after)?before.source:source;
 }
 function authorize(file,input,binding,samples,read){
  const entries=[[file,input,binding],...samples].filter(([p,,b])=>p===path&&(exact(b,before)||exact(b,after)));
  if(!entries.some(([, ,b])=>exact(b,before)))return;
  const expected=same(entries[0][1],after)?after:before;
  const message='combined linked owner identity: '+path+' changed during owner validation';
  for(const [,source]of entries)assert(same(source,expected),message);
  if(expected===before)return;
  let live;try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(same(live,expected),message);
 }
 function predecessor(file,source,read){
  const prior=project(file,source,before);
  if(prior!==source)authorize(file,source,before,[],read);
  return prior;
 }
 return {project,authorize,predecessor};
}
