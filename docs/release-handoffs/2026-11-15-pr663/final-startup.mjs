// Offline, read-only converter. stdout only; does not start a game or certify release.
import {readFileSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
try {
 const [repo,toolRoot,receiptFile,contextFile,startedFile,statusFile]=process.argv.slice(2);
 if(process.argv.length!==8)throw Error('Usage: node final-startup.mjs <repo> <tool-root> <final-candidate.json> <before-start-context.json> <actual-start-result.json> <actual-status-result.json>');
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 const receipt=read(receiptFile),context=read(contextFile),started=read(startedFile),status=read(statusFile);
 // context MUST have been captured immediately before the real playtest_start call.
 if(!Number.isFinite(Date.parse(receipt.startedAt))||!Number.isFinite(context.startedAt)||context.startedAt>Date.now()||context.startedAt< Date.parse(receipt.startedAt))throw Error('Missing or invalid saved pre-start timestamp');
 if(!/^[a-f0-9]{40}$/.test(context.sourceCommit??'')||context.sourceCommit!==receipt.sourceCommit||receipt.sourceDirty!==false)throw Error('Frozen clean source mismatch');
 if(!/^[a-f0-9-]{36}$/.test(context.buildId??'')||context.buildId!==receipt.buildId)throw Error('Build mismatch');
 if(!/^[a-f0-9]{64}$/.test(context.candidateHash??'')||context.candidateHash!==receipt.candidate?.sha256||receipt.sha256!==context.candidateHash)throw Error('Final audio receipt/hash mismatch');
 if(realpathSync(resolve(context.mapPath))!==realpathSync(resolve(receipt.mapPath))||hash(readFileSync(context.mapPath))!==context.candidateHash)throw Error('Actual final candidate path/bytes changed');
 if(!started.runId||!started.runDir)throw Error('Actual start result missing run identity');
 const expected={runId:started.runId,runDir:started.runDir,mapPath:context.mapPath,candidateHash:context.candidateHash,buildId:context.buildId,startedAt:context.startedAt};
 const parser=join(resolve(toolRoot),'src/debug-log.mjs');
 const {inspectDebugLog}=await import(pathToFileURL(parser));
 const {requireStartupEvidence}=await import(pathToFileURL(join(resolve(repo),'scripts/native-playtest-evidence.mjs')));
 const evidence=requireStartupEvidence(status,expected,{decodeLog:bytes=>inspectDebugLog(bytes,{limit:100000}),parserVersion:hash(readFileSync(parser))});
 // Read again after decode: fail rather than emit a receipt if the GIL changed.
 if(hash(readFileSync(context.mapPath))!==context.candidateHash)throw Error('Final candidate changed during evidence verification');
 console.log(JSON.stringify(evidence,null,2));
}catch(error){console.error('BLOCKED: '+error.message);process.exitCode=1;}
