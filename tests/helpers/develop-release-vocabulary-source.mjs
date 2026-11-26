import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches} from './source-fingerprint.mjs';

const archive=readFileSync(new URL('../fixtures/develop-release-vocabulary-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),
 '2b3d606fc142f2c8c5cfaaff386c70f6e1f741f24fbc1879b78399b7c477e914','exact Release vocabulary continuation');
const {base,head,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'7348ab8598c8607712d525bd732239f89bb52830');
assert.equal(head,'b2f74d99a3d80e60b99165b6380987cda8b4488d');

for(const [path,row] of Object.entries(files)){
 assert(exactSourceMatches(row.before.source,row.before),'exact Release vocabulary predecessor: '+path);
}

export const releaseVocabularyOwns=path=>Object.hasOwn(files,path);
export function beforeReleaseVocabulary(path,source){
 const row=releaseVocabularyOwns(path)?files[path]:undefined;
 if(!row||!exactSourceMatches(source,row.after))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source===lf)return row.before.source;
 return source===lf.replaceAll('\n','\r\n')?row.before.source.replaceAll('\n','\r\n'):source;
}
