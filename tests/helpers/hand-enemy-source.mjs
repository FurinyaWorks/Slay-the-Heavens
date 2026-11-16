// Exact committed union; both independent predecessor domains remain intact.
import assert from 'node:assert/strict';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
export function extendHandEnemyUnion(hand,enemy){
 const h=hand.proof,e=enemy.proof,current={...h.current};
 const changed=["src/lua/abyss_battle_enemy_view.lua", "src/lua/abyss_battle_render_actors.lua", "src/lua/abyss_battle_targeting.lua"];
 for(const path of changed){assert(e.current[path]);current[path]=e.current[path];}
 for(const path of Object.keys(current))if(!changed.includes(path)&&path!=='src/lua/abyss_battle_card_view.lua')assert.deepEqual(h.current[path],e.current[path],'unchanged union production: '+path);
 const targets={...h.targets};
 for(const [name,target]of Object.entries(e.targets)){if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared historical domain: '+name);else targets[name]=target;}
 targets.handBeforeEnemyUnion={commit:"e259ca49be9d2e3b3526a5efa762814ef96df1c9",files:h.current};targets.enemyBeforeHandUnion={commit:"4d40bdac703c80e51054d551f1512ff02fc0adbc",files:e.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
 return createSourceEpochProjector(freeze({...h,current,targets,owners,currentCommit:"dff8e86a26f1b309f21bcc5999c2c1f750da3208",currentTreeCommitted:true,currentCommitRole:'actual committed hand/enemy union; no device acceptance',enemyGeometryProducers:e.enemyGeometryProducers,enemyPost697Producers:e.enemyPost697Producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
