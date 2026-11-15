import assert from 'node:assert/strict';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
import {lateProduction,lateProductionPaths} from './late-source-continuation.mjs';
export function extendLateSourceEpoch(original){
 const prior=original.proof;
 for(const path of lateProductionPaths)assert.deepEqual(prior.current[path],lateProduction[path].before,'exact e65 production predecessor: '+path);
 assert(!Object.hasOwn(prior.targets,'e65Prior'));assert(!Object.hasOwn(prior.targets,'followupCurrent'));
 const current={...prior.current,...Object.fromEntries(lateProductionPaths.map(p=>[p,lateProduction[p].after]))};
 const targets={...prior.targets,e65Prior:{commit:'e65d9b98fbec69442047650254238cd9244df805',files:prior.current},
  followupCurrent:{commit:'e65d9b98fbec69442047650254238cd9244df805',files:current}};
 const owners=Object.keys(current).filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector({...prior,currentTreeCommitted:false,currentCommitRole:'uncommitted exact three-owner followup; e65 and reviewed targets retained',current,targets,owners},{allowConfigLayout:true});
}
