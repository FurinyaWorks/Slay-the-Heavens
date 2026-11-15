import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {copyIntegrationSourceClosure,itemIconHelperCopies} from './helpers/copy-integration-source-closure.mjs';
import {itemIconCiSource} from './helpers/item-semantic-icons-ci.mjs';
import {integratedCiProof} from './helpers/integrated-ci-source.mjs';

test('7cb icon helper continuation copies exact dependencies and rejects fresh source drift',t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const scratch=mkdtempSync(join(root,'pc-item-copy-'));t.after(()=>rmSync(scratch,{recursive:true,force:true}));
 const source=join(scratch,'source'),destination=join(scratch,'destination');mkdirSync(source);mkdirSync(destination);
 copyIntegrationSourceClosure(source);
 copyIntegrationSourceClosure(destination,{sourceRoot:source});
 const predecessor=itemIconHelperCopies.find(row=>row.path==='tests/helpers/closeout-source-epoch.mjs').versions;
 assert(predecessor.some(row=>row.before==='3f6eff5b06cc91371de414aa1a7fb960ee447d6cdca9b8fc7807ce503793fd6c'&&row.after==='775646f95cc2a4f4008c789824ebdf597f409bcb68e82e1e7118cabbe35b042a'));
 for(const row of itemIconHelperCopies){
  const path=join(source,row.path),saved=readFileSync(path);
  writeFileSync(path,Buffer.concat([saved,Buffer.from('\n')]));
  assert.throws(()=>copyIntegrationSourceClosure(destination,{sourceRoot:source}),/fresh helper copy identity/);
  writeFileSync(path,saved);
 }
});

test('7cb continuation aliases bind complete before/after identity and leave drift opaque',()=>{
 for(const path of ['tests/helpers/closeout-source-epoch.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/integrated-ci-source.mjs']){
  const row=integratedCiProof.files[path].current,source=readFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(itemIconCiSource(path,source,row),row.source);
  for(const changed of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n')])assert.equal(itemIconCiSource(path,changed,row),changed);
  assert.equal(itemIconCiSource(path,source,{...row,sha256:'f'.repeat(64)}),source);
 }
});
