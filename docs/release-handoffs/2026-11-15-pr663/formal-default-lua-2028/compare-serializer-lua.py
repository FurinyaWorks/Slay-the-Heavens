"""Parse paired producer outputs with Lua 5.4; compare native value types and bytes."""
import ctypes as c, hashlib, json, pathlib, struct, sys
lib = c.CDLL('liblua5.4.so.0')
def bind(name, ret, *args):
    f = getattr(lib, 'lua'+name)
    f.restype, f.argtypes = ret, args
    return f
P,I,S=c.c_void_p,c.c_int,c.c_size_t
new=bind('L_newstate',P); close=bind('_close',None,P)
load=bind('L_loadfilex',I,P,c.c_char_p,c.c_char_p)
call=bind('_pcallk',I,P,I,I,I,c.c_longlong,P)
kind=bind('_type',I,P,I); top=bind('_gettop',I,P); settop=bind('_settop',None,P,I)
nil=bind('_pushnil',None,P); nextpair=bind('_next',I,P,I)
istr=bind('_tolstring',P,P,I,c.POINTER(S)); isint=bind('_isinteger',I,P,I)
integer=bind('_tointegerx',c.c_longlong,P,I,P); number=bind('_tonumberx',c.c_double,P,I,P)
boolean=bind('_toboolean',I,P,I)
def raw(l,i):
    n=S(); p=istr(l,i,c.byref(n)); return c.string_at(p,n.value).hex()
def read(l,i):
    k=kind(l,i)
    if k==0:return ('nil',)
    if k==1:return ('bool',bool(boolean(l,i)))
    if k==3:
        if isint(l,i):return ('int',integer(l,i,None))
        return ('float',struct.pack('>d',number(l,i,None)).hex())
    if k==4:return ('str',raw(l,i))
    if k==5:
        table={}
        nil(l)
        while nextpair(l,i):
            key=read(l,top(l)-1)
            assert key not in table
            table[key]=read(l,top(l))
            settop(l,top(l)-1)
        return ('table',tuple(sorted(table.items())))
    raise ValueError(f'unexpected Lua type {k}')
def parse(path):
    l=new()
    if not l:raise RuntimeError('luaL_newstate failed')
    try:
        if load(l,str(path).encode(),b't') or call(l,0,1,0,0,None):
            raise ValueError(bytes.fromhex(raw(l,-1)).decode(errors='replace'))
        return read(l,top(l))
    finally:close(l)
def main():
    if not __debug__: raise RuntimeError("Run without Python optimization (-O)")
    a,b=map(pathlib.Path,sys.argv[1:])
    outputs=set(p.name for p in a.iterdir())
    assert outputs==set(p.name for p in b.iterdir())
    expected={'abyss_data.lua','abyss_original_v4_data.lua','abyss_theme.lua','abyss_narrative.lua','abyss_presentation.lua'}
    evidence={}; unchanged=[]
    for name in sorted(outputs):
        pa,pb=a/name,b/name; x,y=pa.read_bytes(),pb.read_bytes()
        if name in expected:
            ox,oy=parse(pa),parse(pb)
            assert ox==oy, f'Lua semantics differ: {name}'
            assert len(x)>len(y), f'not smaller: {name}'
            evidence[name]={'before':len(x),'after':len(y),'saved':len(x)-len(y),
              'beforeSha256':hashlib.sha256(x).hexdigest(),'afterSha256':hashlib.sha256(y).hexdigest(),
              'canonicalSha256':hashlib.sha256(repr(ox).encode('utf-8')).hexdigest()}
        else:
            assert x==y, f'unexpected byte difference: {name}'
            unchanged.append(name)
    assert evidence.keys()==expected
    print(json.dumps({'modules':evidence,'unchanged':unchanged,'savedSourceBytes':sum(x['saved'] for x in evidence.values())},indent=2))
if __name__=='__main__':main()
