import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {integrationPreflightCurrentRead,integrationCapacityCurrentRead,assertReleaseIntegrationCurrent} from '../../../tests/helpers/release-picker-b9-integration.mjs';
const packet=JSON.parse(readFileSync('tests/helpers/release-picker-preflight-join.json','utf8'));
const path='tests/release-selection-map-source.test.mjs';
let mutation=null;
const raw=(p,e)=>{const value=readFileSync(p,e);if(!mutation||p!==mutation.path)return value;if(mutation.missing)throw Error('missing '+p);return e?value+'\n':Buffer.concat([value,Buffer.from('\n')]);};
const release=integrationPreflightCurrentRead(raw),capacity=integrationCapacityCurrentRead(raw);
let n=0;const check=(name,f)=>{f();console.log('PASS',++n,name);};
check('complete both-parent authorization',()=>assertReleaseIntegrationCurrent(raw));
check('exact release source',()=>assert.equal(release(path,'utf8'),packet.files[path].release));
check('Buffer exact release source',()=>assert.equal(release(path).toString(),packet.files[path].release));
for(const p of [path,'tests/helpers/release-picker-b9-integration.mjs','tests/helpers/release-picker-preflight-join.json','tests/helpers/release-capacity-preflight-source.json.gz','src/lua/abyss_node_ui_feedback.lua']){
 for(const missing of [false,true])check('same reader '+(missing?'missing ':'drift ')+p,()=>{mutation={path:p,missing};if(p===path&&!missing){assert.equal(release(path,'utf8'),raw(path,'utf8'));assert.throws(()=>assertReleaseIntegrationCurrent(raw));}else assert.throws(()=>release(path,'utf8'));mutation=null;});
}
check('restored same reader',()=>assert.equal(release(path,'utf8'),packet.files[path].release));
check('old capacity remains distinct',()=>assert.notEqual(capacity(path,'utf8'),release(path,'utf8')));
for(const p of ['src/lua/abyss_node_ui_feedback.lua','config/architecture.json'])check('public CI reader does not project '+p,()=>{const b=readFileSync(p);assert.equal(createHash('sha256').update(release(p)).digest('hex'),createHash('sha256').update(b).digest('hex'));});
check('foreign and malformed opaque values',()=>{for(const value of [null,{},17,Buffer.from('opaque')])assert.strictEqual(integrationPreflightCurrentRead(()=>value)('foreign/'+path),value);});
check('new CI Buffer and string remain equivalent',()=>{for(const p of ['tests/ci-summary-runners.test.mjs','tests/ci-windows-shape-expansion.test.mjs','tests/pr-history.test.mjs'])assert.equal(capacity(p).toString(),capacity(p,'utf8'));});
for(const p of Object.keys(packet.files))for(const missing of [false,true])check('complete joint binding '+(missing?'missing ':'drift ')+p,()=>{mutation={path:p,missing};assert.throws(()=>assertReleaseIntegrationCurrent(raw));mutation=null;});
check('full boundary restored after complete matrix',()=>assertReleaseIntegrationCurrent(raw));
console.log('controls',n,'passed');
