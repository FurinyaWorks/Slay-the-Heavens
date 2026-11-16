#!/usr/bin/env node
'use strict';
// Reproduces the 2026-11-16 C1 natural-five audit using exactly 3 local inputs.
// Syntax and logic are bundled as text here; this run executed the equivalent in isolated V8,
// not this Node CLI. Usage: node <this-file> <B1.html> <C1.html> <2026-11-15-small-ab-runner.js>
const fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const files=process.argv.slice(2);
if(files.length!==3)throw Error('Usage: node reproduce.cjs B1.html C1.html small-ab-runner.js');
const expected=['3da512df7e62afdbfe49c7a8d47a781bebe65786','62385bed410b29aba731de3a429eb1fbe875036a','5a91cd203a1d3d63edbbeae4b7aa57a4988287d4'];
function gitBlob(s){return crypto.createHash('sha1').update('blob '+Buffer.byteLength(s,'utf8')+'\0'+s).digest('hex');}
const src=files.map(x=>fs.readFileSync(x,'utf8'));
src.forEach((s,i)=>{const h=gitBlob(s);if(h!==expected[i])throw Error('SOURCE_MISMATCH '+files[i]+' '+h);});
const oldSplit='const splits=[{name:"training",start:1,end:64},{name:"holdout",start:1001,end:1064}];';
const newSplit='const splits=[{name:"training",start:2001,end:2032},{name:"holdout",start:12001,end:12064}];';
if(src[2].split(oldSplit).length!==2)throw Error('RUNNER_SPLIT_DRIFT');
const runner=src[2].replace(oldSplit,newSplit);
function getResult(html){const all=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];if(all.length!==2)throw Error('HTML_SCRIPT_DRIFT');
 return vm.runInNewContext(all[0][1]+'\n'+runner+'\nrunEconomyAudit();',{}, {timeout:60000});}
const outputs=src.slice(0,2).map((s,i)=>({variant:i?'C1':'B1',actual_source_git_blob:expected[i],result:getResult(s)}));
console.log(JSON.stringify({run_date:'2026-11-16',outputs},null,2));
