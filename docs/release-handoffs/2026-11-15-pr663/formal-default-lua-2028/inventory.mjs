import {candidateScriptFiles} from './scripts/native-candidate-scripts.mjs';
import {readFileSync,writeFileSync,statSync} from 'node:fs';import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const inventory={};for(const side of ['before','after']){const files=candidateScriptFiles('./src/lua',`./build/${side}`);inventory[side]={files:files.map(f=>({name:f.name,bytes:statSync(f.sourceFile).size,sha256:hash(readFileSync(f.sourceFile)),variables:f.variables})),totalBytes:files.reduce((s,f)=>s+statSync(f.sourceFile).size,0)};}
writeFileSync('inventory.json',JSON.stringify(inventory,null,2));console.log(JSON.stringify({before:inventory.before.totalBytes,after:inventory.after.totalBytes,count:inventory.before.files.length,saved:inventory.before.totalBytes-inventory.after.totalBytes,layoutIncluded:inventory.before.files.some(f=>f.name==='abyss_ui_layout')},null,2));
