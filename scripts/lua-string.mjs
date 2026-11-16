// Lua source and strings are UTF8 bytes. Keep printable Unicode verbatim;
// only syntax and control characters need fixed-width decimal escapes.
export function luaString(value) {
  if (!value.isWellFormed()) throw new TypeError('Lua strings require well-formed Unicode');
  return '"' + [...value].map(char => {
    const code = char.codePointAt(0);
    return code < 32 || code === 127 || char === '"' || char === '\\'
      ? `\\${String(code).padStart(3, '0')}` : char;
  }).join('') + '"';
}
