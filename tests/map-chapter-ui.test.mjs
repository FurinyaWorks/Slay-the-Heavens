import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLuaData } from '../scripts/build-lua-data.mjs';
import { buildUI } from '../scripts/build-ui.mjs';
import { runLua } from '../scripts/test-lua.mjs';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('chapter-local map geometry, real same-table transitions and stale gestures preserve core state', () => {
  buildLuaData();
  buildUI();
  const read=path=>readFileSync(path,'utf8').replaceAll('\r\n','\n');
  const parts=JSON.parse(read('tests/fixtures/map-chapter-partitions.json'));
  const prefix="local sliceFirst,sliceLast=...\nsliceFirst,sliceLast=sliceFirst or 1,sliceLast or 8\nlocal sliceRegistered,sliceExecuted=0,0\n";
  const before="local function test(name, fn) fn(); passed=passed+1; print('PASS '..name) end";
  const after="local function test(name, fn)\n    sliceRegistered=sliceRegistered+1\n    if sliceRegistered<sliceFirst or sliceRegistered>sliceLast then return end\n    fn();sliceExecuted=sliceExecuted+1;passed=passed+1\n    print('PASS '..name)\n    print('MAP_CHAPTER_CASE '..sliceRegistered)\nend";
  const footer="\nassert(sliceRegistered==38,'all thirty-eight original map groups must register')\nassert(sliceExecuted==sliceLast-sliceFirst+1,'every selected map group must execute')\nprint('MAP_CHAPTER_SLICE '..sliceFirst..' '..sliceLast..' '..sliceExecuted)\n";
  assert.equal(parts.base,'54c29a78fcc831f20c15b062c173773158fdf58b');
  assert.equal(parts.originalGitBlob,'895747f9158c6c14e1158bfc8d6372b6da122ffa');
  assert.equal(parts.originalSha256LF,'20cb975546649c960292ef460c50494dbc7cdbd44abda39920d657890ece6d8a');
  assert.equal(parts.entry,'tests/lua/map_chapters.lua');assert.equal(parts.total,38);
  assert.equal(parts.timeoutMilliseconds,30000);
  assert.equal(parts.prefix,prefix);assert.equal(parts.before,before);assert.equal(parts.after,after);assert.equal(parts.footer,footer);
  assert.deepEqual(parts.slices,[
    {path:'tests/lua/map_chapters.lua',first:1,last:8},
    {path:'tests/lua/map_chapters_slice_2.lua',first:9,last:16},
    {path:'tests/lua/map_chapters_slice_3.lua',first:17,last:29},
    {path:'tests/lua/map_chapters_slice_4.lua',first:30,last:38},
  ]);
  // Reverse only the exact registration/selection instrumentation. Every
  // original loop, input matrix, helper and assertion remains byte-identical.
  let original=read(parts.entry);assert(original.startsWith(prefix));assert(original.endsWith(footer));
  // Reverse the reviewed display changes for the historical partition proof.
  // The runtime assertions below still exercise all 38 current groups.
  const mapPresentationChanges=[
    ["local function presentedY(chapter,floor,scroll)\n    local row=math.max(0,floor-chapter.first)\n    local lift=Theme.layout.map.bossFloorLift\n    local extra=floor==chapter.boss and lift or chapter.act==3 and floor==chapter.last and 2*lift or 0\n    return Layout.firstY+row*Theme.layout.map.floorGap+extra-scroll\nend\n",
     ""],
    ["    local hiddenChest=chapter.terminal=='boss_treasure'\n    local maximum=hiddenChest and Layout.bossTreasureMaxScroll\n        or Layout.maxScroll+(chapter.act==3 and 2*Theme.layout.map.bossFloorLift or 0)\n    local focusFloor=hiddenChest and math.min(chapter.boss,map.floor) or map.floor\n    local expected=math.max(0,math.min(maximum,presentedY(chapter,focusFloor,0)-Layout.focusY))\n",
     "    local row=math.max(1,map.floor-chapter.first+1)\n    local expected=math.max(0,math.min(Layout.maxScroll,Layout.firstY+(row-1)*Theme.layout.map.floorGap-Layout.focusY))\n"],
    ["            if node.id==map.currentNodeId then\n                if node.roomKind=='boss_treasure' then assert(not box(i).visible)\n                else assert(box(i).visible and box(i):GetChild('ring').visible) end\n            end\n",
     "            if node.id==map.currentNodeId then assert(box(i).visible and box(i):GetChild('positionToken').visible) end\n"],
    ["    test('canonical Act '..act..' projects visible global floors into chapter geometry',function()\n",
     "    test('canonical Act '..act..' projects every global floor into unchanged chapter geometry',function()\n"],
    ["                local b=box(i)\n                if b.visible then\n",
     "                local b=box(i)\n                local row=node.localFloor or node.floor-chapter.first+1\n                if b.visible then\n"],
    ["                    assert(b.y==presentedY(chapter,node.floor,ui.scroll))\n",
     "                    assert(b.y==Layout.firstY+(row-1)*Theme.layout.map.floorGap-ui.scroll)\n"],
    ["        for _,node in ipairs(map.nodes) do assert((seen[node.id]==true)==(node.roomKind~='boss_treasure'),node.id) end\n",
     "        for _,node in ipairs(map.nodes) do assert(seen[node.id],node.id..' never enters viewport') end\n"],
    ["                    assert(box('notice').text=='首领奖励已处理 · 即将前往宝箱')\n",
     "                    assert(box('notice').text=='首领奖励已处理 · 请选择首领宝箱')\n"],
    ["    assert(not box(slot).visible and not box(slot):GetChild('hit').visible)\n    assert(Map.available(map)[1].id==terminal.id)\n",
     "    assert(box(slot).y==Layout.firstY+16*Theme.layout.map.floorGap-ui.scroll)\n    assert(box(slot).visible and box(slot):GetChild('hit').visible)\n"],
    ["    emit(slot,'down',33);emit(slot,'up',33);assert(not emit(slot,'click',33))\n    assert(map.floor==33 and ui.scroll==Layout.bossTreasureMaxScroll and #calls==1)\n    assert(not ui:choose(terminal.id) and not box(slot).visible)\n    assert(Map.choose(map,terminal.id));ui:focusCurrent()\n    focused(map,ui,box)\n",
     "    emit(slot,'down',33);emit(slot,'up',33);assert(emit(slot,'click',33))\n    assert(map.floor==34 and ui.scroll==Layout.maxScroll and #calls==2)\n    assert(box(slot).y==Layout.firstY+16*Theme.layout.map.floorGap-Layout.maxScroll)\n"],
  ];
  for(const [current, prior] of mapPresentationChanges){
    assert.equal(original.split(current).length,2,'one map presentation assertion migration');
    original=original.replace(current,prior);
  }
  const deferredMapChanges=[
    ["assert(ui:scrollBy(Theme.layout.map.floorGap*3));local startScroll=ui.scroll\n    assert(ui:focusCurrent(true));ui:update(.04);assert(ui.scroll>0 and ui.scroll<startScroll)",
     "assert(box('next'):GetChild('hit').click());ui:update(.04);assert(ui.scroll>0)",1],
    ["assert(ui:scrollBy(Theme.layout.map.floorGap*3));local startScroll=ui.scroll\n    assert(ui:focusCurrent(true));ui:update(.04);assert(ui.scroll<startScroll)",
     "assert(box('next'):GetChild('hit').click());ui:update(.04)",1],
    ["assert(not box(1).visible and not pcall(box,'next') and not pcall(box,'previous'))",
     "assert(not box(1).visible and not box('next'):GetChild('hit').visible\n            and not box('previous'):GetChild('hit').visible)",3],
    ["local scrollOk,scrollReason=ui:scrollBy(100);assert(not scrollOk and scrollReason=='invalid_map_context')",
     "assert(not box('next'):GetChild('hit').click())",1],
  ];
  for(const [current,prior,count] of deferredMapChanges){
    assert.equal(original.split(current).length,count+1,'exact retired map controls migration');
    original=original.replaceAll(current,prior);
  }
  // The removed recenter control has no hit area; both remaining paging hits
  // must fail closed. Reverse only these three reviewed assertion migrations.
  const pagingHidden="assert(not box(1).visible and not box('next'):GetChild('hit').visible\n            and not box('previous'):GetChild('hit').visible)";
  const focusHidden="assert(not box(1).visible and not box('focus'):GetChild('hit').visible)";
  assert.equal(original.split(pagingHidden).length,4,'three exact retired-focus assertions');
  original=original.replaceAll(pagingHidden,focusHidden);
  const visibleGeometry=[
    '                if b.visible then',
    '                    assert(b.x==(node.lane-(Layout.lanes+1)/2)*Theme.layout.map.columnGap)',
    '                    assert(b.y==Layout.firstY+(row-1)*Theme.layout.map.floorGap-ui.scroll)',
    "                    assert(b:GetChild('icon').imageId==Theme.icon.node[node.type])",
  ].join('\n');
  const originalGeometry=[
    '                assert(b.x==(node.lane-(Layout.lanes+1)/2)*Theme.layout.map.columnGap)',
    '                assert(b.y==Layout.firstY+(row-1)*Theme.layout.map.floorGap-ui.scroll)',
    "                assert(b:GetChild('icon').imageId==Theme.icon.node[node.type])",
    '                if b.visible then',
  ].join('\n');
  assert.equal(original.split(visibleGeometry).length,2,'one reviewed visible-node geometry migration');
  original=original.replace(visibleGeometry,originalGeometry);
  const currentMarker="if node.id==map.currentNodeId then assert(box(i).visible and box(i):GetChild('positionToken').visible) end";
  const originalMarker="if node.id==map.currentNodeId then assert(box(i).visible and box(i):GetChild('current').visible) end";
  assert.equal(original.split(currentMarker).length,2,'one exact reviewed ring-free current-node marker');
  original=original.replace(currentMarker,originalMarker);
  // The current fixture measures every painted child (including rotated rings).
  // Reverse this one reviewed oracle migration only for the historical byte proof.
  const paintedBounds="                    dofile('tests/lua/support/map_draw_bounds.lua')(b,Layout.viewport)";
  const originalBounds=[
    '                    local radius=(b.sizeDeltaX+Layout.glowPadding)*Layout.breathScale/2',
    '                    assert(b.y-radius>=Layout.viewport.bottom and b.y+radius<=Layout.viewport.top)',
  ].join('\n');
  assert.equal(original.split(paintedBounds).length,2,'one exact reviewed painted-node bounds migration');
  original=original.replace(paintedBounds,originalBounds);
  original=original.slice(prefix.length,-footer.length);
  assert.equal(original.split(after).length,2);original=original.replace(after,before);
  assert.equal(createHash('sha256').update(original).digest('hex'),parts.originalSha256LF);
  const bytes=Buffer.from(original);assert.equal(bytes.length,parts.originalBytesLF);
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),parts.originalGitBlob);
  const covered=[],executed=[];
  for(const [index,part]of parts.slices.entries()){
    if(index)assert.equal(read(part.path),`assert(loadfile('${parts.entry}'))(${part.first},${part.last})\n`);
    const expected=Array.from({length:part.last-part.first+1},(_,n)=>part.first+n);
    covered.push(...expected);
    const started=Date.now(),result=runLua(part.path,{timeout:parts.timeoutMilliseconds});
    assert.equal(result.status,0,result.stderr+result.stdout);
    const actual=[...result.stdout.matchAll(/^MAP_CHAPTER_CASE (\d+)$/gm)].map(match=>Number(match[1]));
    assert.deepEqual(actual,expected,part.path);executed.push(...actual);
    assert.match(result.stdout,new RegExp(`^LUA_MAP_CHAPTERS_PASS ${expected.length}$`,'m'));
    assert.match(result.stdout,new RegExp(`^MAP_CHAPTER_SLICE ${part.first} ${part.last} ${expected.length}$`,'m'));
    console.log(`Map chapters ${part.first}-${part.last}: ${Date.now()-started} ms`);
  }
  const all=Array.from({length:38},(_,index)=>index+1);
  assert.deepEqual(covered,all);assert.deepEqual(executed,all);
});
