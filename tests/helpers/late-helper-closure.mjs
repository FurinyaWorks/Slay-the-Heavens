import assert from 'node:assert/strict';
import {lateCiProof} from './late-ci-source.mjs';
export function extendLateHelperClosure(prior){
 const current={...prior};
 for(const [path,row]of Object.entries(lateCiProof.helperClosure)){
  assert.equal(prior[path]??null,row.before,'exact late copy predecessor: '+path);
  assert.match(row.after,/^[a-f0-9]{64}$/);current[path]=row.after;
 }
 return Object.freeze(current);
}
