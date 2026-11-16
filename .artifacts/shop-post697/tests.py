from pathlib import Path
import subprocess
old=subprocess.check_output(['git','show','10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0:tests/integrated-ci-source.cases.mjs']).decode('utf8')
first=old.index("test('post697 union historical CI reader")
end=old.index("test('post697 union production retains",first)
blocks=old[first:end]
last=old.index("test('post697 union both explicit histories")
blocks+=old[last:]
blocks=blocks.replace('potionPost697','shopPost697').replace('PotionPost697','ShopPost697').replace('potion-post697','shop-post697').replace('post697 union','shop post697 union').replace('actualPost697','actualShopPost697').replace('.views.potion','.views.release').replace('.viewInventories.potion','.viewInventories.release').replace("['potion','selection']","['release','shop']").replace('src/lua/abyss_battle_ui.lua','src/lua/abyss_shop_selection.lua')
blocks=blocks.replace('// The exact old implementation exposes the historical anchor without ever\n // consulting this independent missing owner. Keep this first as the RED.','// Independent owner failure must reject history even after warm success.')
blocks+="""
test('shop post697 union complete current production authenticates every one of 118 owners',async()=>{
 const {sourceEpoch,preShopPost697SourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {shopPost697SourcePacket:p,extendShopPost697Source}=await import('./helpers/shop-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preShopPost697SourceEpoch.proof;
 assert.equal(current.currentCommit,'5e2375f03a9a80d2abc8420ab7a401e89d525add');assert.equal(current.currentTreeCommitted,true);
 assert.equal(prior.owners.length,116);assert.equal(current.owners.length,118);
 assert.deepEqual(current.owners.filter(path=>!prior.owners.includes(path)),['src/lua/abyss_node_ui_input.lua','src/lua/abyss_shop_selection.lua']);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.shopPost697Release,{commit:p.baseCommit,files:prior.current});
 assert.equal(current.targets.shopBeforeMap.commit,p.shopCommit);
 assert.equal(Object.values(current.current).filter(Boolean).length,352);
 for(const [path,row]of Object.entries(current.current))if(row)assert.equal(actualShopPost697ReadFileSync(path,'utf8').replaceAll('\\r\\n','\\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,shopBeforeMap:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)}])assert.throws(()=>extendShopPost697Source(preShopPost697SourceEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualShopPost697ReadFileSync(path,'utf8').replaceAll('\\r\\n','\\n');return path===fault?.path?text+'\\n':crlf?text.replaceAll('\\n','\\r\\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),expected);
  }
 }
});
"""
p=Path('tests/integrated-ci-source.cases.mjs');p.write_text(p.read_text(encoding='utf8').rstrip()+'\n\n'+blocks,encoding='utf8',newline='\n')
