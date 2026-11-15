import {materialize} from './tests/helpers/game-ui-host-equivalence.mjs';
import {installCurrentHostContract,executeCurrentHost} from './tests/helpers/game-ui-host-live-contract.mjs';
import fs from 'node:fs';
const dir=materialize('new');
try{installCurrentHostContract(dir);
const file=dir+'/tests/lua/support/game_ui_host_trace.lua';
if(process.argv[2]==='cancel-noop'){
 const text=fs.readFileSync(file,'utf8'),before="step('cancel menu',function()return host:closeExit()end)";
 if(text.split(before).length!==2)throw Error('exact cancel boundary');
 fs.writeFileSync(file,text.replace(before,"step('cancel menu',function()return true end)"));
}
if(process.argv[2]==='retired-help'){
 const text=fs.readFileSync(file,'utf8'),before="local panel=h.root:GetChild(name)";
 if(text.split(before).length!==2)throw Error('exact menu boundary');
 fs.writeFileSync(file,text.replace(before,before+"\n   if name=='runMenu' then panel.children.help={} end"));
}
executeCurrentHost(dir,{scenario:'short-overlays',from:1,to:13});}
finally{fs.rmSync(dir,{recursive:true,force:true});}
