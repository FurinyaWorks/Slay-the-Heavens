import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [tool,out]=process.argv.slice(2).map(x=>resolve(x));
mkdirSync(out,{recursive:false});
const {removeClient}=await import(pathToFileURL(join(tool,'src/scene-save.mjs')));
let mapPath=join(tool,'tests/fixtures/editor-2026-10-13-clientkinds.gil');
for(const [i,what] of [{ui:'CG_ui'},{template:'basket'},{template:'容器节点'},{script:'CG_game'}].entries()){
 ({mapPath}=removeClient({mapPath,...what,outputName:i===3?'fixture-base':'cleanup-'+i},out));
}
assert.equal(createHash('sha256').update(readFileSync(mapPath)).digest('hex'),'b3b46b0412caf865ebc259c15ad8215b33a1797ab7940861eb562320541e13a2');
console.log(mapPath);
