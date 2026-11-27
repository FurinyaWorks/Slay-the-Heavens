"""Test the shipped opt-in standalone Lua adapter, not a fake production client."""
import tempfile,subprocess,sys,json
from pathlib import Path
here=Path(__file__).resolve().parent

def lua(x):
    if x is None: return 'nil'
    if x is False:return 'false'
    if x is True:return 'true'
    if type(x) in (int,float):return str(x)
    if isinstance(x,str):return json.dumps(x,ensure_ascii=False).replace('\\u','\\\\u')
    if isinstance(x,list):return '{'+','.join(map(lua,x))+'}'
    if isinstance(x,dict):return '{'+','.join('['+lua(k)+']='+lua(v) for k,v in x.items())+'}'
    raise TypeError(type(x))
with tempfile.TemporaryDirectory() as t:
    pack=json.loads(Path(sys.argv[1]).read_bytes())
    # The bridge never reads private source metadata at runtime.
    pack['cards']={k:{f:v[f] for f in ('id','name','icon','decoration','backing','sourceAssetSha256')} for k,v in pack['cards'].items()}
    p=Path(t)/'pack.lua';p.write_text('return '+lua(pack)+'\n')
    subprocess.run([sys.argv[2] if len(sys.argv)>2 else 'texlua',str(here/'runtime_test.lua'),str(here/'card_art_experiment.lua'),str(p)],check=True)
