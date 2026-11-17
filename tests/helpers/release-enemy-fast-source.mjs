// Dedicated exact CI source seam for PR710 and the actual PR707 Release base.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const normalized=s=>typeof s==='string'&&!s.includes('\r\r\n')?s.replaceAll('\r\n','\n'):null;
const archive='tests/helpers/release-enemy-fast-source.json.gz',digest='89c3967f38222934b5e0afc59117973b717a7048f5f02ea7c288b7a9cd928efc';
const bytes=readFileSync(new URL('./release-enemy-fast-source.json.gz',import.meta.url));
assert.equal(hash(bytes),digest,'complete enemy/Fast CI source seam');
const packet=JSON.parse(gunzipSync(bytes));
assert.deepEqual(packet.parents,{enemy:'d0c82e64e6c0f60aa64d163e398894e6853f318d',release:'af77fb2461c548f0faf104761d107397f75dca08'});
for(const [path,row]of Object.entries(packet.files))for(const binding of Object.values(row.views)){
 assert.equal(normalized(binding.source),binding.source,path+' complete LF parent');
 assert.equal(hash(binding.source),binding.sha256,path+' complete parent source');
}
export function assertEnemyFastArchive(read=readFileSync){assert.equal(hash(read(archive)),digest,'fresh complete enemy/Fast CI source seam');}
export function assertEnemyFastCurrent(read=readFileSync){
 assertEnemyFastArchive(read);
 for(const [path,row]of Object.entries(packet.files)){
  const source=normalized(read(path,'utf8'));
  assert(source!==null&&hash(source)===row.currentSha256,'fresh complete integration source: '+(row.owner==='enemy'?'enemy capacity ':'enemy/Fast ')+path);
 }
}
// Keep StS's existing named owner rejection ahead of broader join validation.
export function assertEnemyFastStsOwners(paths,read=readFileSync){
 for(const path of paths){
  const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;if(!row)continue;
  const source=normalized(read(path,'utf8'));
  assert(source!==null&&hash(source)===row.currentSha256,'fresh complete StS CI source: '+path);
 }
}
export function enemyFastSource(path,source,side){
 if(!Object.hasOwn(packet.parents,side)||typeof path!=='string'||path.startsWith('src/')||path.startsWith('data/')||path.startsWith('config/'))return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,binding=row?.views[side],text=normalized(source);
 if(!binding||text===null||hash(text)!==row.currentSha256)return source;
 return source.includes('\r\n')?binding.source.replaceAll('\n','\r\n'):binding.source;
}
export function enemyFastRead(side,read=readFileSync){
 assert(Object.hasOwn(packet.parents,side),'known enemy/Fast CI parent');
 return(path,encoding)=>{const raw=read(path,encoding);return typeof raw==='string'?enemyFastSource(path,raw,side):raw;};
}
