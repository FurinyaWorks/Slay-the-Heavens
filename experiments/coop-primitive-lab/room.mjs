import assert from 'node:assert/strict';
import {copyFileSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {isAbsolute,join,relative,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {room} from './scenes.mjs';

const [baseArg,outArg]=process.argv.slice(2);
const tool=process.env.MILIASTRA_MCP_ROOT;
assert(baseArg && outArg && tool,'Set MILIASTRA_MCP_ROOT and pass <base.gil> <new output directory>');
const base=realpathSync(baseArg),out=resolve(outArg);
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const baseSha256=hash(base);
const sdk=join(tool,'node_modules/@modelcontextprotocol/sdk/dist/esm/client');
const {Client}=await import(pathToFileURL(join(sdk,'index.js')));
const {StdioClientTransport}=await import(pathToFileURL(join(sdk,'stdio.js')));
mkdirSync(out);
const copy=join(out,'input.gil');
copyFileSync(base,copy);
const client=new Client({name:'abyss-coop-room-lab',version:'1'});
const save=(name,value)=>writeFileSync(join(out,name+'.json'),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
try {
  await client.connect(new StdioClientTransport({command:process.execPath,args:[join(tool,'src/server.mjs')],
    env:{...process.env,MILIASTRA_WORKSPACE:out,MILIASTRA_ALLOW_LIVE_WRITE:'0'}}));
  for (const name of ['workflow','platform-rules']) {
    save(name,await client.readResource({uri:'miliastra://'+name}));
  }
  async function call(name,args) {
    const response=await client.callTool({name,arguments:args});
    assert(!response.isError,JSON.stringify(response));
    return response.structuredContent??JSON.parse(response.content.find(item=>item.type==='text').text);
  }
  const before=await call('scene_list_respawn_points',{mapPath:copy});
  const written=await call('scene_set_player_count',{mapPath:copy,...room,outputName:'coop-room-lab'});
  const candidate=realpathSync(written.mapPath),rel=relative(realpathSync(out),candidate);
  assert(rel && !isAbsolute(rel) && !rel.startsWith('..'+sep) && rel!=='..' && candidate!==copy);
  const after=await call('scene_list_respawn_points',{mapPath:candidate});
  assert.deepEqual(after.players,room);
  assert.equal(hash(base),baseSha256);
  assert.equal(hash(copy),baseSha256);
  save('room-receipt',{sourceSha256:baseSha256,candidate:rel,sha256:hash(candidate),before:before.players,
    after:after.players,officialImport:'UNVERIFIED',lobbyAdmission:'UNVERIFIED'});
} finally {
  await client.close();
}
