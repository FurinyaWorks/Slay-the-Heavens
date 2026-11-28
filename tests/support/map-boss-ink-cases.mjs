import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildLuaData, toLua } from '../../scripts/build-lua-data.mjs';
import { buildUiTheme } from '../../scripts/build-ui-theme.mjs';
import { loadMapTheme, mapBossInk, mapGeometry, mapLayout } from '../../scripts/map-ui-layout.mjs';
import { applyV25MapLayout } from '../../scripts/v25-map-layout.mjs';

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
      encoding: 'utf8', timeout: 35000,
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
local host=assert(panel:GetChild('bossInkHost'))
local function lookup(name)
    for _,group in pairs(panel.children) do if group:GetChild(name) then return group:GetChild(name) end end
end
local function box(index) return assert(lookup('node'..index)) end
local map=Map.generate(require('abyss_data'),42)
local bossIndex
for i,n in ipairs(map.nodes) do if n.type=='boss' then bossIndex=i end end
local boss=box(assert(bossIndex))
local bossHit,bossRing,bossIcon=boss:GetChild('hit'),boss:GetChild('ring'),boss:GetChild('icon')
local id=expected[1][1]
local callbackCalls=0
local ui=UI.new(root,map,function(node) callbackCalls=callbackCalls+1;return Map.choose(map,node.id) end,'click',{
    cursor={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit'},
    imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,
    bossName=function()return id end,
})
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
            assert(icon.visible and icon.image==Theme.icon.node[node.type],'regular node changed: '..node.type)
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
    assert(#found>1)
    return found
end
for _,edge in ipairs(bossDashes()) do
    assert(edge.visible,'visible fitted Boss lost an incoming route')
    local count=0
    for _,dash in pairs(edge.children) do if dash.visible then
        local ink=assert(dash.imageColor)
        assert(ink.r==35 and ink.g==50 and ink.b==55 and ink.a==214,'untaken terminal route ink diverged from the approved dark ink')
        count=count+1
    end end
    assert(count>1)
end
for _,row in ipairs(expected) do
    id=row[1];ui:render()
    assert(host.visible and not bossIcon.visible)
    assert(host.x==boss.x and host.y==boss.y)
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
assert(boss.visible and not host.visible and bossIcon.visible,'near viewport edge should show stock glyph, not hide a selectable node')
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
assert(host.visible and bossHit.visible and not bossRing.visible)
assert(bossHit.w==Theme.layout.map.bossNode and bossHit.h==Theme.layout.map.bossNode)
assert(bossHit.listeners.click())
assert(callbackCalls==1 and map.currentNodeId==map.nodes[bossIndex].id)
assert(host.visible and bossRing.visible and not bossHit.visible and not bossIcon.visible)
print('BOSS_INK_RUNTIME_PASS')
`;
