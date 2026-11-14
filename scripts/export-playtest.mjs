import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync,renameSync,rmSync,lstatSync,realpathSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {resolve,dirname,basename,join,extname} from 'node:path';
import {pathToFileURL} from 'node:url';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const invisible=/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;
function pathText(value){
 if(typeof value!=='string'||!value||invisible.test(value))throw Error('Path contains missing or invisible/control characters');
 return value;
}
export function exportPlaytest(receiptPath,{cwd=process.cwd()}={}){
 const receiptFile=resolve(cwd,pathText(receiptPath));
 const receipt=JSON.parse(readFileSync(receiptFile,'utf8'));
 if(!/^[a-f0-9]{64}$/.test(receipt.sha256??'')||!/^[a-f0-9]{40}$/.test(receipt.sourceCommit??'')
  ||receipt.sourceDirty!==false||!/^[a-f0-9-]{36}$/.test(receipt.buildId??''))throw Error('A clean, identified native candidate receipt is required');
 const source=resolve(cwd,pathText(receipt.mapPath));
 if(extname(source).toLowerCase()!=='.gil')throw Error('Candidate must be a .gil file');
 const bytes=readFileSync(source);
 if(hash(bytes)!==receipt.sha256)throw Error('Candidate hash differs from its receipt; latest was not replaced');
 // git-common-dir, rather than cwd, keeps the public path outside any worktree.
 const common=execFileSync('git',['rev-parse','--path-format=absolute','--git-common-dir'],{cwd,encoding:'utf8'}).trim();
 if(basename(common)!=='.git')throw Error('Expected a non-bare repository common .git directory');
 const root=realpathSync(dirname(pathText(common))),folder=join(root,'playtest');
 mkdirSync(folder,{recursive:true});
 if(lstatSync(folder).isSymbolicLink())throw Error('Public delivery folder must be a physical directory');
 const latest=join(folder,'latest.gil'),metadata=join(folder,'latest.json');
 if(latest===source)throw Error('Export from the original build receipt, not the public alias');
 if(existsSync(latest)){
  if(lstatSync(latest).isSymbolicLink())throw Error('Public candidate must be a physical file');
  const previous=readFileSync(latest),priorHash=hash(previous),archive=join(folder,'archive');
  mkdirSync(archive,{recursive:true});
  const saved=join(archive,priorHash+'.gil');
  if(existsSync(saved)&&hash(readFileSync(saved))!==priorHash)throw Error('Archived candidate hash mismatch');
  if(!existsSync(saved))writeFileSync(saved,previous,{flag:'wx'});
  if(existsSync(metadata))copyFileSync(metadata,join(archive,priorHash+'.json'));
 }
 const result={schemaVersion:1,path:latest,folder,filename:'latest.gil',sha256:receipt.sha256,bytes:bytes.length,
  buildId:receipt.buildId,sourceCommit:receipt.sourceCommit,sourceDirty:false,receipt:receiptFile,
  verification:'Path and copy integrity only; official capacity, import and ready are not certified.'};
 const temporary=join(folder,'.latest-'+randomUUID());
 try{
  copyFileSync(source,temporary+'.gil');
  if(hash(readFileSync(temporary+'.gil'))!==receipt.sha256)throw Error('Public copy hash mismatch');
  writeFileSync(temporary+'.json',JSON.stringify(result,null,2)+'\n');
  renameSync(temporary+'.gil',latest);renameSync(temporary+'.json',metadata);
  if(hash(readFileSync(latest))!==receipt.sha256||lstatSync(latest).isSymbolicLink())throw Error('Public candidate readback failed');
 }finally{
  for(const suffix of ['.gil','.json'])rmSync(temporary+suffix,{force:true});
 }
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  if(process.argv.length!==3)throw Error('Usage: node scripts/export-playtest.mjs <audio/candidate.json>');
  const result=exportPlaytest(process.argv[2]);
  console.log(`Folder: ${result.folder}\nSelect: latest.gil\nSHA256: ${result.sha256}`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
