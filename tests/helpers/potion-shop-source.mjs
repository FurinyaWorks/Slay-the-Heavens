// Disjoint product union. Both complete historical domains are retained.
import assert from 'node:assert/strict';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function composePotionShopEpoch(potion,shop,base){
 const a=potion.proof,b=shop.proof,c=base.proof,current={...a.current},targets={...a.targets};
 const changed=Object.keys(b.current).filter(p=>b.current[p]?.sha256!==c.current[p]?.sha256).sort();
 assert.deepEqual(changed,['src/lua/abyss_node_ui_input.lua','src/lua/abyss_shop_selection.lua']);
 for(const p of changed){assert.deepEqual(a.current[p],c.current[p],'disjoint potion/shop production owner: '+p);current[p]=b.current[p];}
 for(const [name,target]of Object.entries(b.targets)){if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared complete prior domain: '+name);else targets[name]=target;}
 targets.potionShopPotion={commit:"10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0",files:a.current};
 targets.potionShopShop={commit:"ad3a53cb3eb87fbad4ae015d11ea870deb6d5db1",files:b.current};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...a,current,targets,owners,currentCommit:"349b670e4a5ee12c4c13a6e55394b62ac06e5f4b",currentTreeCommitted:true,currentCommitRole:'committed disjoint potion/shop product union; CI and device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
