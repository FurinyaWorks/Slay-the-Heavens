-- Real Combat + native actor surfaces: split children must not share one draw origin.
package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local H=dofile('tests/lua/support/battle_action_fixture.lua')
local Surfaces=require('abyss_monster_surfaces')
local C=H.F.Combat
local View=require('abyss_battle_enemy_view')
for _,family in ipairs({'acid','spike'})do
 local host,ui,panel,_,tap,drain=H.setup({'strike'},{family..'_slime_l'})
 local state=host.run.combat;local parent=state.enemies[1]
 parent.sourcePosition={x=-180,y=20}
 C.damage(state,state.player,parent,parent.hp-30,true)
 host:refresh();tap('endTurn',101);drain();host:refresh()
 local left,right=state.enemies[1],state.enemies[3]
 assert(left.definitionId==family..'_slime_m' and right.definitionId==left.definitionId)
 assert(left.sourcePosition and right.sourcePosition,'split children need actual source positions')
 assert(left.sourcePosition.x==-314 and right.sourcePosition.x==-46,'parent-relative source +/-134')
 assert(left.sourcePosition.y==20 and right.sourcePosition.y==20,'retain parent source floor')
 assert(left.sourcePosition~=right.sourcePosition and left.sourcePosition~=parent.sourcePosition,'positions are independently owned')
 local a,b=View.geometry(left),View.geometry(right)
 assert(a.x+a.hitWidth/2 < b.x-b.hitWidth/2,'projected hitboxes must be disjoint')
 local surfaces=assert(Surfaces.get(panel))
 local l,r=surfaces:find(left.id),surfaces:find(right.id)
 assert(l and r and l~=r and l.visible and r.visible,'both real native surfaces visible')
 assert(math.abs((r.x-l.x)-(b.x-a.x))<.001,'native anchored origins use source transform: '..tostring(l.x)..'/'..tostring(r.x)..' expected '..tostring(b.x-a.x))
 assert(left.hp==30 and right.hp==30 and parent.hp==0,'position fix preserves split HP')
 print('SPLIT_NATIVE_POSITIONS '..family..' source/native/nonoverlap PASS')
end
