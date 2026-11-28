import {preAcceptedPr323Source} from './pr323-accepted-source-inverse.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
// Exact outer roster registration bridge; every older complete config proof stays immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const normalize=source=>source.replaceAll('\r\n','\n');
const hash=source=>createHash('sha256').update(source).digest('hex');
const bytes=normalize(readFileSync(new URL('../fixtures/competition-roster-config-composition.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'a27d66f90b37bf44a9df09add3496bfcbe23dd16c0ba286deaa871867294b11d','complete reviewed roster config composition');
export const rosterConfigComposition=JSON.parse(bytes);
// #1080's Release architecture belongs to fresh combined-epoch owner
// admission, not either ancient Roster witness. Preserve its exact input
// rather than consulting (and potentially borrowing) a pre-Release owner.
const releaseArchitecture={
 sha256:'4a622b868cadc22316cb7396ed31178bbe32ca58e15cbf6596f53cca4c755bf9',
 gitBlob:'7e5927ec6626673d9c06023bf1999b4ded03723d',
};
function rosterBridgeInput(path,source){
 if(path!==rosterConfigComposition.path||exactSourceMatches(source,releaseArchitecture))return source;
 return preAcceptedPr323Source(path,source);
}
export function projectRosterConfigSource(path,source,target){
 return projectHistoricalRosterConfigSource(path,rosterBridgeInput(path,source),target);
}
// Exact original roster union contract. Later source composition stays in the
// public entry above; exhaustive historical mutants need only this kernel.
export function projectHistoricalRosterConfigSource(path,source,target){
 const proof=rosterConfigComposition;
 assert.equal(path,proof.path,'roster config composition path');
 assert.equal(typeof source,'string','roster config composition source must exist');
 assert.ok(Object.hasOwn(proof.targets,target),'roster config composition target');
 source=normalize(source);
 assert.equal(hash(source),proof.combinedSha256LF,'unreviewed integrated roster config source');
 const lines=source.split('\n'),binding=proof.targets[target];
 for(const edit of [...binding.edits].reverse()){
  assert.deepEqual(lines.slice(edit.at,edit.at+edit.before.length),edit.before,'exact roster config composition hunk and position');
  lines.splice(edit.at,edit.before.length,...edit.after);
 }
 const previous=lines.join('\n');
 assert.equal(hash(previous),binding.sha256LF,'complete accepted roster config target recovered');
 return previous;
}
export function preRosterConfigSource(path,source,target='current'){
 return preHistoricalRosterConfigSource(path,rosterBridgeInput(path,source),target);
}
export function preHistoricalRosterConfigSource(path,source,target='current'){
 if(path!==rosterConfigComposition.path||typeof source!=='string'||hash(normalize(source))!==rosterConfigComposition.combinedSha256LF)return source;
 return projectHistoricalRosterConfigSource(path,source,target);
}
