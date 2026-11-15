// Detached source tests must copy the entry point's authenticated dependency
// closure and read owners from their own filesystem, never from the live tree.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {copyIntegrationSourceClosure} from './copy-integration-source-closure.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';

export function copyCurrentSourceFixture(directory,{crlf=false,snapshotTarget=null}={}){
 let snapshot;
 if(snapshotTarget!==null){
  assert.equal(snapshotTarget,'pcFinalPrior','only the complete retained pre-final fixture is materialized');
  for(const [path,row]of Object.entries(sourceEpoch.proof.current)){
   if(row===null)continue;
   const actual=readFileSync(path,'utf8').replaceAll('\r\n','\n');
   assert.equal(createHash('sha256').update(actual).digest('hex'),row.sha256,'fresh snapshot owner: '+path);
  }
  snapshot=sourceEpoch.proof.targets[snapshotTarget].files;
 }
 copyIntegrationSourceClosure(directory);
 const text=source=>crlf?source.replaceAll('\r\n','\n').replaceAll('\n','\r\n'):source;
 const paths=['config/architecture.json',...readdirSync('src/lua').filter(name=>name.endsWith('.lua')).map(name=>'src/lua/'+name)];
 for(const path of paths){
  if(snapshot&&snapshot[path]===null){assert(!existsSync(join(directory,path)),'historically absent source already exists: '+path);continue;}
  mkdirSync(dirname(join(directory,path)),{recursive:true});
  writeFileSync(join(directory,path),text(snapshot?snapshot[path].source:readFileSync(path,'utf8')));
 }
 if(crlf){
  for(const entry of readdirSync(join(directory,'tests/helpers'),{recursive:true,withFileTypes:true})){
   if(entry.isFile()&&/\.(?:mjs|lua)$/.test(entry.name)){
    const path=join(entry.parentPath,entry.name);
    writeFileSync(path,text(readFileSync(path,'utf8')));
   }
  }
 }
 return path=>readFileSync(join(directory,path),'utf8');
}
