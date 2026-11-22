// Fixed StS runner trust leaf, outside the archive and its copy closure.
import {beforeMergedInputRetirement} from './input-retirement-source.mjs';
import {beforeCurrentOfficialRuntimeFixture} from './sts-fade-ci-source.mjs';

export function inputRetirementStsFixtureSource(path,raw){
 const buffered=Buffer.isBuffer(raw),source=buffered?raw.toString('utf8'):raw;
 const native=beforeMergedInputRetirement(path,source,{requireCurrent:true});
 const prior=beforeCurrentOfficialRuntimeFixture(path,native);
 return buffered?(prior===source?raw:Buffer.from(prior)):prior;
}

export const inputRetirementStsWitness=Object.freeze({
 'tests/helpers/copy-integration-source-closure.mjs':'af9c7feb1e87b04b9343ca21270bb6e9e3c05b114eb35001cb42a6804d6a5216',
 'tests/helpers/historical-sts-style-entry.mjs':'ac8a210c00567b85098c1a7378f0a5452ffa731468c6636d90835eee52653593',
});
