import fs from 'node:fs';import path from 'node:path';import {syncBuiltinESMExports,registerHooks} from 'node:module';
const original=fs.symlinkSync;
const allowed=path.resolve('F:/New folder/.worktrees/monster-lowpoly-combat')+path.sep;
fs.symlinkSync=function(target,destination,type){
 if(path.resolve(target).toLowerCase()==='d:\\miliastratools\\genshin-miliastra-mcp\\node_modules'&&path.resolve(destination).startsWith(allowed)&&path.basename(destination)==='node_modules'){
  try{return original(target,destination,'junction')}catch(e){if(e.code!=='EPERM')throw e;
   return fs.cpSync(target,destination,{recursive:true,dereference:true,errorOnExist:true,force:false});
  }
 }
 return original(target,destination,type);
};syncBuiltinESMExports();
// A copied genshin-ts must use the installation's singleton graph context.
registerHooks({resolve(specifier,context,next){
 const r=next(specifier,context),marker='/node_modules/genshin-ts/',i=r.url.indexOf(marker);
 if(i>=0&&r.url.startsWith('file:///F:/New%20folder/.worktrees/monster-lowpoly-combat/'))return {...r,url:'file:///D:/MiliastraTools/genshin-miliastra-mcp'+r.url.slice(i)};
 return r;
}});
