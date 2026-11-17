// Full-source continuation for historical contracts; no partial/foreign projection.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('./fork-preflight-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'cc95d5338fe8039d4384a83830f1ac67d04bbaae9f907edc7ad3e60647e7276a');
const proof=JSON.parse(gunzipSync(bytes));
for(const row of Object.values(proof.files))assert.equal(hash(row.before),row.beforeSha);
const normalize=s=>s.replaceAll('\r\n','\n');
export function beforePreflightSource(path,source){
 const row=Object.hasOwn(proof.files,path)?proof.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(normalize(source))!==row.currentSha)return source;
 const eol=source.includes('\r\n')?'\r\n':'\n';return row.before.replaceAll('\n',eol);
}
export function preflightPriorRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=beforePreflightSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
