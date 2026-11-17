// Read-only failure reproduction against the final bound candidate. Expected FAIL.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {integratedSource,integratedRead,integratedCiProof} from '../../../../tests/helpers/integrated-ci-source.mjs';
import {inspectionCiPacket} from '../../../../tests/helpers/battle-pointer-inspection-ci-source.mjs';
import {releaseSelectionMapPriorInventory,releaseSelectionMapCiPacket} from '../../../../tests/helpers/release-selection-map-ci-source.mjs';
import {sourceEpoch as activePost697Epoch,pointerBeforePotionEpoch} from '../../../../tests/helpers/closeout-source-epoch.mjs';
import {withPotionPointerCiUnionValidation} from '../../../../tests/helpers/potion-pointer-ci-union.mjs';
import {discoverJs as actualPost697DiscoverJs} from '../../../../scripts/ci-shards.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const mode=process.argv[2]??'original';assert(['original','union'].includes(mode));
const body=readFileSync(new URL(mode==='original'?'./fourth-original-body.txt':'./fourth-union-body.txt',import.meta.url),'utf8');
const names=['assert','integratedSource','integratedRead','integratedCiProof','inspectionCiPacket','releaseSelectionMapPriorInventory','releaseSelectionMapCiPacket','hash','actualUnionReadFileSync','actualPost697DiscoverJs','activePost697Epoch','actualReadFileSync','actualSource','inspectionSourceEpoch','discoverJs'];
const run=read=>{const values=[assert,integratedSource,integratedRead,integratedCiProof,inspectionCiPacket,releaseSelectionMapPriorInventory,releaseSelectionMapCiPacket,hash,readFileSync,actualPost697DiscoverJs,activePost697Epoch,read,p=>read(p,'utf8'),pointerBeforePotionEpoch,()=>actualPost697DiscoverJs().filter(p=>p!=='tests/potion-popup-click-payload.test.mjs')];const count=mode==='union'?11:names.length;return new Function(...names.slice(0,count),body)(...values.slice(0,count));};
// Avoid giant assertion-value formatting while retaining the precise failed line/message.
try{if(mode==='original')withPotionPointerCiUnionValidation('pointer',readFileSync,run);else run(readFileSync);console.log('UNEXPECTED PASS');process.exitCode=2;}
catch(error){assert.equal(error.code,'ERR_ASSERTION','only the documented contract assertion is a blocker');console.log(JSON.stringify({status:'EXPECTED BLOCKED',mode,code:error.code,message:error.message.slice(0,2000),stack:error.stack.split('\n').slice(-7)}));}
