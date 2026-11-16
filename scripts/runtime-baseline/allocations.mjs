// Count selected source table literals in a separate diagnostic VM, never in production.
import {createRequire} from 'node:module';
const {parse}=createRequire(import.meta.url)('luaparse');
export function instrumentTableLiterals(source,name){
 const edits=[];
 function walk(node,parent){
  if(!node||typeof node!=='object')return;
  if(node.type==='TableConstructorExpression'){
   const sugar=parent?.type==='TableCallExpression';
   edits.push([node.range[0],`${sugar?' (':' '}ALLOC(${JSON.stringify(name+':'+node.loc.start.line)},`],[node.range[1],sugar?'))':')']);
  }
  for(const [key,value]of Object.entries(node))if(key!=='loc'&&key!=='range'){
   if(Array.isArray(value))value.forEach(child=>walk(child,node));else walk(value,node);
  }
 }
 walk(parse(source,{luaVersion:'5.3',ranges:true,locations:true}));
 for(const [at,text]of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,at)+text+source.slice(at);
 return source;
}
