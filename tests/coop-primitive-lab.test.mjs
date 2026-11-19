import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lua,lauxlib,lualib,to_luastring,to_jsstring} from 'fengari';
import {room,capacityScene,inventory,figure,stressScene} from '../experiments/coop-primitive-lab/scenes.mjs';
import {simulatorSave} from '../experiments/coop-primitive-lab/build.mjs';

test('flat cases distinguish group roots from leaf controls',()=>{
  for (const count of [999,1000,1001,1100]) {
    const scene=capacityScene(String(count));
    assert.equal(scene.roots.length,1);
    assert.deepEqual(inventory(scene.roots),{created:count+1,visible:count+1,containers:1,images:count});
  }
  assert.throws(()=>capacityScene('998'),/Unknown capacity/);
});

test('split controls export with disjoint GUIDs and nested client templates count their containers',()=>{
  const splits=['A','B'].map(view=>simulatorSave('capacity-split-'+view,capacityScene('split-'+view)));
  const roots=splits.map(save=>save.assets.server.root.children[0]);
  assert.deepEqual(roots.map(root=>root.name),['groupA','groupB']);
  const guids=roots.flatMap(root=>[root.guid,...root.children.map(node=>node.guid)]);
  assert.equal(new Set(guids).size,2*551);
  const nested=capacityScene('nested');
  assert.equal(inventory(nested.templates).created,1123);
  assert.equal(nested.templates[0].children.length,22);
  assert(nested.templates[0].children.every(page=>page.children.length===50));
  const dynamic=capacityScene('dynamic');
  assert.equal(inventory(dynamic.templates).created*dynamic.dynamicCopies,1150);
});

test('raw triangular geometry can emit two controls and count both',()=>{
  const pack={budget:1,width:60,height:60,nativeImages:2,
    shapes:[{type:'polygon',colour:'#FFFFFF',points:[[5,5],[12,5],[8,17]]}]};
  assert.equal(inventory(figure(pack)).images,2);
  assert.throws(()=>figure({...pack,nativeImages:1}),/emitted native image counts differ/);
});

test('two seat projections keep independent templates and charge the hidden effect pool',()=>{
  assert.deepEqual(room,{min:1,max:2});
  const shapes=Array.from({length:300},()=>({type:'rect',box:[0,0,10,10],colour:'#FFFFFF'}));
  const pack={budget:300,width:100,height:100,nativeImages:300,shapes};
  for (const view of ['A','B']) {
    const scene=stressScene(pack,view);
    const [local,partner,,hand]=scene.templates;
    assert.equal(local.children.at(-1).label,view);
    assert.notEqual(partner.children.at(-1).label,view);
    assert.equal(hand.children.length,10);
    assert(hand.children.every(card=>inventory([card]).created===20));
    assert.equal(scene.modules.effects.visible,0);
    assert.equal(scene.modules.effects.created,154);
    const save=simulatorSave('stress-300-'+view,scene);
    const roots=save.assets.client.root.children;
    assert.equal(roots.length,6);
    assert.notEqual(roots[0].children[0].guid,roots[1].children[0].guid);
    assert(save.assets.scripts[0].source.includes(`view='${view}'`));
    assert.equal(save.assets.server.root.children[0].children.length,0);
  }
});


test('actual Lua animates parent controls across two cycles without rebuilding the templates',()=>{
  const runtime=readFileSync(new URL('../experiments/coop-primitive-lab/runtime.lua',import.meta.url),'utf8');
  const source=`
    local EXPERIMENT_CONFIG={view='B',bindings={['local']=1,partner=2,enemies=3,hand=4,hud=5,effects=6},masks={{'page0','facet0'}}}
    local controls, created = {}, 0
    local card, fills = nil, 0
    Enum={ImageFillHorizontalType={Right='right'}}
    local facet={SetFillHorizontal=function(_,direction,amount)
      assert(direction=='right' and amount==.5)
      fills=fills+1
    end}
    local page={GetChild=function(_,name) assert(name=='facet0'); return facet end}
    local function control()
      return {
        SetVisible=function(self,shown) self.shown=shown end,
        SetAnchoredPosition=function(self,x,y) self.x=x; self.y=y end,
        GetChild=function(_,name)
          if name=='page0' then return page end
          assert(name=='card0')
          return card
        end
      }
    end
    card=control()
    local logs={}
    print=function(message) logs[#logs+1]=message end
    script={object=control(),EnableUpdate=function(self,enabled) self.enabled=enabled end}
    game={InstantiateClientUIControl=function(index,parent)
      assert(parent==script.object)
      controls[index]=control()
      created=created+1
      return controls[index]
    end}
    ${runtime}
    OnStart()
    assert(created==6 and script.enabled and not controls[6].shown and fills==2)
    for cycle=1,2 do
      OnUpdate(1.001)
      assert(controls[1].x==-409 and controls[2].x==-244)
      OnUpdate(1.001)
      assert(not card.shown and controls[1].x==-435)
      OnUpdate(1.001)
      assert(card.shown and card.y==-211)
      OnUpdate(1.001)
      assert(controls[6].shown and script.object.shown)
      OnUpdate(1.001)
      assert(not controls[6].shown and not script.object.shown)
      OnUpdate(1.001)
      assert(script.object.shown and created==6)
    end
    assert(fills==2 and #logs==13 and logs[1]=='COOP_LAB ready view=B')
  `;
  const state=lauxlib.luaL_newstate();
  try {
    lualib.luaL_openlibs(state);
    const status=lauxlib.luaL_dostring(state,to_luastring(source));
    assert.equal(status,lua.LUA_OK,status===lua.LUA_OK ? undefined : to_jsstring(lua.lua_tostring(state,-1)));
  } finally {
    lua.lua_close(state);
  }
});
