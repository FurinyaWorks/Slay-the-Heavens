import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// The older replay suites receive the exact source at develop 32a15219.
// Authenticating the current bytes still precedes every projection.
const bindings=JSON.parse(readFileSync(new URL('../fixtures/ascension-foundation-source.json',import.meta.url)));

export function beforeAscensionFoundationSource(path,source){
 const binding=Object.hasOwn(bindings,path)?bindings[path]:undefined;
 if(!binding||typeof source!=='string')return source;
 const normalized=source.replaceAll('\r\n','\n');
 const crlf=source!==normalized;
 if(crlf&&source!==normalized.replaceAll('\n','\r\n'))return source;
 if(!exactSourceMatches(source,binding.current))return source;
 const previous=restoreExactFixtureHunks({path,beforeSha256:binding.previous.sha256,
  afterSha256:binding.current.sha256,hunks:binding.hunks},path,source);
 assert(exactSourceMatches(previous,binding.previous),'exact ascension foundation predecessor: '+path);
 return crlf?previous.replaceAll('\n','\r\n'):previous;
}
