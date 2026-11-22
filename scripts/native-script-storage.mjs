import lua from 'luaparse';
import {isDeepStrictEqual} from 'node:util';
import {isUtf8} from 'node:buffer';

export const nativeScriptStorageProfile='lossless-lua-v1';
const options={luaVersion:'5.3',encodingMode:'pseudo-latin1',comments:false};
const dataModules=new Set(['abyss_data','abyss_original_v4_data','abyss_theme','abyss_presentation','abyss_narrative']);
const latin=source=>Buffer.from(source,'utf8').toString('latin1');
function tokens(source){
 const parser=lua.parse(source,{...options,wait:true}),result=[];
 for(;;){const token=parser.lex();if(token.type===lua.tokenTypes.EOF)return result;result.push(token);}
}
function compactCode(source){
 const bytes=latin(source),original=tokens(bytes);let result='',line=1,previous='';
 for(const token of original){
  const raw=bytes.slice(...token.range),gap=token.line-line;
  if(gap>0)result+='\n'.repeat(gap);
  else if(/[\w.]$/.test(previous)&&/^[\w.]/.test(raw)||previous.endsWith('-')&&raw.startsWith('-')
   ||previous.endsWith('[')&&raw.startsWith('['))result+=' ';
  result+=raw;line=token.line+(raw.match(/\n/g)?.length??0);previous=raw;
 }
 const signature=rows=>rows.map(({type,value,line})=>[type,value,line]);
 if(!isDeepStrictEqual(signature(original),signature(tokens(result))))throw Error('Native Lua storage changed token identity or source lines');
 return Buffer.from(result,'latin1').toString('utf8');
}
function quote(value){
 const bytes=Buffer.from(value,'latin1');
 const escape=byte=>'\\'+String(byte).padStart(3,'0');
 if(!isUtf8(bytes))return '"'+[...bytes].map(byte=>byte>=32&&byte<=126&&byte!==34&&byte!==92?String.fromCharCode(byte):escape(byte)).join('')+'"';
 return '"'+[...bytes.toString('utf8')].map(char=>/["\\\x00-\x1f\x7f]/.test(char)
  ?[...Buffer.from(char)].map(escape).join(''):char).join('')+'"';
}
function literal(node){
 if(['StringLiteral','NumericLiteral','BooleanLiteral','NilLiteral'].includes(node.type))return true;
 if(node.type==='UnaryExpression')return node.operator==='-'&&node.argument.type==='NumericLiteral';
 return node.type==='TableConstructorExpression'&&node.fields.every(field=>
  (field.type==='TableValue'||field.type==='TableKey'&&['StringLiteral','NumericLiteral'].includes(field.key.type))&&literal(field.value));
}
const schema=node=>node.fields.length>0&&node.fields.length<=32&&node.fields.every(field=>field.key?.type==='StringLiteral')
 &&new Set(node.fields.map(field=>field.key.value)).size===node.fields.length?JSON.stringify(node.fields.map(field=>field.key.value)):null;
function compactLiteral(root){
 const schemas=new Map();
 function scan(node){
  if(node.type!=='TableConstructorExpression')return;
  const key=schema(node);
  if(key){const row=schemas.get(key)??{keys:node.fields.map(field=>field.key.value),count:0};row.count++;schemas.set(key,row);}
  for(const field of node.fields)scan(field.value);
 }
 scan(root);
 const selected=[...schemas.entries()].filter(([,row])=>row.count>1&&row.keys.join('').length*(row.count-1)>60);
 const ids=new Map(selected.map(([key],index)=>[key,index+1]));
 const factories=selected.map(([,row])=>{
  const parameters=row.keys.map((_,index)=>'v'+index);
  return 'function('+parameters.join(',')+')return{'+row.keys.map((key,index)=>'['+quote(key)+']='+parameters[index]).join(',')+'}end';
 });
 function encode(node){
  if(node.type==='StringLiteral')return quote(node.value);
  if(node.type==='NilLiteral')return 'nil';
  if(['NumericLiteral','BooleanLiteral'].includes(node.type))return node.raw??String(node.value);
  if(node.type==='UnaryExpression')return '-'+encode(node.argument);
  const id=ids.get(schema(node));
  if(id)return '_n['+id+']('+node.fields.map(field=>encode(field.value)).join(',')+')';
  return '{'+node.fields.map(field=>(field.key?'['+encode(field.key)+']=':'')+encode(field.value)).join(',')+'}';
 }
 // Each call constructs a fresh table: only immutable field-name schemas are
 // shared. Arrays/colour/vector tables never become aliases of another asset.
 return (factories.length?'local _n={'+factories.join(',')+'}\n':'')+'return '+encode(root)+'\n';
}
export function packNativeScript(name,source,profile){
 if(profile===undefined)return source;
 if(profile!==nativeScriptStorageProfile)throw Error('Unknown native script storage profile');
 if(name==='abyss_ui')return source; // Exact first-line build marker and bootstrap provenance.
 const ast=lua.parse(latin(source),options),compact=compactCode(source);
 let result=compact;
 const statement=ast.body.length===1&&ast.body[0];
 if(dataModules.has(name)&&statement?.type==='ReturnStatement'&&statement.arguments.length===1&&literal(statement.arguments[0])){
  const candidate=compactLiteral(statement.arguments[0]);
  if(Buffer.byteLength(candidate)<Buffer.byteLength(result))result=candidate;
 }
 lua.parse(latin(result),options);
 return Buffer.byteLength(result)<Buffer.byteLength(source)?result:source;
}
