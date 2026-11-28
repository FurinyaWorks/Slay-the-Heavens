import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildLuaData, toLua } from '../../scripts/build-lua-data.mjs';
import { buildUiTheme } from '../../scripts/build-ui-theme.mjs';
import { loadMapTheme, mapBossInk, mapGeometry, mapLayout } from '../../scripts/map-ui-layout.mjs';
import { applyV25MapLayout } from '../../scripts/v25-map-layout.mjs';
import { beforeBossMapScroll } from '../helpers/boss-map-scroll-source.mjs';
import { beforeReleaseEnemyClearance } from '../helpers/release-enemy-clearance-source.mjs';

const require = createRequire(import.meta.url);
const children = node => node.children ?? node.controls ?? [];
function* walk(node) {
  yield node;
  for (const child of children(node)) yield* walk(child);
}

const expected = [
  ['The Guardian', 112046, 20], ['Hexaghost', 112028, 20], ['Slime Boss', 112004, 18],
  ['Champ', 112018, 20], ['Automaton', 112027, 20], ['Collector', 112022, 14],
];

test('V25 Boss art has one bounded, noninteractive native pool and exactly six fitted identities', () => {
  const theme = loadMapTheme(), plain = mapLayout(theme);
  assert.deepEqual(Object.entries(mapBossInk.variants).map(([id, art]) => [id, theme.icon.mapBoss[id], art.length]), expected);
  assert.deepEqual(mapBossInk.palette, [[35, 50, 55], [217, 196, 156]]);
  for (const art of Object.values(mapBossInk.variants)) for (const row of art) {
    assert.equal(row.length, 9);
    assert(row.every(Number.isFinite));
    assert([100001, 100002, 100003].includes(row[0]));
    assert([1, 2].includes(row[1]));
    assert(row[4] > 0 && row[5] > 0);
  }
  assert.equal([...walk(plain)].filter(n => n.name === 'bossInkHost').length, 0);
  const v25 = applyV25MapLayout(plain, theme);
  const hosts = [...walk(v25)].filter(n => n.name === 'bossInkHost');
  const mask = [...walk(v25)].find(n => n.name === 'bossViewport');
  assert.equal(mask.children[0], hosts[0]);
  assert.equal(mask.opacity, 0);
  assert.equal(mask.mask, true);
  assert.equal(mask.image, 100001);
  assert.equal(mask.raycastTarget, false);
  const overflow = [...walk(v25)].find(n => n.name === 'bossRouteOverflow');
  assert.equal(overflow.children.length, mapGeometry(theme).bossRoute.overflow);
  assert(overflow.children.every(n => !n.visible && n.raycastTarget === false));
  assert.equal(hosts.length, 1);
  assert.equal(hosts[0].visible, false);
  assert.equal(hosts[0].children.length, 20);
  for (const [i, slot] of hosts[0].children.entries()) {
    assert.equal(slot.name, 'ink' + String(i).padStart(2, '0'));
    assert.equal(slot.kind, 'image');
    assert.equal(slot.visible, false);
    assert.equal(slot.raycastTarget, false);
  }
});

test('real map runtime paints all six identities on the same V25 controls and preserves legacy and map state', () => {
  const folder = mkdtempSync(join(tmpdir(), 'map-boss-ink-'));
  try {
    const theme = loadMapTheme(), v25 = applyV25MapLayout(mapLayout(theme), theme);
    buildLuaData('data', join(folder, 'abyss_data.lua'));
    buildUiTheme('data/presentation/ui_theme.json', 'data', join(folder, 'abyss_theme.lua'));
    writeFileSync(join(folder, 'abyss_map_layout.lua'), 'return ' + toLua(mapGeometry(theme)));
    writeFileSync(join(folder, 'abyss_map_controls.lua'), 'return ' + toLua(v25));
    const route = resolve('tests/lua/support/boss_route_geometry.lua').replaceAll('\\','/');
    const entry = join(folder, 'case.lua');
    writeFileSync(entry, 'dofile(' + toLua(route) + ')\nlocal expected=' + toLua(expected) + '\n' + runtime);
    const result = spawnSync(process.execPath, [
      require.resolve('fengari-node-cli/src/lua-cli.js'), '-e', 'assert(loadfile(' + toLua(entry.replaceAll('\\','/')) + '))()',
    ], {
      encoding: 'utf8', timeout: 90000,
      env: { ...process.env, LUA_INIT:'', LUA_INIT_5_3:'', LUA_PATH: join(folder, '?.lua') + ';' + resolve('src/lua/?.lua'), LUA_PATH_5_3: join(folder, '?.lua') + ';' + resolve('src/lua/?.lua') },
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /PRODUCTION_BOSS_ROUTE_PASS/);
    assert.match(result.stdout, /BOSS_INK_RUNTIME_PASS/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});

test('Boss scroll replay only restores exact known live owners in uniform LF or CRLF', () => {
  const chapter = 'tests/helpers/chapter-battle-scene-source.mjs';
  const paths = ['scripts/build-ui.mjs', 'scripts/map-ui-layout.mjs', 'scripts/v25-map-layout.mjs',
    'src/lua/abyss_map_ui.lua', chapter];
  // #1079 owns the current chapter helper, while the #1077 Boss receipt owns
  // its exact predecessor. Require both steps, only for that helper.
  const restore = (path, raw) => {
    if (path !== chapter) return beforeBossMapScroll(path, raw);
    const beforeClearance = beforeReleaseEnemyClearance(path, raw);
    if (beforeClearance === raw) return raw;
    const beforeScroll = beforeBossMapScroll(path, beforeClearance);
    return beforeScroll === beforeClearance ? raw : beforeScroll;
  };
  for (const path of paths) {
    const live = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
    const prior = restore(path, live);
    assert.notEqual(prior, live, path);
    assert.deepEqual(restore(path, Buffer.from(live)), Buffer.from(prior));
    assert.equal(restore(path, live.replaceAll('\n', '\r\n')), prior.replaceAll('\n', '\r\n'));
    const malformed = [prior, live+'\n', live.replace('\n', '\r\n'), Buffer.concat([Buffer.from(live), Buffer.of(255)])];
    if (path === chapter) malformed.push(beforeReleaseEnemyClearance(path, live));
    for (const mutated of malformed)
      assert.equal(restore(path, mutated), mutated, 'unknown raw source must not project: '+path);
  }
});

const runtime = `
local Map, UI = require('abyss_map'), require('abyss_map_ui')
local Theme, Layout = require('abyss_theme'), require('abyss_map_layout')
local function control(spec)
    local c = {spec=spec,children={},visible=spec.visible~=false,image=spec.image,
        imageColor=spec.colour,listeners={},x=0,y=0,w=0,h=0,localScaleX=1,localScaleY=1,writes=0}
    function c:GetChild(name) return self.children[name] end
    function c:SetVisible(v) self.visible=v end
    function c:SetAnchoredPosition(x,y) self.x,self.y=x,y end
    function c:SetSizeDelta(w,h) self.w,self.h=w,h end
    function c:SetLocalScale(x,y) self.localScaleX,self.localScaleY=x,y end
    function c:SetImage(source,id) assert(source=='static' and type(id)=='number');self.image=id;self.writes=self.writes+1 end
    function c:SetLocalRotation(x,y,z) self.rotation={x,y,z} end
    function c:AddCursorEventListener(event,fn) self.listeners[event]=fn end
    for _,item in ipairs(spec.children or {}) do c.children[item.name]=control(item) end
    return c
end
local root=control({children=require('abyss_map_controls').controls})
local panel=root:GetChild('stage'):GetChild('mapPanel')
local mask=assert(panel:GetChild('bossViewport'))
local host=assert(mask:GetChild('bossInkHost'))
local fittedRing=assert(mask:GetChild('bossRing'))
local overflow=assert(panel:GetChild('bossRouteOverflow'))
local function lookup(name)
    for _,group in pairs(panel.children) do if group:GetChild(name) then return group:GetChild(name) end end
end
local function box(index) return assert(lookup('node'..index)) end
local map=Map.generate(require('abyss_data'),16)
local bossIndex
for i,n in ipairs(map.nodes) do if n.type=='boss' then bossIndex=i end end
local boss=box(assert(bossIndex))
local bossHit,bossRing,bossIcon=boss:GetChild('hit'),boss:GetChild('ring'),boss:GetChild('icon')
local id=expected[1][1]
local callbackCalls=0
local options={
    cursor={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit'},
    imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,
    bossName=function()return id end,
}
local ui=UI.new(root,map,function(node) callbackCalls=callbackCalls+1;return Map.choose(map,node.id) end,'click',options)
assert(not host.visible,'head of map must not show boss art')
assert(ui:setScroll(99999))
assert(boss.visible,'seed must expose the boss at maximum scroll')
local slots={}
for i=1,20 do slots[i]=assert(host:GetChild(string.format('ink%02d',i-1))) end

local function ordinary()
    local lines={}
    for i,node in ipairs(Map.view(map).nodes) do
        local b=box(i)
        if b.visible and node.type~='boss' then
            local icon,hit,ring=b:GetChild('icon'),b:GetChild('hit'),b:GetChild('ring')
            assert(icon.visible and icon.image==Theme.icon.node[node.type],'regular node identity changed: '..node.type)
            lines[#lines+1]=table.concat({node.id,b.x,b.y,b.w,b.h,icon.image,icon.w,icon.h,tostring(hit.visible),tostring(ring.visible)},':')
        end
    end
    for _,group in pairs(panel.children) do
        local legend=group:GetChild('typeLegend')
        if legend then assert(legend:GetChild('combatIcon').spec.image==Theme.icon.node.combat) end
    end
    assert(#lines>5)
    return table.concat(lines,'|')
end
local ordinaryBefore=ordinary()
local lockedInk,activeInk={r=87,g=87,b=87},{r=23,g=33,b=43}
local function matchesInk(actual,ink)
    return actual.r==ink.r and actual.g==ink.g and actual.b==ink.b and actual.a==255
end
local ordinaryCount=0
for _,edge in pairs(panel.children) do for name,control in pairs(edge.children) do
    if name:match('^edge%d+$') and control.visible then
        for _,mark in pairs(control.children) do if mark.visible then
            assert(matchesInk(mark.imageColor,lockedInk),'ordinary route must use the original steady locked ink')
            ordinaryCount=ordinaryCount+1
        end end
    end
end end
assert(ordinaryCount>20)
local function bossDashes()
    local edge, found=0, {}
    local view,byId=Map.view(map),{}
    for _,node in ipairs(view.nodes) do byId[node.id]=node end
    for _,node in ipairs(view.nodes) do for _,nextId in ipairs(node.nextIds) do
        local target=byId[nextId]
        if target.roomKind~='boss_treasure' then
            edge=edge+1
            if target.type=='boss' then found[#found+1]=assert(lookup('edge'..edge)) end
        end
    end end
    assert(#found==6,'seed 16 must exercise six real incoming edges')
    return found
end
local function strokes()
    local result={}
    local function add(group)
        for _,dash in pairs(group.children) do if dash.visible then
            local ink=assert(dash.imageColor)
            assert(matchesInk(ink,lockedInk),'scroll changed the shared locked route ink')
            result[#result+1]={x=dash.x,y=dash.y+ui.scroll,w=dash.w,h=dash.h,angle=dash.localRotationZ}
        end end
    end
    for _,edge in ipairs(bossDashes()) do if edge.visible then add(edge) end end
    add(overflow)
    return result
end
local full=strokes()
assert(#full>60 and #full<=6*Layout.bossRoute.sharedSlots+Layout.bossRoute.overflow)
for _,edge in ipairs(bossDashes()) do assert(edge.visible,'maximum scroll lost a real incoming route') end
local function near(a,b) return math.abs(a-b)<1e-5 end
local function verifySweep()
    local maxScroll,bossWorldY=ui.scroll,boss.y+ui.scroll
    local routeOnly,partial=false,false
    local function sample(scroll)
        assert(ui:setScroll(scroll))
        local y=bossWorldY-ui.scroll
        local r=Layout.bossInk.size/2
        assert(host.visible==(y-r<Layout.viewport.top),'fitted mask visibility changed at the wrong world position')
        assert(not bossIcon.visible,'legacy Boss glyph was enabled during scroll')
        if host.visible then
            assert(near(host.y+mask.y,y))
            if y+r>Layout.viewport.top then partial=true end
        end
        local visible=strokes()
        if not host.visible and #visible>0 then routeOnly=true end
        for _,mark in ipairs(visible) do
            assert(mark.w>0 and mark.w<=Layout.bossRoute.length+1e-5 and mark.h==UI.pathWidth(false,false))
            if near(mark.w,Layout.bossRoute.length) then
                local fixed=false
                for _,ref in ipairs(full) do
                    if near(mark.x,ref.x) and near(mark.y,ref.y) and near(mark.angle,ref.angle) then fixed=true;break end
                end
                assert(fixed,'fully visible stroke moved in world space')
            end
        end
        for _,ref in ipairs(full) do
            local dy=math.abs(math.sin(ref.angle*math.pi/180))*ref.w/2+ref.h/2
            if ref.y-ui.scroll+dy<=Layout.viewport.top and ref.y-ui.scroll-dy>=Layout.viewport.bottom then
                local drawn=false
                for _,mark in ipairs(visible) do
                    if near(mark.x,ref.x) and near(mark.y,ref.y) and near(mark.angle,ref.angle) then drawn=true;break end
                end
                assert(drawn,'an in-bounds real Boss dash was dropped')
            end
        end
    end
    for n=0,100 do sample(maxScroll-n*3) end
    for n=99,0,-1 do sample(maxScroll-n*3) end
    assert(routeOnly and partial,'sweep must cover clipped art and routes with Boss fully outside')
    local writes=slots[1].writes
    for _=1,120 do assert(ui:update(1/60)) end
    assert(slots[1].writes==writes and #strokes()==#full,'static frames repainted or lost Boss art/routes')
end
verifySweep()
for _,row in ipairs(expected) do
    id=row[1];ui:render()
    assert(host.visible and not bossIcon.visible)
    assert(near(host.x+mask.x,boss.x) and near(host.y+mask.y,boss.y))
    assert(boss:GetChild('hit')==bossHit and boss:GetChild('ring')==bossRing)
    assert(not bossRing.visible and not bossHit.visible,'locked Boss ring/hit state changed')
    local art=Layout.bossInk.variants[id]
    for i=1,20 do
        local slot,data=slots[i],art[i]
        assert(host:GetChild(string.format('ink%02d',i-1))==slot)
        assert(slot.visible==(i<=row[3]))
        assert(next(slot.listeners)==nil and slot.spec.raycastTarget==false)
        if data then
            local pal=Layout.bossInk.palette[data[2]]
            assert(slot.image==data[1] and slot.x==data[3] and slot.y==data[4] and slot.w==data[5] and slot.h==data[6])
            assert(slot.rotation[1]==data[7] and slot.rotation[2]==data[8] and slot.rotation[3]==data[9])
            assert(slot.imageColor.r==pal[1] and slot.imageColor.g==pal[2] and slot.imageColor.b==pal[3] and slot.imageColor.a==255)
        end
    end
    local writes=slots[1].writes
    ui:render();ui:update(0)
    assert(slots[1].writes==writes,'unchanged identity must not repaint stable pool')
    assert(ordinary()==ordinaryBefore,'switching Boss art mutated regular nodes')
end

id='Unfitted title';ui:render()
assert(not host.visible and bossIcon.visible and bossIcon.image==Theme.icon.node.boss,'unknown Boss must use stock fallback')
assert(ordinary()==ordinaryBefore)

id=expected[1][1];ui:render()
local maxScroll,maxY=ui.scroll,boss.y
local atClip=Layout.viewport.top-Layout.bossInk.size/2+3
assert(ui:setScroll(maxScroll-(atClip-maxY)))
assert(host.visible and not bossIcon.visible,'partially visible fitted Boss must keep its approved ink')
assert(boss:GetChild('hit')==bossHit and boss:GetChild('ring')==bossRing)
assert(ui:setScroll(99999));assert(host.visible)
local savedAct=map.act
map.act=99;ui:render()
assert(not host.visible and not bossHit.visible,'invalid chapter left behind pooled visual or hit')
map.act=savedAct;ui:render();assert(host.visible,'restoring the valid chapter must restore the fit')
assert(ui:setScroll(0));assert(not host.visible,'panning away left a stale host')
assert(ui:setScroll(99999));assert(host.visible,'panning back lost fitted Boss')
ui:setVisible(false);assert(not root.visible)
ui:setVisible(true);assert(root.visible and not host.visible,'reopening at the current floor left stale Boss art')

-- Advance along a real generated route to the penultimate room, then use the
-- original Boss hit callback rather than mutating its navigation state.
while Map.available(map)[1].type~='boss' do
    assert(Map.choose(map,Map.available(map)[1].id))
end
ui:render();ui:setScroll(99999);ui:setNavigationEnabled(true)
local reachable=0
for _,edge in ipairs(bossDashes()) do if edge.visible then
    for _,mark in pairs(edge.children) do if mark.visible and matchesInk(mark.imageColor,activeInk) then
        assert(mark.h==UI.pathWidth(false,true));reachable=reachable+1
    end end
end end
assert(reachable>0,'available Boss uses the same ink and width as an available regular route')
assert(host.visible and bossHit.visible and not bossRing.visible)
assert(bossHit.w==Theme.layout.map.bossNode and bossHit.h==Theme.layout.map.bossNode)
local lastScroll,bossY=ui.scroll,boss.y
assert(ui:setScroll(lastScroll-(Layout.viewport.top-bossY)))
assert(bossHit.visible and near(bossHit.h,Theme.layout.map.bossNode/2))
assert(near(boss.y+bossHit.y+bossHit.h/2,Layout.viewport.top))
assert(ui:setScroll(lastScroll-(Layout.viewport.top+Theme.layout.map.bossNode/2+1-bossY)))
assert(host.visible and not bossHit.visible and not bossHit.listeners.click(),'clipped ink fringe must not accept input')
assert(ui:setScroll(lastScroll))
assert(bossHit.listeners.click())
assert(callbackCalls==1 and map.currentNodeId==map.nodes[bossIndex].id)
assert(host.visible and fittedRing.visible and not bossRing.visible and not bossHit.visible and not bossIcon.visible)
local nextMap=Map.generate(require('abyss_data'),46,2)
map=nextMap; id='Champ'; ui.map=map;ui:render()
assert(not host.visible and not fittedRing.visible,'chapter replacement leaked old Boss art/ring')
assert(ui:setScroll(99999) and host.visible and slots[1].image==Layout.bossInk.variants.Champ[1][1])
local mobileRoot=control({children=require('abyss_map_controls').controls})
local mobileOptions={hudTop=168}
for key,value in pairs(options)do mobileOptions[key]=value end
local mobile=UI.new(mobileRoot,map,function()error('unexpected mobile choose')end,'click',mobileOptions)
assert(mobile:setScroll(99999))
local mobileMask=mobileRoot:GetChild('stage'):GetChild('mapPanel'):GetChild('bossViewport')
assert(mobileMask.y+mobileMask.h/2==168 and mobileMask.y-mobileMask.h/2==Layout.viewport.bottom)
assert(mobileMask:GetChild('bossInkHost').visible and near(mobileMask:GetChild('bossInkHost').y+mobileMask.y,78))
print('BOSS_INK_RUNTIME_PASS')
`;
