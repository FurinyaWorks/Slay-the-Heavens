import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareNativeCandidate, requireSourceSha, candidateEntrySource,nativeControlsEqual } from '../scripts/native-candidate-audit.mjs';
import { withNativeImageTypes } from '../scripts/native-ui-encoder.mjs';
import {auditPortraitTemplateBindings} from '../scripts/audit-native-candidate.mjs';
import {selectionHalfImage,selectionHalfTemplate} from '../scripts/lumine-selection-background.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/native-candidate-audit/readback-slice.json', import.meta.url)));

test('native defaults stay specific to container size, true text outline and non-pointer false annotations',()=>{
 const eq=(source,actual)=>nativeControlsEqual([source],[actual]);
 const container={name:'box',kind:'container'};
 assert(eq(container,{...container,size:[150,150]}));
 assert(!eq({...container,size:[150,150]},container),'missing read-back rectangle is not a source default');
 assert(!eq(container,{...container,size:[149,150]}));
 assert(!eq({name:'image',kind:'image'},{name:'image',kind:'image',size:[80,80]}));
 for(const kind of ['container','image','text','textWindow']){
  const source={name:'box',kind,raycastTarget:false},actual={name:'box',kind,...(kind==='container'?{size:[150,150]}:{})};
  assert(eq(source,actual));assert(!eq({...source,raycastTarget:true},actual));
 }
 assert(!eq({name:'hit',kind:'cursorArea',raycastTarget:false},{name:'hit',kind:'cursorArea'}));
 assert(eq({name:'label',kind:'text',text:{outline:true}},{name:'label',kind:'text',text:{}}));
 assert(!eq({name:'label',kind:'text',text:{outline:false}},{name:'label',kind:'text',text:{}}));
 for(const kind of ['image','unregistered'])assert(!eq({name:'foreign',kind,text:{outline:true}},{name:'foreign',kind,text:{}}));
 for(const metadata of [{raycastTarget:false},{outline:true},{size:[150,150]}])
  assert(!eq({...container,metadata},{...container,size:[150,150],metadata:{}}));
});

test('fill progress matches only the exact native percentage encoding, never an epsilon or opaque payload',()=>{
 const image=amount=>({name:'image',kind:'image',fill:{shape:'horizontal',from:'left',amount}});
 for(const amount of [0,.001,.514,.995,1]){
  const decoded=Math.round(amount*100)/100;
  assert(nativeControlsEqual([image(amount)],[image(decoded)]));
  assert(!nativeControlsEqual([image(amount)],[image(decoded===1?.99:decoded+.01)]));
 }
 for(const amount of [-.1,1.1,NaN,Infinity])assert(!nativeControlsEqual([image(amount)],[image(amount)]));
 const source=image(.514),actual=image(.51);
 assert(!nativeControlsEqual([{...source,metadata:{fill:{amount:.514}}}],[{...actual,metadata:{fill:{amount:.51}}}]));
 const omitted=image(undefined);assert(nativeControlsEqual([omitted],[image(1)]));
});

test('native anchor f32 and XYZ-to-Z projection retain one-ULP and opaque metadata rejection',()=>{
 const box={name:'box',kind:'container',size:[150,150],anchor:{min:[.185,.31],max:[.435,.56]},rotation:[71.71453027000204,0,-102.00624798435123]};
 const decoded={...box,anchor:{min:box.anchor.min.map(Math.fround),max:box.anchor.max.map(Math.fround)},rotation:box.rotation.map(Math.fround)};
 assert(nativeControlsEqual([box],[decoded]));
 const wrong=structuredClone(decoded);wrong.anchor.min[0]+=2**-26;assert(!nativeControlsEqual([box],[wrong]));
 const wrongRotation=structuredClone(decoded);wrongRotation.rotation[0]+=2**-17;assert(!nativeControlsEqual([box],[wrongRotation]));
 for(const z of [0,90,180,-90]){
  const source={name:'shape',kind:'image',rotation:[0,0,z]},actual={name:'shape',kind:'image',...(z?{rotation:z}:{})};
  assert(nativeControlsEqual([source],[actual]));
 }
 assert(!nativeControlsEqual([{...box,rotation:[1,2]}],[{...box,rotation:[1,2]}]));
 assert(!nativeControlsEqual([{...box,metadata:{anchor:box.anchor}}],[{...decoded,metadata:{anchor:decoded.anchor}}]));
 assert(!nativeControlsEqual([{...box,rotation:[0,0,1]}],[{...decoded,rotation:1+2**-23}]));
 assert(!nativeControlsEqual([{...box,kind:'unregistered'}],[{...decoded,kind:'unregistered'}]));
 assert(!nativeControlsEqual([{name:'foreign',kind:'unregistered',rotation:[0,0,90]}],[{name:'foreign',kind:'unregistered',rotation:90}]));
});

test('unencoded gallery imageType remains a real difference, including stretch',()=>{
 for(const imageType of ['basic','stretch']){
  const source={name:'gallery',kind:'image',image:106056,imageType};
  assert(!nativeControlsEqual([source],[{name:'gallery',kind:'image',image:106056}]));
 }
});

test('native gallery modes preserve explicit Basic and Stretch while absent stays absent',async()=>{
 const source=`
const field=(id,wire,value)=>Buffer.from(JSON.stringify({id,wire,value})+'\\n');
const clientBlock=(_kind,bytes)=>bytes;
export function clientControlRecord({rootForm,image,colour,mask}){
 return {image:[clientBlock(96,Buffer.concat([field(502,0,colour),field(503,0,image)]))]}.image[0];
}
export function write(c){
 const only=(keys,kinds)=>{if(keys.some(key=>c[key]!==undefined)&&!kinds.includes(c.kind))throw Error('Unexpected field');};
 only(['image','colour','opacity','mask'],['image']);
 return clientControlRecord({image:c.image,colour:c.colour});
}
export function read(picture){
 const out={},has=(b,id)=>Object.hasOwn(b,id),number=(b,id)=>b[id];
 if(has(picture,503))out.image=number(picture,503);
 return out;
}`;
 const load=code=>import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const before=await load(source),after=await load(withNativeImageTypes(source));
 const gallery={kind:'image',image:106056,colour:0xffffffff};
 assert.deepEqual(after.write(gallery),before.write(gallery));
 assert.deepEqual(after.read({503:gallery.image}),{image:gallery.image});
 for(const [imageType,value] of [['basic',0],['stretch',1]]){
  const data=after.write({...gallery,imageType}).toString().trim().split('\n').map(JSON.parse);
  assert.deepEqual(data[0],{id:501,wire:0,value});
  assert.deepEqual(after.read(Object.fromEntries(data.map(row=>[row.id,row.value]))),{image:gallery.image,imageType});
 }
 assert.throws(()=>after.write({...gallery,imageType:'unknown'}),/requires a gallery image/);
 assert.throws(()=>after.write({...gallery,image:100002,imageType:'basic'}),/requires a gallery image/);
 assert.throws(()=>after.write({kind:'text',imageType:'basic'}),/Unexpected field/);
 assert.throws(()=>after.read({501:2,503:gallery.image}),/Unsupported native image type/);
 assert.throws(()=>withNativeImageTypes(source.replace('if(has(picture,503))','if(true)')),/schema changed/);
});

test('official selection audit binds the read-back half triangle to the same candidate and distinct native IDs',()=>{
 const sourceSha='a'.repeat(40),candidateHash='b'.repeat(64);
 const rows=[{template:{name:'AbyssReadyCardImage'},templateIndex:77},{template:{name:'AbyssReadyCardGroup'},templateIndex:88},
  {template:selectionHalfImage(),templateIndex:99}];
 const receipt={sourceCommit:sourceSha,candidate:{sha256:candidateHash},officialPortraits:{imageTemplateIndex:77,containerTemplateIndex:88,selectionHalfImageTemplateIndex:99}};
 const options={sourceSha,candidateHash,officialAssets:true,selectionAvatar:true};
 assert.deepEqual(auditPortraitTemplateBindings(receipt,rows,options),{image:rows[0],container:rows[1],half:rows[2]});
 assert.deepEqual(auditPortraitTemplateBindings(receipt,rows,{...options,officialAssets:false}),{image:rows[0],container:rows[1]});
 for(const bad of [[],rows.slice(0,2),[...rows,rows[2]],rows.map((row,i)=>i===2?{...row,templateIndex:0}:row),
  rows.map((row,i)=>i===2?{...row,templateIndex:77}:row),[...rows,{template:{name:'foreign'},templateIndex:99}]])
  assert.throws(()=>auditPortraitTemplateBindings(receipt,bad,options),/template binding/);
 for(const changed of [{...receipt,sourceCommit:'c'.repeat(40)},{...receipt,candidate:{sha256:'d'.repeat(64)}},
  {...receipt,officialPortraits:{...receipt.officialPortraits,selectionHalfImageTemplateIndex:100}}])
  assert.throws(()=>auditPortraitTemplateBindings(changed,rows,options),/template binding/);
});

test('official selection half-template still undergoes complete ID and geometry readback comparison',()=>{
 const check=change=>audit(input=>{
  const wanted={template:selectionHalfImage(),templateIndex:99};
  input.expected.runtimeTemplates=[wanted];input.actual.runtimeTemplates=[structuredClone(wanted)];
  change(input.actual.runtimeTemplates);
 });
 assert.equal(check(()=>{}).ok,true);
 for(const change of [rows=>rows.pop(),rows=>rows.push(structuredClone(rows[0])),rows=>{rows[0].templateIndex=100;},
  rows=>{rows[0].template.fill.amount=.75;},rows=>{rows[0].template.image=100001;},rows=>{rows[0].template.name=selectionHalfTemplate+'Changed';}])
  assert.equal(check(change).ok,false);
});
test('only a receipt bound to the exact candidate can add its exact entry marker', () => {
  const source = 'local view\nreturn view\n', hash = 'a'.repeat(64);
  const receipt = { buildId: '86e30616-6b6a-408e-b8bd-6491b9e2793c', candidate: { sha256: hash } };
  const marked = `print("ABYSS_BUILD ${receipt.buildId}")\n${source}`;
  assert.equal(candidateEntrySource(source, undefined, hash), source);
  assert.equal(candidateEntrySource(source, receipt, hash), marked);
  assert.equal(candidateEntrySource('\uFEFF' + source, receipt, hash), marked);
  for (const value of [undefined, '', 'b'.repeat(64)]) assert.throws(() => candidateEntrySource(source, receipt, value));
  for (const buildId of ['', 'unbound', '\"); error("injected") --'])
    assert.throws(() => candidateEntrySource(source, { ...receipt, buildId }, hash));
  assert.throws(() => candidateEntrySource(source, { ...receipt, candidate: {} }, hash));
  assert.throws(() => candidateEntrySource(marked, receipt, hash));
});

test('native text false autoSize is its omitted default; true and text changes remain detectable', () => {
  const equivalent = audit(input => {
    const expected = firstText(input.expected.ui.controls), actual = firstText(input.actual.ui.interface.controls);
    expected.text.autoSize = false; delete actual.text.autoSize;
  });
  assert.equal(equivalent.ok, true);
  for (const change of ['enabled', 'text']) {
    const changed = audit(input => {
      const expected = firstText(input.expected.ui.controls), actual = firstText(input.actual.ui.interface.controls);
      expected.text.autoSize = false;
      if (change === 'enabled') actual.text.autoSize = true;
      else { delete actual.text.autoSize; actual.text.content += ' changed'; }
    });
    assert.equal(changed.ok, false);
    assert.ok(changed.issues.some(issue => issue.code === 'UI_MISMATCH'));
  }
});
function audit(change = () => {}) {
  const input = structuredClone({ ...fixture, sourceSha: fixture.provenance.sourceCommit,
    candidateBefore: fixture.provenance.candidateSha256, candidateAfter: fixture.provenance.candidateSha256, bgm: true });
  change(input); return compareNativeCandidate(input);
}
function firstText(controls) {
  for (const control of controls) {
    if (control.text?.content) return control;
    const found = firstText(control.children ?? []);
    if (found) return found;
  }
}
function firstImage(controls) {
  for (const control of controls) {
    if (control.kind === 'image') return control;
    const found = firstImage(control.children ?? []);
    if (found) return found;
  }
}

test('native default minimum font twenty is omitted without hiding other values or metadata',()=>{
 assert.deepEqual(audit(input=>{
  firstText(input.expected.ui.controls).text.minFontSize=20;
  delete firstText(input.actual.ui.interface.controls).text.minFontSize;
 }).issues,[]);
 for(const value of [0,14,19,21])assert.ok(audit(input=>{
  firstText(input.expected.ui.controls).text.minFontSize=value;
  delete firstText(input.actual.ui.interface.controls).text.minFontSize;
 }).issues.some(x=>x.code==='UI_MISMATCH'));
 assert.ok(audit(input=>{
  input.expected.ui.controls[0].metadata={minFontSize:20};
  input.actual.ui.interface.controls[0].metadata={};
 }).issues.some(x=>x.code==='UI_MISMATCH'));
});
test('native empty child lists are omitted without hiding nonempty children or opaque payloads',()=>{
 assert.deepEqual(audit(input=>{
  const a=firstText(input.expected.ui.controls),b=firstText(input.actual.ui.interface.controls);
  a.children=[];delete b.children;
 }).issues,[]);
 assert.ok(audit(input=>{
  const a=firstText(input.expected.ui.controls),b=firstText(input.actual.ui.interface.controls);
  a.children=[{name:'unexpected',kind:'image',size:[1,1]}];delete b.children;
 }).issues.some(x=>x.code==='UI_MISMATCH'));
 assert.ok(audit(input=>{
  input.expected.ui.controls[0].metadata={children:[]};
  input.actual.ui.interface.controls[0].metadata={};
 }).issues.some(x=>x.code==='UI_MISMATCH'));
});

test('native omitted image ink equals only opaque white, with byte-rounded source alpha', () => {
  for (const opacity of [undefined, 1, 0.999]) {
    assert.deepEqual(audit(input => {
      const expected = firstImage(input.expected.ui.controls), actual = firstImage(input.actual.ui.interface.controls);
      expected.colour = '#FFFFFF'; delete actual.colour; delete actual.opacity;
      if (opacity === undefined) delete expected.opacity;
      else expected.opacity = opacity;
    }).issues, []);
  }
  for (const [colour, opacity] of [['#fffffe', 1], ['#000000', 1], ['#aabbcc', 1], ['#ffffff', 0], ['#ffffff', 0.5], ['#ffffff', 0.99]]) {
    const report = audit(input => {
      const expected = firstImage(input.expected.ui.controls), actual = firstImage(input.actual.ui.interface.controls);
      expected.colour = colour; expected.opacity = opacity; delete actual.colour;
      if (opacity === 1) delete actual.opacity;
      else actual.opacity = Math.round(opacity * 255) / 255;
    });
    assert.ok(report.issues.some(issue => issue.code === 'UI_MISMATCH'), `${colour}/${opacity}`);
  }
  for (const kind of ['container', 'cursorArea', 'presetButton', 'grid']) {
    const report = audit(input => {
      const expected = firstImage(input.expected.ui.controls), actual = firstImage(input.actual.ui.interface.controls);
      expected.kind = actual.kind = kind;
      expected.colour = '#ffffff'; delete actual.colour; delete expected.opacity; delete actual.opacity;
    });
    assert.ok(report.issues.some(issue => issue.code === 'UI_MISMATCH'), kind);
  }
  assert.ok(audit(input => {
    const expected = firstImage(input.expected.ui.controls), actual = firstImage(input.actual.ui.interface.controls);
    expected.metadata = {colour: '#ffffff'}; actual.metadata = {};
  }).issues.some(issue => issue.code === 'UI_MISMATCH'));
});
test('interface identity, visibility and every root input flag must match source defaults', () => {
  for (const change of [
    input => { input.actual.ui.interface.hidden = true; },
    input => { input.actual.ui.interface.name = 'WrongUi'; },
    ...['showCursor', 'blockKeys', 'blockCursor'].map(flag => input => { delete input.actual.ui.interface[flag]; }),
    input => { input.actual.ui.interface.isolateNavigation = true; },
    input => { input.actual.ui.interface.extraInputSetting = true; },
  ]) {
    const report = audit(change);
    assert.ok(report.issues.some(issue => issue.code === 'INTERFACE_MISMATCH'), JSON.stringify(report.issues));
  }
  assert.deepEqual(audit(input => {
    input.actual.ui.interface.hidden = false;
    input.actual.ui.interface.isolateNavigation = false;
  }).issues, [], 'explicit false equals the native omitted default');
});
test('hex colour spelling is tolerated only in colour fields, never text or control/interface names', () => {
  for (const change of [
    input => { firstText(input.expected.ui.controls).text.content = '#AABBCC'; firstText(input.actual.ui.interface.controls).text.content = '#aabbcc'; },
    input => { input.expected.ui.controls[0].name = '#AABBCC'; input.actual.ui.interface.controls[0].name = '#aabbcc'; },
    input => { input.expected.ui.name = '#AABBCC'; input.actual.ui.interface.name = '#aabbcc'; },
    input => {
      input.expected.ui.controls[1].children.find(control => control.kind === 'grid').itemTemplate = '#AABBCC';
      input.actual.ui.interface.controls[1].children.find(control => control.kind === 'grid').itemTemplate = '#aabbcc';
    },
    input => {
      input.expected.ui.script = { name: 'abyss_ui', values: { colour: '#AABBCC' } };
      input.actual.ui.interface.scripts = [{ name: 'abyss_ui', values: { colour: '#aabbcc' } }];
    },
  ]) assert.ok(audit(change).issues.length);
  assert.deepEqual(audit(input => {
    input.expected.ui.controls[0].colour = '#AABBCC'; input.actual.ui.interface.controls[0].colour = '#aabbcc';
  }).issues, []);
});
test('real readback slice matches fixed source, CRLF and implicit platform defaults', () => {
  const report = audit();
  assert.deepEqual(report.issues, []);
  assert.equal(report.modules[0].sourceTextIdentical, true);
  assert.notEqual(report.modules[0].actualSha256, report.modules[0].expectedSha256);
  assert.equal(report.ui.actualCount, report.ui.expectedCount);
  assert.equal(report.playtest, 'NOT_TESTED');
  assert.deepEqual(audit(input => { input.actual.scripts.scripts[0].source = '\uFEFF' + input.actual.scripts.scripts[0].source; }).issues, []);
});

test('native omitted opaque white text matches explicit white, while other missing colours fail', () => {
  assert.deepEqual(audit(input => {
    firstText(input.expected.ui.controls).text.colour = '#FFFFFF';
    delete firstText(input.actual.ui.interface.controls).text.colour;
  }).issues, []);
  for (const colour of ['#ECE6DA', '#000000', '#fffffe']) {
    const report = audit(input => {
      firstText(input.expected.ui.controls).text.colour = colour;
      delete firstText(input.actual.ui.interface.controls).text.colour;
    });
    assert.ok(report.issues.some(issue => issue.code === 'UI_MISMATCH'));
  }
  assert.ok(audit(input => {
    firstText(input.expected.ui.controls).text.colour = '#FFFFFF';
    delete firstText(input.actual.ui.interface.controls).text.colour;
    firstText(input.actual.ui.interface.controls).text.opacity = 0.8;
  }).issues.some(issue => issue.code === 'UI_MISMATCH'));
});
test('bad module, missing/extra module and wrong UI geometry cannot pass a static-clean candidate', () => {
  for (const change of [
    input => { input.actual.scripts.scripts[0].source += '\nreturn false'; },
    input => { input.actual.scripts.scripts = []; },
    input => { input.actual.scripts.scripts.push({ ...input.actual.scripts.scripts[0], name: 'stale_fixture' }); },
    input => { input.actual.ui.interface.controls[0].size[0] += 1; },
    input => { input.actual.ui.interface.controls.reverse(); },
    input => { input.actual.template.template.children[0].kind = 'image'; },
  ]) assert.ok(audit(change).issues.length);
});
test('candidate hash changes, static faults and unmounted or wrong-signal graphs fail', () => {
  for (const change of [
    input => { input.candidateAfter = '0'.repeat(64); },
    input => { input.actual.checked.errors = 1; input.actual.checked.ok = false; },
    input => { input.actual.inspected.entities[0].graphMounts[0].enabled = 0; },
    input => { input.actual.inspected.entities[0].templateId = 1000000; },
    input => { input.actual.inspected.graphs[0].signalReferences[0].name = 'WRONG_SIGNAL'; },
  ]) assert.ok(audit(change).issues.length);
});
test('BGM requires both real native parameter records true and explicit BGM opt-in', () => {
  assert.ok(audit(input => { input.actual.parameters.records[0].value = false; }).issues.length);
  assert.ok(audit(input => { input.actual.parameters.records.pop(); }).issues.length);
  assert.ok(audit(input => { input.bgm = false; }).issues.length);
});
test('ordinary source that declares BGM disabled requires two correctly typed false records', () => {
  const ordinary = change => audit(input => {
    input.bgm = false;
    input.expected.uiBgmParameter = { name: 'nativeBgmEnabled', type: 'boolean', value: false };
    input.expected.graphs = input.expected.graphs.filter(graph => graph.name !== '_GSTS_ABYSS_BGM');
    input.actual.inspected.graphs = input.actual.inspected.graphs.filter(graph => graph.name !== '_GSTS_ABYSS_BGM');
    for (const parameter of input.actual.parameters.records) parameter.value = false;
    change?.(input);
  });
  assert.deepEqual(ordinary().issues, []);
  for (const change of [
    input => { input.actual.parameters.records = []; },
    input => { input.actual.parameters.records.pop(); },
    input => { input.actual.parameters.records[0].type = 1; },
    input => { input.actual.parameters.records[0].code = 1; },
    input => { input.actual.parameters.records[0].section = 8; },
    input => { input.actual.parameters.records[0].value = true; },
  ]) assert.ok(ordinary(change).issues.some(issue => issue.code === 'BGM_PARAMETER'));
  assert.deepEqual(ordinary(input => { delete input.expected.uiBgmParameter; input.actual.parameters.records = []; }).issues, [], 'older source without parameter remains auditable');
});
test('source SHA is mandatory, complete and hexadecimal; unrelated label is never accepted', () => {
  assert.equal(requireSourceSha(fixture.provenance.sourceCommit), fixture.provenance.sourceCommit);
  for (const sha of [undefined, '', 'cf6969e', 'HEAD', 'x'.repeat(40), '--help']) assert.throws(() => requireSourceSha(sha));
});

test('native image and text alpha use exact ARGB byte encoding, including opaque defaults', () => {
  for (const opacity of [0, 0.001, 0.16, 0.32, 0.45, 0.5, 0.55, 0.85, 0.96, 0.999, 1]) {
    const decoded = Math.round(opacity * 255) / 255;
    assert.deepEqual(audit(input => {
      input.expected.ui.controls[0].opacity = opacity;
      input.actual.ui.interface.controls[0].opacity = decoded;
      const source = firstText(input.expected.ui.controls).text;
      const actual = firstText(input.actual.ui.interface.controls).text;
      source.background = actual.background = '#000000';
      source.outlineColour = actual.outlineColour = '#000000';
      for (const field of ['opacity', 'backgroundOpacity', 'outlineOpacity']) {
        source[field] = opacity; actual[field] = decoded;
      }
      if (decoded === 1) {
        delete input.actual.ui.interface.controls[0].opacity;
        delete actual.opacity;
      }
    }).issues, [], `alpha ${opacity}`);
  }
});

test('alpha encoding cannot hide wrong bytes, invalid readback or unrelated float changes', () => {
  for (const change of [
    input => { input.expected.ui.controls[0].opacity = 0.5; input.actual.ui.interface.controls[0].opacity = 127 / 255; },
    input => { input.expected.ui.controls[0].opacity = 0.5; input.actual.ui.interface.controls[0].opacity = 0.5; },
    input => { input.expected.ui.controls[0].opacity = 1; input.actual.ui.interface.controls[0].opacity = 0.999; },
    ...[-0.1, 1.1, NaN, Infinity].map(value => input => { input.expected.ui.controls[0].opacity = 0.5; input.actual.ui.interface.controls[0].opacity = value; }),
    ...['opacity', 'backgroundOpacity', 'outlineOpacity'].map(field => input => {
      firstText(input.expected.ui.controls).text.background = firstText(input.actual.ui.interface.controls).text.background = '#000000';
      firstText(input.expected.ui.controls).text.outlineColour = firstText(input.actual.ui.interface.controls).text.outlineColour = '#000000';
      firstText(input.expected.ui.controls).text[field] = 0.5;
      firstText(input.actual.ui.interface.controls).text[field] = 127 / 255;
    }),
    input => { firstText(input.expected.ui.controls).text.fontSize = 0.5; firstText(input.actual.ui.interface.controls).text.fontSize = 128 / 255; },
    input => {
      input.expected.ui.controls[0].unknown = { opacity: 0.5 };
      input.actual.ui.interface.controls[0].unknown = { opacity: 128 / 255 };
    },
    input => {
      input.expected.ui.script = { name: 'abyss_ui', values: { opacity: 0.5 } };
      input.actual.ui.interface.scripts = [{ name: 'abyss_ui', values: { opacity: 128 / 255 } }];
    },
  ]) assert.ok(audit(change).issues.length);
});
