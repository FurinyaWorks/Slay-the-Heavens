local F=dofile('tests/lua/support/game_ui_fixture.lua')
local U=require('abyss_traveler_portraits')
local A=require('abyss_traveler_portrait_assets')
local flags=require('abyss_art_features').flags
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
assert(flags.menuBackground and flags.battlePortrait and flags.selectionAvatar and not flags.cards)
assert(require('abyss_ui_profile').nativePageLifecycle==false)
assert(A.lowpolyLand and A.lowpolyLand.cache and #A.lowpolyLand.rows>0)
A.imagePrefabId,A.containerPrefabId=41,73
Enum={ImageSource={StaticReference='static'},ImageType={Stretch='stretch'}}
Color={FromRGBA=function(...)return {...}end}
local owners={}
local function attach(control,label)
 local row={made=0,live=0,writes=0}
 owners[label]=row
 function control:SetActive(b)self.mockActive=b;row.writes=row.writes+1 end
 local visible=control.SetVisible
 function control:SetVisible(b)row.writes=row.writes+1;return visible(self,b)end
 control.mockOwner=row
 return row
end
local menu=attach(root:GetChild('menuPanel'):GetChild('lowpolyScene'),'title')
local select=attach(root:GetChild('characterPanel'):GetChild('lowpolyScene'),'selection')
local battle=attach(root:GetChild('battlePanel'):GetChild('lowpolyScene'),'battle')
local function count(self,...)self.mockOwner.writes=self.mockOwner.writes+1 end
game={InstantiateClientUIControl=function(index,parent)
 local row=assert(parent.mockOwner,'unexpected test owner')
 row.made=row.made+1;row.live=row.live+1
 local c={alive=true,kind=index==41 and 'image' or 'container',mockOwner=row}
 for _,m in ipairs({'SetVisible','SetActive','SetImage','SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling'})do c[m]=count end
 return c
end,DestroyClientUIControl=function(c)
 assert(c.alive);c.alive=false;c.mockOwner.live=c.mockOwner.live-1
end}
local u=assert(U.new(root,print,{menuBackground=true}))
local function ticks(n)for _=1,n do u:tick(1/60)end end
local function dump(s)
 print(s,menu.live,select.live,battle.live,menu.writes,select.writes,battle.writes)
end
print('lowpolyLand rows',#A.lowpolyLand.rows)
u:sync('menu',false,false,'ironclad',true);ticks(900);dump('title+hidden-preload')
assert(menu.live>0 and select.live>0 and battle.live==0)
local priorMenu=menu.live
u:sync('menu',true,false,'ironclad',false);ticks(900);dump('selection')
assert(menu.live==priorMenu)
u:sync('battle',false,false,'ironclad',false);ticks(900);dump('battle')
assert(menu.live==priorMenu and select.live>0 and battle.live>0)
local writes=menu.writes+select.writes+battle.writes
ticks(300);dump('battle-300-stable-ticks')
assert(writes==menu.writes+select.writes+battle.writes,'static cached backdrop still writes per tick')
u:sync('map',false,false,'ironclad',false);dump('map-paused')
assert(menu.live>0 and select.live>0 and battle.live>0)
assert(u:release());dump('released')
assert(menu.live+select.live+battle.live==0)
