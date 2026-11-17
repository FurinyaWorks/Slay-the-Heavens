import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {integratedCiProof} from '../../../tests/helpers/integrated-ci-source.mjs';
import {releaseNavigationCiSource,releaseNavigationCiCheckedSource,assertReleaseNavigationCiCurrent} from '../../../tests/helpers/release-navigation-ci-source.mjs';
import {assertReleaseBootstrapCiCurrent} from './bootstrap-original.mjs';
import {releaseMergeRead,assertReleaseMergeCurrent} from '../../../tests/helpers/release-bootstrap-merge-ci-source.mjs';
import {navigationMapRead} from '../../../tests/helpers/navigation-map-integration.mjs';
import {jointRead,packet,assertCurrent} from '../../../tests/helpers/release-navigation-pc22-join.mjs';
import {sourceEpoch} from '../../../tests/helpers/closeout-source-epoch.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
export function assertNavigationStandaloneCurrent(read=readFileSync){
 assertReleaseMergeCurrent(read);
 assertReleaseBootstrapCiCurrent(releaseMergeRead('bootstrapView',read));
 assertReleaseNavigationCiCurrent(releaseMergeRead('slicePrior',read));
 for(const [path,row]of Object.entries(integratedCiProof.files))assert.equal(hash(norm(releaseNavigationCiCheckedSource(path,releaseMergeRead('slicePrior',read)(path,'utf8'),row.current))),row.current.sha256,'fresh complete integration source: '+path);
 for(const [path,row]of Object.entries(integratedCiProof.closure))assert.equal(hash(path.endsWith('.gz')?read(path):norm(releaseNavigationCiSource(path,releaseMergeRead('slicePrior',read)(path,'utf8'),integratedCiProof.files[path]?.current))),row.after,'fresh integration copy owner: '+path);
}

// Diagnostic scoped snapshot only; not exported or used by production validators.
let count=0,total=0,start=Date.now();
const raw=(p,e)=>{const b=readFileSync(p,e);count++;total+=Buffer.byteLength(b);if(Date.now()-start>90000)throw Error('DIAGNOSTIC_BUDGET_90S');return b;};
const snapshot=new Map();
const capture=(p,e)=>{const value=raw(p,e);snapshot.set(p,typeof value==='string'?Buffer.from(value):Buffer.from(value));return value;};
assertCurrent(capture);
const scoped=(p,e)=>{const b=snapshot.get(p);if(!b)return raw(p,e);return e?b.toString(e):Buffer.from(b);};
const projected=(p,e)=>{
 const b=scoped(p,e),text=typeof b==='string'?b:b.toString('utf8'),row=Object.hasOwn(packet.files,p)?packet.files[p]:null;
 if(Buffer.isBuffer(b)&&!Buffer.from(text).equals(b))return b;
 const prior=row&&row.views.navigation!==null&&hash(norm(text))===row.current?packet.sources[row.views.navigation]:text;
 return typeof b==='string'?prior:prior===text?b:Buffer.from(prior);
};
const ci=navigationMapRead('navigation',projected);
const read=(path,encoding)=>{
 if(!path.startsWith('src/')&&path!=='config/architecture.json')return ci(path,encoding);
 const value=scoped(path,encoding);if(typeof value!=='string')return value;
 return sourceEpoch.preCombinedSource(path,value,{target:'releaseNavigationReviewed',readSource:p=>scoped(p,'utf8')});
};
try{assertNavigationStandaloneCurrent(read);assertCurrent(raw);console.log('SCOPED DIAGNOSTIC STANDALONE PASS')}catch(e){console.log(e.stack);process.exitCode=1}
finally{console.log(JSON.stringify({count,total,seconds:(Date.now()-start)/1000}));}
