test('enemy post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=enemyPost697CiPacket.files[anchor].views.enemy.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 const reader=enemyPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // Independent missing current binding must reject history after warm success.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(enemyPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(enemyPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualEnemyPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(enemyPost697CiRead((p,e)=>p===production?actualEnemyPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualEnemyPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=enemyPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=enemyPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=enemyPost697CiRead((p,e)=>{seen.push(p);return actualEnemyPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('enemy post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualEnemyPost697ReadFileSync(anchor,'utf8');
 const expected=enemyPost697CiPacket.files[anchor].views.enemy.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 const project=()=>enemyPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(enemyPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(enemyPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualEnemyPost697ReadFileSync(production,'utf8');
 assert.equal(enemyPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(enemyPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('enemy post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualEnemyPost697DiscoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(enemyPost697PriorInventory(paths,kind,read),enemyPost697CiPacket.viewInventories.enemy[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>enemyPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(enemyPost697PriorInventory(inventories.js,'js',read),enemyPost697CiPacket.viewInventories.enemy.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(enemyPost697PriorInventory(enemyPost697CiPacket.viewInventories.enemy[kind],kind,read),enemyPost697CiPacket.viewInventories.enemy[kind]);
});

test('enemy post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/integrated-ci-source.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualEnemyPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 assertEnemyPost697CiCurrent(actualEnemyPost697ReadFileSync);
 const reader=integratedRead('menu',{read}),expected=reader(anchor,'utf8');assert.notEqual(expected,raw,'the test must actually expose an older view');
 for(const invoke of [()=>reader(anchor,'utf8'),()=>integratedSource(anchor,raw,'menu',read)]){
  assert.equal(invoke(),expected);
  for(const kind of ['missing','null','drift']){
   fault=kind;assert.throws(invoke,undefined,'the integrated boundary must use the injected raw owner '+kind);
   fault=undefined;assert.equal(invoke(),expected);
  }
 }
 assert(seen.includes(other),'current owner must be read through this invocation reader');
 const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
});

import {enemyPost697CiRead,enemyPost697CiPacket,enemyPost697CiSource,assertEnemyPost697CiCurrent,assertEnemyPost697RawInventory} from './helpers/enemy-post697-ci-source.mjs';

test('enemy post697 union production retains both complete real inputs and authenticates every current owner',async()=>{
 const {sourceEpoch,preEnemyPost697SourceEpoch,releaseSelectionMapLegacyEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {enemyPost697SourcePacket:p,extendEnemyPost697Source}=await import('./helpers/enemy-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preEnemyPost697SourceEpoch.proof,legacy=releaseSelectionMapLegacyEpoch.proof;
 assert.equal(current.currentCommit,'bc106cce4f8fde5d1b0dec5ae9c0403cb5436a0c');assert.equal(current.currentTreeCommitted,true);
 assert.deepEqual(current.owners,prior.owners);assert.equal(current.owners.length,117);assert.equal(legacy.owners.length,116);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.selectionMapLanded,{commit:p.selectionCommit,files:legacy.current});
 assert.deepEqual(current.targets.enemyBeforeSelection,{commit:p.baseCommit,files:prior.current});
 for(const [path,row]of Object.entries(current.current))if(row!==null)assert.equal(actualEnemyPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,inheritedEnemy:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,inputs:[]}])assert.throws(()=>extendEnemyPost697Source(preEnemyPost697SourceEpoch,releaseSelectionMapLegacyEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualEnemyPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),expected);
  }
 }
});

test('enemy post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_targeting.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualEnemyPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualEnemyPost697ReadFileSync(path,encoding);};
 for(const target of ['enemy','selection']){
  const reader=enemyPost697HistoricalRead(target,read),expected=enemyPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(enemyPost697CiPacket.currentInventory))assert.deepEqual(enemyPost697PriorInventory(paths,kind,read,target),enemyPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(enemyPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=enemyPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(enemyPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=enemyPost697CiPacket.currentInventory[kind];assertEnemyPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertEnemyPost697RawInventory(bad,kind));
 }
});
