// Diagnostic only: two known RED cases, not a successful gameplay acceptance.
import {mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {buildLuaData} from '../../../scripts/build-lua-data.mjs';
import {buildUI} from '../../../scripts/build-ui.mjs';
const dir=resolve('work/freeze/p0-generated');mkdirSync(dir,{recursive:true});
buildLuaData('data',join(dir,'abyss_data.lua'));
buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
const cli=createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js');
const result=spawnSync(process.execPath,[cli,'-e',`dofile(${JSON.stringify(resolve('docs/evidence/release-freeze-20261116/p0-input-probe.lua'))})`],{stdio:'inherit',env:{...process.env,LUA_PATH:`src/lua/?.lua;${dir}/?.lua;;`}});
if(result.error)throw result.error;
process.exitCode=result.status??1;
