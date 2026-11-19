import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {integratedSource,integratedRead} from '../../../tests/helpers/integrated-ci-source.mjs';
import {integrationCiSource} from '../../../tests/helpers/release-card-contact-integration.mjs';
const norm=s=>s.replaceAll('\r\n','\n'); const rows=[];
for(const path of ['tests/helpers/release-pc22-basic-feedback-source.mjs','tests/lua/card_flow_contact_continuity.lua'])for(const eol of ['LF','CRLF']){
 const original=norm(readFileSync(path,'utf8')),source=eol==='CRLF'?original.replaceAll('\n','\r\n'):original;
 const buffer=Buffer.from(source),read=(p,e)=>p===path?(e?source:buffer):readFileSync(p,e);
 for(const [entry,call]of [['boundary',()=>integrationCiSource(path,source,'pc22',read)],['direct',()=>integratedSource(path,source,'menu',read)],['text',()=>integratedRead('menu',{read})(path,'utf8')],['buffer',()=>integratedRead('menu',{read})(path)]]){
  const result=call(),same=result=== (entry==='buffer'?buffer:source);
  rows.push({path,eol,entry,same,contentEqual:norm(result.toString())===original,inputBytes:Buffer.byteLength(source),outputBytes:Buffer.byteLength(result),sha256:createHash('sha256').update(result).digest('hex')});
 }
}
console.log(JSON.stringify({repairBase:'6d267ca80abd80efb334f8f7581111166174de2d',rows,pass:rows.filter(r=>r.same).length,fail:rows.filter(r=>!r.same).length},null,2));
process.exitCode=rows.some(r=>!r.same)?1:0;
