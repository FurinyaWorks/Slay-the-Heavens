import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const freeze=record=>{
  if(record&&typeof record==='object'&&!Object.isFrozen(record)){
    for(const value of Object.values(record)) freeze(value);
    Object.freeze(record);
  }
  return record;
};

export function extendPowerMembershipEpoch(previous){
  const bytes=readFileSync(new URL('./power-membership-source.json.gz',import.meta.url));
  assert.equal(hash(bytes),'9b4ee9cf761b49297c4a0abfea0df825104e6dcc2e73ca9b633d2c50bce8a039',
    'complete Power membership continuation archive');
  const {base,before,current}=JSON.parse(gunzipSync(bytes));
  const prior=previous.proof;
  assert.equal(base,'345ba08398b6ca8e1361a126f2ce1de85210e634');
  assert.deepEqual(Object.keys(before),Object.keys(current));
  for(const [path,sha] of Object.entries(before)){
    assert.equal(prior.current[path]?.sha256??null,sha,'Power membership predecessor: '+path);
  }
  const membership='src/lua/abyss_power_membership.lua';
  const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,target])=>[
    name,{...target,files:{...target.files,[membership]:null}},
  ]));
  targets.powerMembershipPrior={commit:base,files:{...prior.current,[membership]:null}};
  return createSourceEpochProjector(freeze({
    ...prior,
    currentTreeCommitted:false,
    currentCommit:base,
    currentCommitRole:'Power membership continuation with exact per-file source; base is its predecessor',
    current:{...prior.current,...current},
    targets,
    owners:[...new Set([...prior.owners,...Object.keys(current)])],
  }),{allowConfigLayout:true,reuseFrozenInput:true});
}
