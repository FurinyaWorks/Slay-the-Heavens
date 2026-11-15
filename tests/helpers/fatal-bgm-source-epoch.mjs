import assert from 'node:assert/strict';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
import {fatalBgmPair} from './fatal-bgm-source-continuation.mjs';
export function extendFatalBgmEpoch(original){
 const prior=original.proof,{path,before,after}=fatalBgmPair;
 assert.equal(prior.currentCommit,'9783f9ed4fdf021270668b66c863b9dfeebc7150','latest menu/Neow predecessor');
 assert.deepEqual(prior.current[path],before,'exact single UI predecessor');
 assert(!Object.hasOwn(prior.targets,'fatalBgmPrior'));
 const current={...prior.current,[path]:after};
 const targets={...prior.targets,fatalBgmPrior:{commit:prior.currentCommit,files:prior.current}};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector({...prior,currentTreeCommitted:false,currentCommit:'b0466187e2727d6b044e90c131d95154c309c55a',
  currentCommitRole:'one UI BGM producer over the complete latest menu/Neow predecessor',current,targets,owners},{allowConfigLayout:true});
}
