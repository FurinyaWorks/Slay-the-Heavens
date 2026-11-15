import ctypes,sys
lib=ctypes.CDLL('/usr/lib/x86_64-linux-gnu/liblua5.4.so.0.0.0')
lib.luaL_newstate.restype=ctypes.c_void_p
lib.luaL_openlibs.argtypes=[ctypes.c_void_p]
lib.luaL_loadfilex.argtypes=[ctypes.c_void_p,ctypes.c_char_p,ctypes.c_char_p]
lib.lua_pcallk.argtypes=[ctypes.c_void_p,ctypes.c_int,ctypes.c_int,ctypes.c_int,ctypes.c_longlong,ctypes.c_void_p]
lib.lua_tolstring.argtypes=[ctypes.c_void_p,ctypes.c_int,ctypes.c_void_p];lib.lua_tolstring.restype=ctypes.c_char_p
lib.lua_close.argtypes=[ctypes.c_void_p]
L=lib.luaL_newstate();lib.luaL_openlibs(L)
r=lib.luaL_loadfilex(L,sys.argv[1].encode(),None)
if r==0:r=lib.lua_pcallk(L,0,-1,0,0,None)
if r:print(lib.lua_tolstring(L,-1,None).decode(),file=sys.stderr)
lib.lua_close(L);sys.exit(bool(r))
