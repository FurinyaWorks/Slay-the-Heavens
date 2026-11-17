// Bounded storage for exact original evidence bytes; no filesystem writes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {brotliDecompressSync,gzipSync,gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Only this UTF-8 JSON source declares LF identity. All gzip/Brotli bytes keep
// their exact physical hashes, including empty original logs.
const metadataBytes=bytes=>{
 assert(Buffer.isBuffer(bytes),'exact evidence manifest bytes');
 const text=bytes.toString('utf8');assert(Buffer.from(text).equals(bytes),'UTF8 evidence manifest');
 return Buffer.from(text.replaceAll('\r\n','\n'));
};
export const itemEvidenceManifestPath='docs/evidence/release-item-storage-20261116/manifest.json';
export const itemEvidencePayloadPath='docs/evidence/release-item-storage-20261116/receipts.br';
const manifestSha='4a5a92a7e726201156b9eabb31de3057ba01da1d620c41ed86868cf70e77ef12';
const manifestBytes=metadataBytes(readFileSync(new URL('../'+itemEvidenceManifestPath,import.meta.url)));
assert.equal(hash(manifestBytes),manifestSha,'complete original item evidence manifest');
const manifest=JSON.parse(manifestBytes),members=new Map();
assert.equal(manifest.schemaVersion,1);assert.equal(manifest.layer,'exact-original-gzip-evidence-storage');
assert.equal(manifest.head,'51f5423660423d479e52cb22dc9f298a62d8dd73');
assert.equal(manifest.base,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
assert.equal(manifest.codec,'brotli-q11-mixed-exact-raw-and-literal-gzip');
assert.equal(manifest.entries.length,252);assert.equal(manifest.rawPayloadBytes,19080325);
assert.equal(manifest.compressedBytes,1975741);
let offset=0;
for(const row of manifest.entries){
 assert(/^docs\/evidence\/[A-Za-z0-9_./-]+\.gz$/.test(row.path)&&!row.path.split('/').includes('..'),'bounded evidence member path');
 assert(!members.has(row.path),'unique evidence member');assert.equal(row.offset,offset);
 assert(Number.isSafeInteger(row.bytes)&&row.bytes>=0);offset+=row.bytes;
 assert(Number.isSafeInteger(row.rawBytes)&&row.rawBytes>=0);
 assert(Number.isSafeInteger(row.originalGzipBytes)&&row.originalGzipBytes>0);
 for(const key of ['rawSha256','originalGzipSha256'])assert.match(row[key],/^[a-f0-9]{64}$/);
 assert.match(row.originalGitBlob,/^[a-f0-9]{40}$/);
 assert(['exact-raw-node-gzip','literal-original-gzip'].includes(row.mode));
 if(row.mode==='exact-raw-node-gzip'){
  assert(Number.isInteger(row.level)&&row.level>=0&&row.level<=9);assert.match(row.headerHex,/^1f8b0800[a-f0-9]{12}$/);
 }
 members.set(row.path,Object.freeze({...row}));
}
assert.equal(offset,manifest.rawPayloadBytes);
// Pure decompression is reused only after BOTH complete physical inputs have
// freshly passed their fixed hashes. Caller input authorization is never cached.
let decoded;
function currentPayload(read){
 const metadata=metadataBytes(read(itemEvidenceManifestPath));
 assert.equal(hash(metadata),manifestSha,'fresh complete original item evidence manifest');
 const packed=read(itemEvidencePayloadPath);assert(Buffer.isBuffer(packed),'exact evidence payload bytes');
 assert.equal(packed.length,manifest.compressedBytes,'complete original item evidence storage size');
 assert.equal(hash(packed),manifest.compressedSha256,'fresh complete original item evidence storage');
 if(!decoded){
  const raw=brotliDecompressSync(packed,{maxOutputLength:manifest.rawPayloadBytes});
  assert.equal(raw.length,manifest.rawPayloadBytes);assert.equal(hash(raw),manifest.rawPayloadSha256,'complete decoded original item evidence storage');decoded=raw;
 }
 return decoded;
}
export function readReleaseItemEvidence(path,{read=readFileSync}={}){
 const row=members.get(path);if(!row)return read(path);
 const raw=currentPayload(read),piece=raw.subarray(row.offset,row.offset+row.bytes);
 let original=piece;
 if(row.mode==='exact-raw-node-gzip'){
  assert.equal(hash(piece),row.rawSha256,'exact original raw evidence: '+path);
  const compressed=gzipSync(piece,{level:row.level,mtime:0});
  original=Buffer.concat([Buffer.from(row.headerHex,'hex'),compressed.subarray(10)]);
 }
 assert.equal(original.length,row.originalGzipBytes,'exact original gzip size: '+path);
 assert.equal(hash(original),row.originalGzipSha256,'exact original gzip bytes: '+path);
 assert.equal(createHash('sha1').update(`blob ${original.length}\0`).update(original).digest('hex'),row.originalGitBlob,'exact original evidence Git blob: '+path);
 const uncompressed=gunzipSync(original,{maxOutputLength:Math.max(1,row.rawBytes)});
 assert.equal(uncompressed.length,row.rawBytes);assert.equal(hash(uncompressed),row.rawSha256,'exact original decoded evidence: '+path);
 return Buffer.from(original);
}
export function assertReleaseItemEvidenceCurrent(read=readFileSync){currentPayload(read);}
export function releaseItemEvidenceRead(read=readFileSync){return(path,encoding)=>{
 if(!members.has(path))return read(path,encoding);
 const bytes=readReleaseItemEvidence(path,{read});return encoding?bytes.toString(encoding):bytes;
};}
export const itemEvidenceMembers=Object.freeze([...members.keys()]);
