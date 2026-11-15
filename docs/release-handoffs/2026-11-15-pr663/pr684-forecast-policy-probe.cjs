const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const url=require('node:url');
(async()=>{
  const [,,candidate,mode]=process.argv;
  const project=process.cwd();
  const imp=p=>import(url.pathToFileURL(path.join(project,p)));
  const raw=fs.readFileSync;
  const {releasePcCiPacket,assertReleasePcCiCurrent}=await imp('tests/helpers/release-pc-ci-source.mjs');
  const {discoverJs,jsShard,jsPlanningWeights,timings}=await imp('scripts/ci-shards.mjs');
  const {shardLuaScripts}=await imp('scripts/test-lua.mjs');
  const src=raw(candidate,'utf8');
  const name="test('release PC raw Full inventory";
  const last=src.lastIndexOf(name); assert(last>=0);
  const fields={
    assert, assertReleasePcCiCurrent:()=>assertReleasePcCiCurrent(raw),
    rawReleaseReadFileSync:(f,e)=>{
      const v=raw(f,e);
      if(mode==='wrong-actual-cap'&&f==='.github/workflows/quality.yml')
        return v.replace("inputs.runner_pool == 'local-special' && 75 || 45","inputs.runner_pool == 'local-special' && 75 || 49");
      return v;
    },
    releasePcCiPacket,
    rawReleaseDiscoverJs:()=>mode==='wrong-inventory'?discoverJs().slice(1):discoverJs(),
    rawReleaseLua:()=>fs.readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),
    rawCurrentJsShard:(...x)=>{const cut=jsShard(...x);return mode==='diagnostic-overrun'?{...cut,loads:cut.loads.map(n=>n+700000)}:cut},
    rawCurrentJsPlanningWeights:jsPlanningWeights,rawCurrentTimings:timings,shardLuaScripts,
    test:(name,callback)=>{callback({diagnostic:s=>console.log(s)});console.log('PASS extracted raw policy check:',mode,name);}
  };
  new Function(...Object.keys(fields),src.slice(last))(...Object.values(fields));
})().catch(e=>{console.error(e);process.exitCode=1});
