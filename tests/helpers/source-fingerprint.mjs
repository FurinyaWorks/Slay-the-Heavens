import {createHash} from 'node:crypto';

// Cache computations over exact immutable strings only. Every caller still
// reads its owners afresh and applies its own binding and authorization.
const fingerprints=new Map(),limit=8*1024*1024;
let retained=0;

export function exactSourceMatches(source,binding){
 if(typeof source!=='string')return false;
 let fingerprint=fingerprints.get(source);
 if(!fingerprint){
  if(source.includes('\r\r\n'))return false;
  const text=source.replaceAll('\r\n','\n');
  const length=text===source?source.length:source.length+text.length;
  fingerprint={text,length,sha256:createHash('sha256').update(text).digest('hex')};
  if(length<=limit){
   while(fingerprints.size>=512||retained+length>limit){
    const first=fingerprints.keys().next().value;
    retained-=fingerprints.get(first).length;
    fingerprints.delete(first);
   }
   fingerprints.set(source,fingerprint);
   retained+=length;
  }
 }
 if(fingerprint.sha256!==binding.sha256)return false;
 const {text}=fingerprint;
 fingerprint.gitBlob??=createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
 return fingerprint.gitBlob===binding.gitBlob;
}
