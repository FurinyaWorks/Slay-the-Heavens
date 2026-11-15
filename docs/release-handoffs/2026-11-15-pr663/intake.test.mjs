import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspect} from './intake.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
function fixture(){const gil=Buffer.from('SYNTHETIC TEST BYTES - NOT A GIL'),sha=hash(gil),source='a'.repeat(40),build='12345678-1234-1234-1234-123456789abc',payload='b'.repeat(64);
 return {frozenSource:source,gil,receipt:{sourceCommit:source,sourceDirty:false,buildId:build,payloadDigest:payload,release:{notesSha256:'c'.repeat(64)},candidate:{sha256:sha},sha256:sha},startup:{candidateHash:sha,buildId:build,expected:{candidateHash:sha,buildId:build}},official:{candidateSha256:sha,buildId:build,sourceCommit:source,payloadDigest:payload},aliasGil:gil,alias:{sha256:sha,buildId:build,sourceCommit:source,sourceDirty:false,bytes:gil.length}};}
test('Synthetic coherent input is identity-only, never release PASS',()=>assert.equal(inspect(fixture()).status,'IDENTITY_MATCH_ONLY'));
const mutations={
 wrongFrozen:x=>x.frozenSource='d'.repeat(40), changedGil:x=>x.gil=Buffer.from('changed'),
 baseInsteadOfAudio:x=>x.receipt.candidate.sha256='d'.repeat(64), audioHash:x=>x.receipt.sha256='d'.repeat(64),
 staleStartup:x=>x.startup.candidateHash='d'.repeat(64), staleExpected:x=>x.startup.expected.buildId='87654321-1234-1234-1234-123456789abc',
 oldOfficial:x=>x.official.sourceCommit='d'.repeat(40), wrongPayload:x=>x.official.payloadDigest='d'.repeat(64),
 aliasBytes:x=>x.aliasGil=Buffer.from('other'), aliasMetadata:x=>x.alias.buildId='87654321-1234-1234-1234-123456789abc',
 aliasLength:x=>x.alias.bytes++,dirty:x=>x.receipt.sourceDirty=true, noReleaseNotes:x=>delete x.receipt.release};
for(const [name,change]of Object.entries(mutations))test(name+' blocks intake',()=>{const x=fixture();change(x);assert.equal(inspect(x).status,'BLOCKED')});
