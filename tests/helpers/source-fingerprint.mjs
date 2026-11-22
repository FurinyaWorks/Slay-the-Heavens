import {createHash} from 'node:crypto';

// Cache computations over exact immutable strings only. Every caller still
// reads its owners afresh and applies its own binding and authorization.
const fingerprints=new Map(),limit=8*1024*1024;
let retained=0;

export function exactSourceMatches(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 let fingerprint=fingerprints.get(text);
 if(!fingerprint){
  fingerprint={sha256:createHash('sha256').update(text).digest('hex')};
  if(text.length<=limit){
   while(fingerprints.size>=512||retained+text.length>limit){
    const first=fingerprints.keys().next().value;
    fingerprints.delete(first);
    retained-=first.length;
   }
   fingerprints.set(text,fingerprint);
   retained+=text.length;
  }
 }
 if(fingerprint.sha256!==binding.sha256)return false;
 fingerprint.gitBlob??=createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
 return fingerprint.gitBlob===binding.gitBlob;
}
