import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {integratedRead,integratedCiProof} from '../../../tests/helpers/integrated-ci-source.mjs';
let corrupt=false;const marker='.github/workflows/licenses.yml';
const caller=(path,encoding)=>{const v=readFileSync(path,encoding);return corrupt&&path===marker?(typeof v==='string'?v+'\n':Buffer.concat([v,Buffer.from('\n')])):v;};
const reader=integratedRead('menu',{read:caller});
const paths=['tests/ci-complete-calibration.test.mjs',...Object.keys(integratedCiProof.binaryViews).filter(p=>integratedCiProof.binaryViews[p].views.menu).slice(0,1)];
assert.equal(paths.length,2,'both text and binary paths');
for(const path of paths){
 const encoding=path.endsWith('.gz')?undefined:'utf8';const healthy=reader(path,encoding);
 corrupt=true;assert.throws(()=>reader(path,encoding),e=>e.message.includes(marker),'same-reader raw mutation rejected');
 corrupt=false;assert.deepEqual(reader(path,encoding),healthy,'restored same raw reader');
 console.log('PASS healthy/mutated/restored',path,Buffer.isBuffer(healthy)?'Buffer':'string');
}
console.log('6 checks PASS');
