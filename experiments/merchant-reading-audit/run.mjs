import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const root=resolve(import.meta.dirname,'../..');
const read=p=>readFileSync(join(root,p),'utf8');
const sourcePaths=['src/lua/abyss_merchant_pages.lua','src/lua/abyss_merchant.lua','data/presentation/narrative.zh-CN.json','data/presentation/ui_theme.json'];
const hashes=Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(read(p)).digest('hex')]));
const narrative=JSON.parse(read(sourcePaths[2])).merchant;
const theme=JSON.parse(read(sourcePaths[3])).layout.merchant;
const rows=[];let lua=`package.path=${JSON.stringify(join(root,'src/lua/?.lua;'))}..package.path\nlocal P=require('abyss_merchant_pages')\n`;
for(const [key,copy] of Object.entries(narrative))for(const [profile,budget] of [['default',theme.pageCharacters],['official',theme.official.pageCharacters]]){
 const text=key==='encounter'?copy:`「${copy}」`;rows.push({key,profile,budget,text});
 lua+=`do local c={${Array.from(text).map(c=>JSON.stringify(c)).join(',')}};local out={};local first=1;for _,last in ipairs(P.ends(c,${budget}))do out[#out+1]=table.concat(c,'',first,last);first=last+1 end;print(table.concat(out,'\\t')) end\n`;
}
const tmp=mkdtempSync(join(tmpdir(),'merchant-reading-'));
try{
 const path=join(tmp,'audit.lua');writeFileSync(path,lua);
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',`dofile(${JSON.stringify(path)})`],{encoding:'utf8',timeout:10000});
 assert.equal(r.status,0,r.stderr);const lines=r.stdout.trimEnd().split('\n');assert.equal(lines.length,rows.length);
 rows.forEach((row,i)=>{row.pages=lines[i].replace(/\r$/,'').split('\t');assert.equal(row.pages.join(''),row.text);row.lengths=row.pages.map(p=>Array.from(p).length);assert(row.lengths.every(n=>n>0&&n<=row.budget));row.shortPages=row.pages.filter(p=>Array.from(p).length<=3);row.minimumAutomaticSeconds=Number((Array.from(row.text).length/theme.typeRate+row.pages.length*theme.hold).toFixed(2));});
 const report={sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceHashes:hashes,holdSeconds:theme.hold,typeRate:theme.typeRate,boundary:'Actual production Lua pagination; theoretical timer sum, not runtime/device measurement. No interaction, interruptions, pauses or frame rounding included.',rows};
 writeFileSync(join(import.meta.dirname,'result.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`${rows.length}/${rows.length} source rows: lossless, budget bounded; ${rows.reduce((n,r)=>n+r.shortPages.length,0)} pages <=3 characters`);
}finally{rmSync(tmp,{recursive:true,force:true});}
