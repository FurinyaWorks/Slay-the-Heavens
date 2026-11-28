import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [saveFile, simulatorDist, out, canvasId='pc-16-9', mode='candidate'] = process.argv.slice(2);
const shopOnly=process.argv.includes('--shop-only');
assert(saveFile && simulatorDist && out && ['baseline','candidate'].includes(mode), 'Usage: replay.mjs <generated save> <Simulator 0.5.2 dist> <output dir> [canvasId] [baseline|candidate]');
mkdirSync(out, {recursive:true});
const hash = data => createHash('sha256').update(data).digest('hex');
const workerPath = join(simulatorDist, 'worker.js');
const rasterPath = join(simulatorDist, 'index.js');
const worker = readFileSync(workerPath, 'utf8');
const raster = readFileSync(rasterPath, 'utf8');
const version = JSON.parse(readFileSync(join(simulatorDist,'..','package.json'))).version;
assert.equal(version,'0.5.2');
const sdkTail = 'var W=null,Oa=!1';
const rpcTail = 'var Bi="";process.stdin.setEncoding';
assert(worker.includes(sdkTail) && raster.includes(rpcTail), 'Unexpected Simulator 0.5.2 bundle');
// Export the installed instrumented SDK and its actual screenshot renderer without
// changing implementation. The original worker and MCP entry remain intact.
async function sdkExports(name, source) {
    const temporary = join(simulatorDist, 'sts-replay-'+process.pid+'-'+name+'.mjs');
    try {
        writeFileSync(temporary, source, {flag:'wx'});
        return await import(pathToFileURL(temporary));
    } finally {
        rmSync(temporary, {force:true});
    }
}
const {Gr,dn,vi,wi,pa,Me,d,ya} = await sdkExports('runtime',worker.split(sdkTail)[0]+'export {Gr,dn,vi,wi,pa,Me,d,ya};\n');
const {renderScene,ImageAssets} = await sdkExports('raster',raster.split(rpcTail)[0]+'export {vc as renderScene,Mr as ImageAssets};\n');
const saveBytes = readFileSync(saveFile);
const save = JSON.parse(saveBytes);
const png = new ImageAssets({cacheDir:resolve(out,'..','sprite-cache')});
let rotations = 0;
function normalizeRotation(node) {
    // map-game.mjs exports its numeric Z convention for both scalar and newer XYZ sources.
    for (const transform of Object.values(node.transformByPlatform ?? {})) {
        if (Array.isArray(transform.rotation.z)) {
            const [x,y,z] = transform.rotation.z;
            transform.rotation={x,y,z};
            rotations++;
        }
    }
    for (const child of node.children ?? []) normalizeRotation(child);
}
normalizeRotation(save.assets.server.root);
normalizeRotation(save.assets.client.root);
const mobile = canvasId.startsWith('mobile-');
const session = Gr(save.assets.server, {templatesProject:save.assets.client,scripts:save.assets.scripts,
    serverConfig:save.serverLogic, canvasId, language:'LanguageChs'});
const {runtime} = session;
const mainScript=save.assets.scripts.find(script=>script.path==='abyss_theme.lua');
assert(mainScript?.source.includes('official-assets-first')&&mainScript.source.includes('sts1-pc-anger-common-attack-v1'),
    'Only the official release card profile is supported by this replay');
const snapshots=[];
const report={mode,canvasId,productionProfile:'official-assets-battle-v3',saveSha256:hash(saveBytes),workerSha256:hash(worker),rendererSha256:hash(raster),
    sdk:'beyond-simulator-mcp@0.5.2',rotationTransformsNormalized:rotations,checks:[],screenshots:[],timings:[],pointerTargets:[]};
const enc = value => new TextEncoder().encode(value);
const mounted = runtime.mountedScripts.find(script => /abyss_ui(?:\.lua)?$/.test(script.path));
assert(mounted,'GameUI script is not mounted');
const env = mounted.env;
const stack = d.lua_gettop(env);
d.lua_getglobal(env,enc('OnUpdate'));
let exposed = false;
for(let index=1;index<40;index++) {
    const key = d.lua_getupvalue(env,-1,index);
    if (!key) break;
    if (Buffer.from(key).toString()==='view') {
        d.lua_setglobal(env,enc('__GAME'));exposed=true;break;
    }
    d.lua_pop(env,1);
}
d.lua_settop(env,stack);
assert(exposed,'production GameUI upvalue missing');
function lua(source) { runtime.runChunk(env, source, 'STS_DETAIL_REPLAY'); }
function clean() {
    const issues=runtime.logs.filter(log=>log.level==='lua-error' || /ABYSS_UI failed|prepare_failed|command_failed/.test(log.text));
    assert.deepEqual(issues, []);
}
function step(seconds=1/60, frames=1) {
    for (let n=0;n<frames;n++) dn(session,seconds);
    clean();
}
function controls() {
    const found = [];
    function visit(node,path='') {
        const key=path+'/'+node.name;
        found.push({key,node});
        for (const child of node.children) visit(child,key);
    }
    for (const root of runtime.roots) visit(root);
    return found;
}
function control(path, predicate=()=>true) {
    const matches = controls().filter(({key,node})=>key.endsWith('/'+path)&&predicate(node));
    assert.equal(matches.length,1,path+' available paths: '+controls().filter(({key})=>key.includes(path.split('/')[0])).slice(0,20).map(({key})=>key).join(', '));
    return matches[0].node;
}
function geometry(node) {
    const boxes=wi(session), box=boxes.get(node.Id), matrix=pa(session,boxes).get(node.Id);
    assert(box&&matrix,node.name);
    const corners=[[box.left,box.bottom],[box.right,box.bottom],[box.right,box.top],[box.left,box.top]].map(([x,y])=>Me(matrix,x,y));
    return { ...Me(matrix,box.centerX,box.centerY),left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),
        bottom:Math.min(...corners.map(p=>p.y)),top:Math.max(...corners.map(p=>p.y)) };
}
function pointer(action, point) {
    const target=vi(session,action,point.x,point.y);
    const owner=target??session.pointerDownControl??session.pointerHoverControl;
    const path=[];
    for(let node=owner;node;node=node.parent) path.unshift(node.name);
    report.pointerTargets.push({action,x:point.x,y:point.y,path:path.join('/')});
    return target;
}
function hit(path, predicate) {
    return geometry(control(path+'/hit',predicate));
}
function tap(point) {
    pointer('move',point);
    const target=pointer('down',point);
    step();pointer('up',point);step();
    return target;
}
function visible(node) {
    for (let current=node;current;current=current.parent) if (!current.visible || current.active===false) return false;
    return true;
}
function wait(predicate, label) {
    for(let frame=0;frame<150;frame++) {
        if (predicate()) return;
        step();
    }
    assert.fail('Unready: '+label);
}
function ready() { wait(()=>!visible(control('pageReveal/blocker')),'page transition'); }
function frame(name) {
    const state = ya(session,{view:true});
    const texts = state.scene.nodes.filter(n=>n.kind==='textbox'&&n.text).map(n=>({name:n.name,text:n.text,
        color:n.fontColor,x:n.centerX,y:n.centerY,width:n.width,height:n.height}));
    snapshots.push({name,state});
    writeFileSync(join(out,name+'.text.json'),JSON.stringify(texts,null,2)+'\n');
    return texts;
}
const plain = text => text.replace(/<[^>]*>/g,'');
function hasText(texts, pattern) { return texts.some(row=>pattern.test(plain(row.text))); }
function check(label, condition) {
    report.checks.push({label,passed:!!condition});
    if (mode==='candidate') assert(condition,label);
}
function tooltip(path) {
    return controls().find(({key,node})=>key.endsWith('/'+path)&&visible(node))?.node;
}
function staysOnCanvas(name, path, buttonPaths=[]) {
    const panel=tooltip(path);
    if (!panel) return false;
    const area=geometry(panel);
    const viewport={width:runtime.canvasWidth,height:runtime.canvasHeight};
    const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top>b.bottom&&a.bottom<b.top;
    const buttons=buttonPaths.map(buttonPath=>hit(buttonPath));
    report.geometry??=[];
    report.geometry.push({name,area,viewport,buttons});
    return area.left>=-.01&&area.right<=viewport.width+.01&&area.bottom>=-.01&&area.top<=viewport.height+.01
        && buttons.every(button=>!intersects(area,button));
}
function frameWithKeywords(name) {
    frame(name);
    return plain(tooltip('cardKeywordTip/copy')?.text??'');
}
function renderedCopy(frameName,path) {
    const box=tooltip(path);
    if (!box) return false;
    const snapshot=snapshots.find(({name})=>name===frameName);
    const projection=snapshot?.state.scene.nodes.find(node=>String(node.id)===String(box.Id));
    const layout=projection?.textLayout;
    assert(layout&&layout.lines,'Missing actual SDK font layout for '+path);
    report.textVisibility??=[];
    report.textVisibility.push({frame:frameName,path,fontSize:layout.fontSize,availableHeight:projection.sourceHeight,
        requiredHeight:layout.requiredHeight,expectedLines:layout.lines.length,visibleLines:layout.visibleLineCount,
        lines:layout.lines});
    return layout.visibleLineCount===layout.lines.length;
}
function openChoice(id, hasIntro=true, gold=120) {
    lua(`__STAGE('event','${id}',${id==='nest'||id==='nloth'?2:1},${gold})`);
    ready();
    wait(()=>visible(control('nodePanel/eventView')),'event '+id);
    if (hasIntro) {tap(hit('eventView/option1'));ready();}
}
function assertCore() { lua('local mismatch=__MISMATCH(__BEFORE,__CORE(),"state");assert(not mismatch,"preview changed "..tostring(mismatch))'); }
function leavePointer() { pointer('move',{x:-100,y:-100}); }
async function pngFrames() {
    for (const {name,state} of snapshots) {
        const assets=await png.prepare(state.scene.nodes);
        const image=renderScene(state.scene,state.canvasWidth,state.canvasHeight,assets);
        writeFileSync(join(out,name+'.png'),image.data);
        report.screenshots.push({name,width:image.pixelWidth,height:image.pixelHeight,sha256:hash(image.data),
            assetWarnings:assets.warnings,sceneNodes:state.scene.nodes.length});
    }
}
try {
    lua(`
local Run=require('abyss_run')
local Map=require('abyss_map')
local Nodes=require('abyss_nodes')
local Copy=require('abyss_combat').copy
function __MISMATCH(a,b,path)
 if a==b then return end
 if type(a)~='table' or type(b)~='table' then return path..': '..tostring(a)..' to '..tostring(b) end
 for key,value in pairs(a) do
  local mismatch=__MISMATCH(value,b[key],path..'.'..tostring(key))
  if mismatch then return mismatch end
 end
 for key in pairs(b) do if a[key]==nil then return path..'.'..tostring(key)..' added' end end
end
function __CORE()
 local run=__GAME.run
 local state=Copy(run,{[run.data]=run.data})
 state.elapsedSeconds=nil
 return {run=state,map=Map.snapshot(__GAME.map)}
end
local function fixture(kind,id,act,gold,cardId,seed)
 local host=__GAME
 local run=Run.new(host.data,tostring(seed),{experimental=true,campaign=true,character='ironclad'})
 local map=Map.generate(run.data,seed,act)
 run.act,run.gold,run.hp=act,gold,41
 if id=='nloth' then
  assert(Run.obtainRelic(run,'anchor'));assert(Run.obtainRelic(run,'vajra'));assert(Run.obtainRelic(run,'old_coin'))
 end
 if cardId then
  run.deck={};assert(Run.obtainCard(run,cardId))
 end
 local room=assert(Map.available(map)[1])
 for _,node in ipairs(map.nodes) do
  if node.id==room.id then node.type,node.eventId=kind,id;break end
 end
 assert(Nodes.enter(run,map,room.id))
 return run,map
end
local function edgeCard(run,presentation)
 local offer=run.nodeFlow.cards[5]
 if not offer or offer.unavailable then return end
 local C=require('abyss_combat')
 local D=require('abyss_card_display')
 for _,def in ipairs(run.data.cards.cards) do
  if def.id==offer.id then
   local instance={cardId=offer.id,upgraded=offer.upgraded,upgrades=offer.upgrades}
   local effective=C.cardDefinition({catalog={cards={[def.id]=def}}},instance)
   local text=D.permanentText(presentation[def.id] or {},effective,instance)
   return require('abyss_card_keywords').runTips(run,effective,instance.upgraded,text) and def.id
  end
 end
end
function __STAGE(kind,id,act,gold,cardId)
 local host=__GAME
 local run,map,presentation,edge
 for seed=42,66 do
  run,map=fixture(kind,id,act,gold,cardId,seed)
  presentation=require('abyss_character_presentation').prepare(require('abyss_presentation'),run.data)
  if kind~='shop' then break end
  edge=edgeCard(run,presentation)
  if edge then print('EDGE_SHOP run seed='..seed..' slot=5 card='..edge); break end
 end
 assert(kind~='shop' or edge,'fixture could not find a naturally offered right-edge keyword card')
 host.nodeUI:setVisible(false)
 host.battleUI:setData(run.data,presentation);host.nodeUI.presentation=presentation;host.deckUI:setPresentation(presentation)
 host.run,host.map=run,map;host.mapUI.map=map;host.nodeUI.run,host.nodeUI.map=run,map;host.battleUI.run=run
 host.routeOpen=false;host.characterOpen=false;host:refresh()
 assert(host.mode=='node' and run.phase=='node')
 if id then assert(run.nodeFlow.event.id==id,run.nodeFlow.event.id) end
end
`);
    step(undefined,30);
    if (!shopOnly) {
        openChoice('nest');
        lua('assert(__GAME.run.nodeFlow.event.stage=="choice", __GAME.run.nodeFlow.event.stage.." "..tostring(__GAME.nodeUI.notice));__BEFORE=__CORE()');
        const dagger=hit('eventView/option2');
        const edge={x:dagger.right-8,y:dagger.y};
        const idle=frame('nest-idle');
        const labels=idle.filter(row=>/仪式匕首/.test(row.text));
        check('Nest option shows the card name once',labels.reduce((sum,row)=>sum+(row.text.match(/仪式匕首/g)||[]).length,0)===1);
        report.eventCopy=idle.filter(row=>row.name==='title').map(({text,color})=>({text,color}));
        const gain = report.eventCopy.find(row=>row.text.includes('获得99金币'));
        const cost = report.eventCopy.find(row=>row.text.includes('6点普通伤害'));
        check('Nest reward and health cost use the authored semantic colors',
            /<color=#9DD740>获得99金币/.test(gain?.text??'')&&/<color=#D77C7E>受到6点普通伤害/.test(cost?.text??''));
        if(mobile) {
            pointer('move',edge);pointer('down',edge);step(.12);
            pointer('cancel',edge);step(.25);
            check('Nest cancelled touch opens no card',!hasText(frame('nest-cancelled'),/伤害.*15|15.*伤害/));
            pointer('down',dagger);step(.349);
            check('Nest mobile hold stays closed before 0.35 seconds',!tooltip('eventView/previewCard'));
            step(.002);
            const held=frame('nest-long-press');
            check('Nest mobile long press opens real card copy',hasText(held,/伤害.*15|15.*伤害/));
            check('Nest mobile card preview fits in viewport',staysOnCanvas('nest-mobile','eventView/previewCard'));
            check('Nest mobile card renders every line of copy',renderedCopy('nest-long-press','eventView/previewCard/description'));
            pointer('up',dagger);step();
            frame('nest-released');
            check('Nest release retains preview',!!tooltip('eventView/previewCard'));
            assertCore();
            leavePointer();step();
            frame('nest-left');
            check('Nest preview closes after leaving the target',!tooltip('eventView/previewCard'));
            pointer('move',dagger);pointer('down',dagger);step(.351);pointer('up',dagger);step();
            check('Nest can reopen after dismissal',!!tooltip('eventView/previewCard'));
            assertCore();
            tap(hit('eventView/option1'));ready();
            lua('assert(__GAME.run.nodeFlow.event.choice=="gold" and __GAME.run.gold==219)');
            check('Next intentional tap commits once and removes preview',!tooltip('eventView/previewCard'));
        } else {
            pointer('move',edge);
            const hover=frame('nest-hover');
            check('Nest card appears in the same input frame at the far edge',hasText(hover,/伤害.*15|15.*伤害/));
            check('Nest desktop card preview fits in viewport',staysOnCanvas('nest-pc','eventView/previewCard'));
            check('Nest desktop card renders every line of copy',renderedCopy('nest-hover','eventView/previewCard/description'));
            report.timings.push({scenario:'nest-hover',...idleMetrics(false)});
            pointer('move',hit('eventView/option1'));step();
            check('Switch to plain Nest alternative closes card',!hasText(frame('nest-switch'),/伤害.*15|15.*伤害/));
            assertCore();
            const baselineControls=runtime.controlsById.size;
            for(let count=0;count<24;count++) {
                pointer('move',edge);
                pointer('move',hit('eventView/option1'));
                step();
            }
            check('24 rapid event preview switches do not accumulate controls',runtime.controlsById.size===baselineControls);
            assertCore();
        }
        report.timings.push({scenario:'nest-idle',...idleMetrics()});
        if(!mobile) {
            openChoice('golden_idol',false);
            lua('__BEFORE=__CORE()');
            pointer('move',hit('eventView/option1'));
            const idol=frame('golden-idol-relic');
            check('Golden Idol real relic description opens immediately',!!tooltip('eventView/previewRelic')&&hasText(idol,/非宝箱的金币奖励额外增加25%/));
            assertCore();tap(hit('eventView/option1'));ready();leavePointer();step();
            lua('assert(__GAME.run.nodeFlow.event.stage=="trap");__BEFORE=__CORE()');
            for (const i of [1,2,3,4]) {
                const targets=controls().filter(({key,node})=>key.endsWith('/eventView/option'+i+'/hit')&&visible(node));
                if(targets.length) {
                    pointer('move',geometry(targets[0].node));
                    step();frame('golden-idol-option-'+i);
                    check(i===1?'Golden Idol curse face preview':'Golden Idol plain cost option remains closed',
                        !!tooltip('eventView/previewCard')===(i===1));
                }
            }
            assertCore();leavePointer();step();
            openChoice('nloth',false);
            lua('__BEFORE=__CORE()');
            for (const i of [1,2]) {
                const targets=controls().filter(({key,node})=>key.endsWith('/eventView/option'+i+'/hit')&&visible(node));
                if(targets.length) {
                    pointer('move',geometry(targets[0].node));
                    const relic=frame('nloth-option-'+i);
                    check("N'loth option "+i+' displays the gift relic',!!tooltip('eventView/previewRelic')&&hasText(relic,/恩洛斯的礼物/));
                }
            }
            assertCore();leavePointer();step();
            openChoice('cleric',false,35);
            const cleric=frame('cleric-disabled');
            lua('assert(not __GAME.nodeUI.actions["eventView/option2"].enabled);__BEFORE=__CORE()');
            report.disabledCopy=cleric.filter(row=>row.name==='title').map(({text,color})=>({text,color}));
            const disabled=report.disabledCopy.find(row=>row.text.includes('金币不足'));
            const enabled=report.disabledCopy.find(row=>row.text.includes('[治疗]'));
            check('Disabled option has disabled ink and no inline reward/cost color',
                disabled&&enabled&&disabled.color!==enabled.color&&!disabled.text.includes('<color'));
            tap(hit('eventView/option2'));ready();assertCore();
            check('Disabled Cleric option remains inert and shows no preview',!tooltip('eventView/previewCard')&&!tooltip('eventView/previewRelic'));
        }
        forge('apparition');
        const before=hit('pickerView/before'), after=hit('pickerView/after');
        lua('__BEFORE=__CORE()');
        frame('forge-pair');
        check('Upgrade comparison uses the official shared card chrome',
            tooltip('pickerView/before/stsReferenceChrome')&&tooltip('pickerView/after/stsReferenceChrome'));
        if(mobile) {
            pointer('move',before);pointer('down',before);step(.12);
            pointer('cancel',before);step(.25);
            frame('forge-cancelled');
            check('Forge cancelled touch opens no keyword overlay',!tooltip('deckPanel/details'));
            for (const [point,name,ethereal] of [[before,'before',true],[after,'after',false]]) {
                pointer('move',point);pointer('down',point);step(.349);
                check('Forge '+name+' long press waits through 0.349 seconds',!tooltip('deckPanel/details'));
                step(.002);ready();
                frame('forge-'+name+'-long-press');
                const text=plain(tooltip('deckPanel/details')?.text??'');
                check('Forge '+name+' mobile modal shows effective keywords',
                    text.includes('消耗')&&text.includes('无实体')&&text.includes('虚无')===ethereal);
                check('Forge '+name+' mobile renders every detail line',
                    renderedCopy('forge-'+name+'-long-press','deckPanel/details'));
                pointer('up',point);step();
                frame('forge-'+name+'-released');
                check('Forge '+name+' release retains the modal',!!tooltip('deckPanel/details'));
                assertCore();
                const close=tooltip('deckPanel/close/hit');
                if (close) {tap(geometry(close));ready();}
                frame('forge-'+name+'-return');
                check('Existing return closes Forge '+name+' modal',!tooltip('deckPanel/details'));
                assertCore();
            }
        } else {
            pointer('move',before);
            step(.2);
            const waiting=frameWithKeywords('forge-before-under-threshold');
            step(.001);
            const base=frameWithKeywords('forge-before-hover');
            check('Before tooltip opens only after 0.2 seconds',!waiting&&!!base);
            check('Before tooltip contains Ethereal, Exhaust and Intangible',base.includes('虚无')&&base.includes('消耗')&&base.includes('无实体'));
            check('Before tooltip fits without covering footer',staysOnCanvas('forge-before','nodePanel/cardKeywordTip',['nodePanel/back','nodePanel/confirm']));
            check('Before tooltip renders all description lines',renderedCopy('forge-before-hover','cardKeywordTip/copy'));
            pointer('move',after);
            check('Switch drops old keywords while new timer runs',!tooltip('cardKeywordTip/copy'));
            step(.205);
            const plus=frameWithKeywords('forge-after-hover');
            check('Upgraded tooltip has Exhaust and Intangible only',!plus.includes('虚无')&&plus.includes('消耗')&&plus.includes('无实体'));
            check('After tooltip fits without covering footer',staysOnCanvas('forge-after','nodePanel/cardKeywordTip',['nodePanel/back','nodePanel/confirm']));
            check('After tooltip renders all description lines',renderedCopy('forge-after-hover','cardKeywordTip/copy'));
            report.timings.push({scenario:'forge-hover',...idleMetrics(false)});
            leavePointer();step();
            const left=frameWithKeywords('forge-left');
            check('Leaving a forge face dismisses its tooltip',!left);
            assertCore();
            const baselineControls=runtime.controlsById.size;
            for(let count=0;count<12;count++) {
                pointer('move',before);step(.201);
                pointer('move',after);step(.201);
                leavePointer();step();
            }
            check('24 rapid Forge tooltip switches do not accumulate controls',runtime.controlsById.size===baselineControls);
            assertCore();
            const back=hit('nodePanel/back');
            pointer('move',before);step(.205);
            const cancelTarget=tap(back);
            ready();
            frame('forge-back');
            check('Cancel has its own hit target while a tooltip is open',cancelTarget?.parent?.name==='back');
            check('Cancel returns to the card selection and drops the tooltip',
                cancelTarget?.parent?.name==='back'&&!tooltip('pickerView/before')&&!tooltip('cardKeywordTip/copy'));
            if (cancelTarget?.parent?.name==='back') assertCore();
            forge('apparition');
            pointer('move',hit('pickerView/after'));step(.205);
            const confirm=hit('nodePanel/confirm');
            const confirmTarget=tap(confirm);
            check('Confirm has its own hit target while a tooltip is open',confirmTarget?.parent?.name==='confirm');
            step(undefined,120);ready();
            lua('assert(__GAME.run.deck[1].upgraded)');
            check('Confirm still commits the displayed upgrade',!tooltip('cardKeywordTip/copy'));
            forge('strike');
            frame('forge-strike-idle');
            check('Plain card uses the official shared card chrome',tooltip('pickerView/before/stsReferenceChrome'));
            pointer('move',hit('pickerView/before'));step(.21);
            check('Card without keywords has no tooltip',!hasText(frame('forge-no-keywords'),/虚无|无实体|消耗/));
        }
        report.timings.push({scenario:'forge-idle',...idleMetrics()});
    }
    if (!mobile && mode==='candidate') {
        lua("__STAGE('shop',nil,1,120)");
        ready();
        tap(hit('merchant/talk'));ready();
        wait(()=>tooltip('shopView/goods/card5/hit')||tooltip('shopView/card5/hit'),'merchant right-edge card');
        step(undefined,32);
        lua('__BEFORE=__CORE()');
        const shopCard=tooltip('shopView/goods/card5/hit')||tooltip('shopView/card5/hit');
        const point=geometry(shopCard);
        pointer('move',point);step(.201);
        frame('shop-edge-hover');
        const tip=tooltip('cardKeywordTip/copy');
        const expandsLeft=tip&&geometry(tip).x<point.x;
        const expectedLeft=point.x>runtime.canvasWidth*.75;
        report.shopEdge={cardCenter:point.x,width:runtime.canvasWidth,expectedLeft,expandsLeft};
        check('Shop keyword panel follows the real 75% canvas threshold',tip && expandsLeft===expectedLeft);
        check('Right-edge Shop tooltip remains within the real viewport',staysOnCanvas('shop-edge','nodePanel/cardKeywordTip'));
        check('Right-edge Shop tooltip renders all description lines',renderedCopy('shop-edge-hover','cardKeywordTip/copy'));
        leavePointer();step();assertCore();
    }
    report.status=mode==='baseline'?'baseline-recorded':'passed';
} catch(error) {
    report.status='failed';
    report.error=error.stack;
    console.error(error.stack);
    process.exitCode=1;
} finally {
    report.inputTrace=session.history.events;
    report.logs=runtime.logs;
    report.controlsBeforeDestroy=runtime.controlsById.size;
    for (const root of [...runtime.roots]) runtime.destroyControl(root);
    report.controlsAfterDestroy=runtime.controlsById.size;
    for(const instance of session.runtimes) instance.destroy();
    try {
        assert.equal(report.controlsAfterDestroy,0,'SDK controls remain live after teardown');
        await pngFrames();
        assert(report.screenshots.length>0,'Simulator produced no images');
        assert(report.screenshots.every(screenshot=>screenshot.assetWarnings.length===0),'Simulator asset warnings');
    } catch(error) {report.renderError=error.stack;process.exitCode=1;}
    writeFileSync(join(out,'replay.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({status:report.status,checks:report.checks,screenshots:report.screenshots.length,renderError:report.renderError}));
}
function forge(id) {
    leavePointer();lua(`__STAGE('camp',nil,1,120,'${id}')`);
    ready();
    wait(()=>visible(control('nodePanel/campView')),'camp');
    tap(hit('campView/forge'));ready();step(undefined,25);
    const grid=controls().filter(({key,node})=>/\/pickerView\/(?:forgeFit|forgeScroll)\/.+\/hit$/.test(key)&&visible(node));
    assert.equal(grid.length,1,'one freshly constructed forge selection '+grid.map(({key})=>key).join(', '));
    tap(geometry(grid[0].node));ready();
    wait(()=>visible(control('pickerView/before')),'upgrade comparison');
}
function idleMetrics(clear=true) {
    if (clear) leavePointer();
    step();
    const before=runtime.controlsById.size;
    let revision=ya(session,{view:true}).scene.revision;
    const samples=[];let changedNodes=0;
    for(let index=0;index<120;index++) {
        const start=performance.now();
        step();
        const state=ya(session,{view:true,sceneRev:revision});
        samples.push(performance.now()-start);
        changedNodes+=(state.scene.changed??state.scene.nodes).length;
        revision=state.scene.revision;
    }
    const after=runtime.controlsById.size;
    check('Idle frames preserve native control count', before===after);
    check('Idle frames do not repaint controls', changedNodes===0);
    samples.sort((a,b)=>a-b);
    return {frames:samples.length,controlsBefore:before,controlsAfter:after,changedNodes,p50Ms:samples[59],p95Ms:samples[113]};
}
