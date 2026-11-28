import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches} from './source-fingerprint.mjs';

// The combined replay verifies its old owners byte-for-byte. Admit only the
// reviewed STS details replacements before entering that frozen proof.
const archive=readFileSync(new URL('../fixtures/release-sts-detail-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),
 '8f755b932e94da02b8ed36d85b52a7c663a7fb896e1a55670d1504dbb8b07bf8','exact STS detail replay owners');
const {base,head,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'95b003d41a229218916d20785145cd4a7e9583fe');
assert.equal(head,'01863013d8647e991187b945b7f509b075637f33');
for(const [path,{before}] of Object.entries(files))
 assert(exactSourceMatches(before.source,before),'exact STS detail predecessor: '+path);

const owned=path=>Object.hasOwn(files,path);
const lineFormat=source=>{
 if(typeof source!=='string')return;
 const lf=source.replaceAll('\r\n','\n');
 if(!lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n')))return lf;
};

export function beforeStsDetailSource(path,source){
 const binding=owned(path)&&files[path];
 if(!binding||lineFormat(source)===undefined||!exactSourceMatches(source,binding.after))return source;
 return source.includes('\r\n')?binding.before.source.replaceAll('\n','\r\n'):binding.before.source;
}

export function readStsDetailOwners(read){
 if(typeof read!=='function')return read;
 const observed=new Map();
 return path=>{
  const raw=read(path);
  if(!owned(path))return raw;
  const value=lineFormat(raw)??raw;
  if(observed.has(path))assert.equal(value,observed.get(path),'combined linked owner identity: '+path+' changed during STS detail replay');
  else observed.set(path,value);
  return beforeStsDetailSource(path,raw);
 };
}
