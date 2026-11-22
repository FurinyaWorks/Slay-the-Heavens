import {beforeReleaseUiCloseoutSource} from './release-ui-closeout-source.mjs';
// Exact full-source continuation. Unknown or modified bytes never project.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('./sts1-menu-prior.test.mjs.gz',import.meta.url));
assert.equal(hash(bytes),'b10cce10b072edcd45acc8204944ece9b604343699658543229999991ec94431');
const files=JSON.parse(gunzipSync(bytes));
for(const row of Object.values(files))assert.equal(hash(row.before),row.beforeSha256);
const choice=JSON.parse(readFileSync(new URL('../fixtures/release-choice-test-source.json',import.meta.url),'utf8'));
const selection=JSON.parse(readFileSync(new URL('../fixtures/release-selection-summary-source.json',import.meta.url),'utf8'));
function beforeCompactPopupTest(path,source){
 if(path!=='tests/official-assets.test.mjs'||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(hash(lf)!=='fd03f10dfdc27835d113c8c3f7246a239dea551a73e82862282e73d98feeebe7')return source;
 const prior=lf.replace("assert.equal(child(stat,'face').image,nativeTheme.image.rect);","assert.equal(child(stat,'face').image,107311);")
  .replace("assert.equal(child(stat,'face').colour,nativeTheme.color.panel);","assert.equal(child(stat,'face').colour,'#FFFFFF');")
  .replace(" const subtitle=child(cover,'subtitle');\n",'')
  .replace("['veil','blocker','subtitle','message','cancel']","['veil','blocker','message','cancel']")
  .replace(" assert.strictEqual(child(cover,'subtitle'),subtitle);\n assert.equal(subtitle.visible,false);\n",'');
 assert.equal(hash(prior),'9f7805663713e1c0a036cfa19d1518750cf568c5c38335da33d17a4430832c9b','exact predecessor before the result plaque and subtitle assertions');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
function beforeTest(path,source,record){
 if(path!=='tests/official-assets.test.mjs'||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(hash(lf)!==record.afterSha256)return source;
 const lines=lf.split('\n');
 for(const [index,count,previous]of record.edits)lines.splice(index,count,...previous);
 const prior=lines.join('\n');
 assert.equal(hash(prior),record.beforeSha256,'exact predecessor of the official asset test');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeSts1MenuCiSource(path,source){
 const beforeSelection=beforeTest(path,source,selection);
 source=beforeReleaseUiCloseoutSource(path,beforeTest(path,beforeCompactPopupTest(path,beforeSelection),choice));
 const row=Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(source.replaceAll('\r\n','\n'))!==row.afterSha256)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
