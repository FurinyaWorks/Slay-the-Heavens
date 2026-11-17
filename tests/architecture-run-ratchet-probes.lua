-- Actual public commands, real query/planning modules, and injected permanent
-- host outcomes. The real Run rollback/poison contract is tested separately.
local Copy=require('abyss_copy').copy
local Boss=require('abyss_boss_relics')
local Cards=require('abyss_relic_card_rewards')
local Choices=require('abyss_relic_choices')
local count=0
local marker={kind='host-error-object'}
local function observe(label,run,fn,...)
 local result=table.pack(pcall(fn,run,...))
 if not result[1]and type(result[2])=='string'then result[2]=result[2]:gsub(':%d+: ',':LINE: ')end
 RUN_RATCHET_GRAPH_WRITE({run=run,result=result},label,false);count=count+1
end
local function fixture()
 return {phase='reward',hp=30,maxHp=80,gold=9,deck={},relics={'singing_bowl'},calls={},rng={counter=0},
  pendingBossRelic={kind='rewards',gold=50,goldClaimed=false,potion={id='potion'},cards={'strike'},cardUpgrades={true},relics={{id='anchor'}}},
  rewards={cardRewardGroups={{cards={'strike'},cardUpgrades={true},resolved=false}},cardResolved=false},
  shopRelicRewards={token=7,items={{kind='card',reward={cards={'strike'},cardUpgrades={true}}},{kind='potion',id='potion'}}},
  pendingCardRewardSelection={token=3}}
end
local function host()
 local api={}
 function api.transaction(run,command)
  run.calls[#run.calls+1]={'transaction'}
  if run.dynamic then api.obtainCard=function(owner,id)owner.dynamicRead=true;return true,id end end
  return command(run)
 end
 local function effect(run,name,...)
  run.calls[#run.calls+1]={name,...};run.rng.counter=run.rng.counter+1
  run.partial=name
  if run.replace then
   run.pendingBossRelic=Copy(run.pendingBossRelic);run.rewards=Copy(run.rewards);run.shopRelicRewards=Copy(run.shopRelicRewards)
  end
  if run.fault=='throw-'..name then error(marker)end
  if run.fault=='reject-'..name then return false,'rejected-'..name end
  return true
 end
 function api.gainGold(run,n)effect(run,'gainGold',n);run.gold=run.gold+n;return n end
 function api.increaseMaxHp(run,n)
  local ok,why=effect(run,'increaseMaxHp',n);if not ok then return false,why end
  run.maxHp=run.maxHp+n;return true,n,'extra-host-return'
 end
 function api.obtainCard(run,id,options)
  local ok,why=effect(run,'obtainCard',id,options);if not ok then return false,why end
  run.deck[#run.deck+1]={cardId=id,uid=#run.deck+1};return true,#run.deck,'extra-host-return'
 end
 function api.obtainPotion(run,id)
  local ok,why=effect(run,'obtainPotion',id);if not ok then return false,why end
  if run.sozu then return false,'potion_blocked_by_sozu'end
  run.potion=id;return true,id,'extra-host-return'
 end
 function api.obtainRelic(run,id)
  local ok,why=effect(run,'obtainRelic',id);if not ok then return false,why end
  run.relics[#run.relics+1]=id;return true,id
 end
 return api
end
for _,kind in ipairs({'gold','potion','card','done','relic','unknown'})do
 for i,choice in ipairs({'bowl',0,1,2,-1,1.5,false,'unknown'})do
  for _,mode in ipairs({'plain','replace','dynamic','reject-obtainCard','throw-obtainCard','reject-increaseMaxHp','throw-increaseMaxHp','reject-obtainPotion','throw-obtainPotion','sozu','no-bowl'})do
   local run=fixture();run.replace=mode=='replace';run.dynamic=mode=='dynamic';run.fault=mode;run.sozu=mode=='sozu';if mode=='no-bowl'then run.relics={}end
   observe('boss:'..kind..':'..i..':'..mode,run,Boss.claim,kind,choice,host())
  end
 end
end
for _,kind in ipairs({'absent','wrong','claimed','no-cards','no-gold','no-potion'})do
 for _,choice in ipairs({'gold','potion','card','done'})do
  local run=fixture()
  if kind=='absent'then run.pendingBossRelic=nil elseif kind=='wrong'then run.pendingBossRelic.kind='cards'
  elseif kind=='claimed'then run.pendingBossRelic.goldClaimed=true;run.pendingBossRelic.cardResolved=true;run.pendingBossRelic.potion.claimed=true
  elseif kind=='no-cards'then run.pendingBossRelic.cards=nil elseif kind=='no-gold'then run.pendingBossRelic.gold=nil
  else run.pendingBossRelic.potion=nil end
  observe('boss-owner:'..kind..':'..choice,run,Boss.claim,choice,1,host())
 end
end
for i,index in ipairs({false,0,1,2,'1',1.5})do for j,choice in ipairs({'bowl',0,1,2,false,'unknown'})do
 for _,mode in ipairs({'plain','replace','no-bowl','reject-obtainCard','throw-obtainCard','dynamic','missing-rewards','wrong-phase','resolved'})do
  local run=fixture();run.replace=mode=='replace';run.dynamic=mode=='dynamic';run.fault=mode
  if mode=='no-bowl'then run.relics={}elseif mode=='missing-rewards'then run.rewards=nil elseif mode=='wrong-phase'then run.phase='node'elseif mode=='resolved'then run.rewards.cardRewardGroups[1].resolved=true end
  observe('cards:'..i..':'..j..':'..mode,run,Cards.claim,index and index or nil,choice,host())
 end
end end
for i,index in ipairs({false,0,1,2,'1',1.5})do for j,choice in ipairs({'bowl',0,1,2,false,'unknown'})do
 for _,mode in ipairs({'plain','replace','no-bowl','reject-obtainCard','throw-obtainCard','reject-obtainPotion','throw-obtainPotion','sozu','stale','claimed','unknown-kind'})do
  local run=fixture();run.replace=mode=='replace';run.fault=mode;run.sozu=mode=='sozu'
  if mode=='no-bowl'then run.relics={}elseif mode=='claimed'then run.shopRelicRewards.items[1].claimed=true;run.shopRelicRewards.items[2].claimed=true elseif mode=='unknown-kind'then run.shopRelicRewards.items[1].kind='unknown'end
  observe('choices:'..i..':'..j..':'..mode,run,Choices.claim,mode=='stale'and 8 or 7,index and index or nil,choice,host())
 end
end end

-- Render the real pending UI with native call-order traces. A setter may
-- replace the Run during panel setup; callbacks must retain the old admission.
local Pending=require('abyss_relic_pending')
local UI=require('abyss_relic_pending_ui')
Pending.view=function(run)return run.projection end
Pending.owner=function(run)return run.owner end
Pending.resolve=function(run,token,Run)
 run.resolved=token
 return Run.choose(run,token)
end
for _,rows in ipairs({0,1,3,7})do for _,mode in ipairs({'normal','no-view','same-owner','page-three','reenter-clear','resolve-false','resolve-throw','stale-hidden'})do
 local trace,controls,actions={}, {},{}
 local owner={id='owner'};local run={owner=owner};local self={run=run,map={},visible=true,busy=false,presentationBusy=false,pendingGeneration=4,notice='old-notice'}
 local view={owner=owner,title='待选遗物',body='说明',rows={}}
 for i=1,rows do view.rows[i]={title='选项'..i,description='描述'..i,token={choice=i}}end
 run.projection=mode~='no-view'and view or nil
 if mode=='same-owner'then self.pendingOwner=owner elseif mode=='page-three'then self.pendingOwner=owner;self.pendingPage=3 end
 local ctx={self=self}
 local function control(path)
  if controls[path]then return controls[path]end
  local values,methods={},{}
  function methods:GetChild(name)trace[#trace+1]={'get',path,name};return control(path..'/'..name)end
  local c=setmetatable({},{__index=function(_,key)return methods[key]or values[key]end,__newindex=function(_,key,value)trace[#trace+1]={'write',path,key,value};values[key]=value end})
  controls[path]=c;return c
 end
 function ctx.child(path)trace[#trace+1]={'child',path};return control(path)end
 function ctx.show(box,enabled)trace[#trace+1]={'show',enabled};box.visible=enabled end
 function ctx.state(box,enabled)trace[#trace+1]={'state',enabled};box.interactable=enabled end
 function ctx.action(key,enabled,handler,_,__,observe)trace[#trace+1]={'action',key,enabled};actions[key]={handler=handler,observe=observe}end
 ctx.shopSelection={clear=function()
  trace[#trace+1]={'clear'}
  if mode=='reenter-clear'then self.run={owner={id='replacement'}}end
 end}
 ctx.roomMotion={cancel=function()trace[#trace+1]={'cancel'}end}
 ctx.merchant={setVisible=function(_,enabled)trace[#trace+1]={'merchant',enabled}end}
 function ctx.renderTopBar(value)trace[#trace+1]={'top',value}end
 function ctx.onChange(ok,why)trace[#trace+1]={'change',ok,why}end
 function self:render()trace[#trace+1]={'render'}end
 local api={choose=function(_,token)
  trace[#trace+1]={'choose',token.choice}
  if mode=='resolve-throw'then error(marker)elseif mode=='resolve-false'then return false,'potion_slots_full'end
  return true,'chosen'
 end}
 UI.install(ctx,api)
 local rendered=table.pack(pcall(ctx.renderRelicPending))
 assert(rendered[1],rendered[2])
 if not rendered[1]and type(rendered[2])=='string'then rendered[2]=rendered[2]:gsub(':%d+: ',':LINE: ')end
 local selected=actions['eventView/option1'];local activated
 if selected then
  if mode=='stale-hidden'then self.visible=false end
  activated=table.pack(pcall(selected.handler))
  if not activated[1]and type(activated[2])=='string'then activated[2]=activated[2]:gsub(':%d+: ',':LINE: ')end
 end
 RUN_RATCHET_GRAPH_WRITE({trace=trace,run=run,self=self,rendered=rendered,activated=activated},'pending-ui:'..rows..':'..mode,false);count=count+1
end end
assert(count>=1200,'complete command and UI matrix')
RUN_RATCHET_COUNT=count
