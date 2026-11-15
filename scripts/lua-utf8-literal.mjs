// Lua source is UTF-8, as are the authored runtime modules. Preserve the exact
// UTF-8 string bytes without expanding each non-ASCII byte into four ASCII bytes.
// Quotes, backslashes and ASCII controls retain fixed-width byte escapes.
export function utf8LuaString(value){
 if(typeof value!=='string'||!value.isWellFormed())throw new TypeError('Lua strings require well-formed Unicode');
 return '"'+[...value].map(character=>{
  const code=character.codePointAt(0);
  return code>=32&&code!==127&&code!==34&&code!==92?character:`\\${String(code).padStart(3,'0')}`;
 }).join('')+'"';
}
const quotedKeys=new Set('and break do else elseif end false for function goto if in local nil not or repeat return then true until while __proto__ constructor prototype'.split(' '));
const luaKey=key=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)&&!quotedKeys.has(key)?key:`[${utf8LuaString(key)}]`;
export function utf8ToLua(value,{nullAsNil=false}={}){
 const encode=item=>{
  if(item===null&&nullAsNil)return 'nil';
  if(typeof item==='string')return utf8LuaString(item);
  if(typeof item==='boolean')return String(item);
  if(typeof item==='number'&&Number.isFinite(item))return String(item);
  if(Array.isArray(item))return `{${item.map(encode).join(',')}}`;
  if(item!==null&&typeof item==='object')return `{${Object.keys(item).sort().map(key=>`${luaKey(key)}=${encode(item[key])}`).join(',')}}`;
  throw new TypeError(`Unsupported Lua data value: ${String(item)}`);
 };
 return encode(value);
}
