import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createSourceEpochProjector } from './combined-epoch/source-epoch-runtime.mjs';

const archive = readFileSync(new URL('../fixtures/v2-run-menu-source.json', import.meta.url), 'utf8').replaceAll('\r\n','\n');
const archiveSha256 = createHash('sha256').update(archive).digest('hex');
const digest = 'b078f617134d3189f5a815e1c85b1edfd50c8e133950d5b81cbecb67a1358508';
assert.equal(archiveSha256,digest,'exact v2 run menu source continuation');
const packet = JSON.parse(archive);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function extendV2RunMenuEpoch(original) {
  const prior = original.proof;
  const current = {...prior.current,...packet.current};
  const targets = {...prior.targets,v2RunMenuPrior:{commit:prior.currentCommit,files:prior.current}};
  for (const path of Object.keys(packet.current)) {
    assert(prior.current[path] && current[path].sha256 !== prior.current[path].sha256,'changed existing run menu owner: '+path);
  }
  const owners = Object.keys(current).sort().filter(path =>
    Object.values(targets).some(target => target.files[path]?.sha256 !== current[path]?.sha256));
  return createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,currentCommit:packet.currentCommit,
    currentCommitRole:'exact v2 run menu source continuation',current,targets,owners}),{allowConfigLayout:true,reuseFrozenInput:true});
}
