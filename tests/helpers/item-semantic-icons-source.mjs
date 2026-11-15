// Exact five-UI continuation. Historical proof.current and target views never advance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const norm=s=>s.replaceAll('\r\n','\n');
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=norm(readFileSync(new URL('./item-semantic-icons-source-witness.json',import.meta.url),'utf8'));
assert.equal(hash(bytes),'0d6ece8de408d476ec4110e7e18d3176b8b7bbb77fbbb1a9070767fccac41a29','immutable item icon five-source witness');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const itemIconWitness=freeze(JSON.parse(bytes));
export const itemIconPaths=Object.freeze(['abyss_battle_render_actors','abyss_battle_reward_layout','abyss_node_ui_shop','abyss_potion_discard_ui','abyss_shop_ui'].map(name=>'src/lua/'+name+'.lua'));
assert.equal(itemIconWitness.schemaVersion,1);assert.equal(itemIconWitness.normalization,'LF');
assert.equal(itemIconWitness.beforeCommit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(itemIconWitness.afterCommit,'5e63b5c5697d7ce567ec896eff2d3a768a58e072');
for(const side of ['before','after']){
 assert.deepEqual(Object.keys(itemIconWitness[side]),itemIconPaths);
 for(const row of Object.values(itemIconWitness[side])){
  assert.equal(norm(row.source),row.source);assert.equal(hash(row.source),row.sha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.source)}\0`).update(row.source).digest('hex'),row.gitBlob);
 }
}
export function itemIconProofMatches(proof){
 return itemIconPaths.every(path=>proof.owners.includes(path)&&['source','sha256','gitBlob'].every(key=>proof.current[path]?.[key]===itemIconWitness.before[path][key]));
}
export function itemIconSourceState(path,source){
 if(!itemIconPaths.includes(path)||typeof source!=='string')return null;
 const text=norm(source);
 for(const side of ['before','after'])if(text===itemIconWitness[side][path].source)return side;
 return null;
}
export function isItemIconAfter(proof,path,source){return itemIconSourceState(path,source)==='after'&&itemIconProofMatches(proof);}
