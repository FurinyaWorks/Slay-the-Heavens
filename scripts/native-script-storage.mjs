import lua from 'luaparse';
import {isDeepStrictEqual} from 'node:util';
import {isUtf8} from 'node:buffer';

const legacyProfile='lossless-lua-v1';
const losslessProfile='lossless-lua-v2';
export const nativeScriptStorageProfile='competition-lua-v3';
const options={luaVersion:'5.3',encodingMode:'pseudo-latin1',comments:false};
const dataModules=new Set(['abyss_data','abyss_original_v4_data','abyss_theme','abyss_presentation','abyss_narrative']);
const latin=source=>Buffer.from(source,'utf8').toString('latin1');
function tokens(source){
 const parser=lua.parse(source,{...options,wait:true}),result=[];
 for(;;){const token=parser.lex();if(token.type===lua.tokenTypes.EOF)return result;result.push(token);}
}
// Shorten decimal fractions without reparsing through a JS Number. Keep a
// decimal point, including for negative zero and integral floats.
function compactDecimal(raw){
 const match=/^(\d+)\.(\d+)$/.exec(raw);
 if(!match)return raw;
 const [,whole,fraction]=match;
 const integer=whole.replace(/^0+/,'');
 const decimal=fraction.replace(/0+$/,'');
 return `${integer}.${decimal||(!integer?'0':'')}`;
}
function compactCode(source,decimals){
 const bytes=latin(source),original=tokens(bytes);let result='',line=1,previous='';
 for(const token of original){
  const originalRaw=bytes.slice(...token.range);
  const raw=decimals&&token.type===lua.tokenTypes.NumericLiteral?compactDecimal(originalRaw):originalRaw;
  const gap=token.line-line;
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
function literal(node,extended){
 if(['StringLiteral','NumericLiteral','BooleanLiteral','NilLiteral'].includes(node.type))return true;
 if(node.type==='UnaryExpression')return node.operator==='-'&&node.argument.type==='NumericLiteral';
 return node.type==='TableConstructorExpression'&&node.fields.every(field=>
  (field.type==='TableValue'||extended&&field.type==='TableKeyString'||field.type==='TableKey'&&['StringLiteral','NumericLiteral'].includes(field.key.type))&&literal(field.value,extended));
}
const keyName=field=>field.key?.type==='Identifier'?field.key.name:field.key?.value;
const schema=node=>node.fields.length>0&&node.fields.length<=32&&node.fields.every(field=>['StringLiteral','Identifier'].includes(field.key?.type))
 &&new Set(node.fields.map(keyName)).size===node.fields.length?JSON.stringify(node.fields.map(keyName)):null;
const keywords=new Set('and break do else elseif end false for function goto if in local nil not or repeat return then true until while'.split(' '));
const stringKey=(value,bare)=>bare&&/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)&&!keywords.has(value)?value:'['+quote(value)+']';
function compactLiteral(root,extended){
 const schemas=new Map(),numbers=new Map();
 const numericSource=node=>extended?compactDecimal(node.raw):node.raw;
 function scan(node){
  if(extended&&node.type==='NumericLiteral'){
   const raw=numericSource(node);
   if(raw.length>1)numbers.set(raw,(numbers.get(raw)??0)+1);
  }
  if(node.type!=='TableConstructorExpression')return;
  const key=schema(node);
  if(key){const row=schemas.get(key)??{keys:node.fields.map(keyName),count:0};row.count++;schemas.set(key,row);}
  for(const field of node.fields){
   if(field.key?.type==='NumericLiteral')scan(field.key);
   scan(field.value);
  }
 }
 scan(root);
 // Alias only frequently recurring immutable numbers. Each table constructor
 // still evaluates its own fields without a parser, loop or decoder in Lua.
 const numericCost=([raw,count])=>(raw.length-1)*count-raw.length-3;
 const repeated=[...numbers].filter(row=>numericCost(row)>8).sort((a,b)=>numericCost(b)-numericCost(a)).slice(0,8);
 const aliases=new Map(repeated.map(([raw],i)=>[raw,'ABCDEFGH'[i]]));
 const constants=aliases.size?'local '+[...aliases.values()].join(',')+'='+[...aliases.keys()].join(',')+'\n':'';
 const selected=[...schemas.entries()].filter(([,row])=>row.count>1&&row.keys.join('').length*(row.count-1)>60);
 const ids=new Map(selected.map(([key],index)=>[key,index+1]));
 const factories=selected.map(([,row])=>{
  const parameters=row.keys.map((_,index)=>'v'+index);
  return 'function('+parameters.join(',')+')return{'+row.keys.map((key,index)=>stringKey(key,extended)+'='+parameters[index]).join(',')+'}end';
 });
 function encode(node){
  if(node.type==='StringLiteral')return quote(node.value);
  if(node.type==='NilLiteral')return 'nil';
  if(node.type==='NumericLiteral'){const raw=numericSource(node);return aliases.get(raw)??raw;}
  if(node.type==='BooleanLiteral')return String(node.value);
  if(node.type==='UnaryExpression')return '-'+encode(node.argument);
  const id=ids.get(schema(node));
  if(id)return '_n['+id+']('+node.fields.map(field=>encode(field.value)).join(',')+')';
  return '{'+node.fields.map(field=>{
   if(!field.key)return encode(field.value);
   const key=field.key.type==='NumericLiteral'?'['+encode(field.key)+']':stringKey(keyName(field),extended);
   return key+'='+encode(field.value);
  }).join(',')+'}';
 }
 // Each call constructs a fresh table: only immutable field-name schemas are
 // shared. Arrays/colour/vector tables never become aliases of another asset.
 return constants+(factories.length?'local _n={'+factories.join(',')+'}\n':'')+'return '+encode(root)+'\n';
}
export function packNativeScript(name,source,profile){
 if(profile===undefined)return source;
 const competition=profile===nativeScriptStorageProfile;
 const extended=competition||profile===losslessProfile;
 if(!extended&&profile!==legacyProfile)throw Error('Unknown native script storage profile');
 if(name==='abyss_ui')return source; // Exact first-line build marker and bootstrap provenance.
 // The native competition entry rejects all Original V4 identities before
 // preparing their data. Keep a fail-closed loader at the same module name.
 if(competition&&name==='abyss_original_v4_data')return 'error("Original V4 is unavailable in the competition campaign")\n';
 const generated=dataModules.has(name)||extended&&name==='abyss_traveler_portrait_assets';
 const ast=lua.parse(latin(source),options),compact=compactCode(source,extended&&generated);
 let result=compact;
 const statement=ast.body.length===1&&ast.body[0];
 if(generated&&statement?.type==='ReturnStatement'&&statement.arguments.length===1&&literal(statement.arguments[0],extended)){
  const candidate=compactLiteral(statement.arguments[0],extended);
  if(Buffer.byteLength(candidate)<Buffer.byteLength(result))result=candidate;
 }
 lua.parse(latin(result),options);
 return Buffer.byteLength(result)<Buffer.byteLength(source)?result:source;
}
