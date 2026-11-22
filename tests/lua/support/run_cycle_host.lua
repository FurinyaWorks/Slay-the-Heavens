package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local Boss,Cards,Choices,Pending,Shop,U=require('abyss_boss_relics'),require('abyss_relic_card_rewards'),require('abyss_relic_choices'),require('abyss_relic_pending'),require('abyss_shop_relics'),require('abyss_uncommon_relics')
assert(package.loaded.abyss_run==nil,'relic command consumers must cold load without the Run composition owner')
local calls,host={},{}
host.transaction=function(owner,command)calls[#calls+1]='transaction';return command(owner)end
host.increaseMaxHp=function(owner,n)calls[#calls+1]='maxHp';owner.maxHp=owner.maxHp+n;return true,n end
host.gainGold=function(owner,n)calls[#calls+1]='gold';owner.gold=owner.gold+n;return n end
host.heal=function(owner,n)calls[#calls+1]='heal';owner.hp=owner.hp+n end
local r={phase='reward',relics={'singing_bowl'},maxHp=80,rewards={cardResolved=false,cardRewardGroups={{cards={'strike'},resolved=false}}}}
assert(Cards.open(r,r.rewards,host));assert(r.pendingCardRewardSelection.rewardOwner==r.rewards)
assert(Cards.claim(r,1,'bowl',host));assert(r.maxHp==82 and r.rewards.cardResolved and r.pendingCardRewardSelection==nil)
assert(table.concat(calls,',')=='transaction,transaction,maxHp')
local adapter=Choices.adapter(host)
host.obtainCardCopy=function(owner,uid)error('old dynamic function must not be snapshotted')end
host.obtainCardCopy=function(owner,uid)calls[#calls+1]='copy';return true,uid+1 end
local mirror={shopRelicChoice={kind='copy',relic='dollys_mirror',uids={17}}}
local copied,uid=Shop.chooseMirror(mirror,17,adapter);assert(copied and uid==18 and mirror.shopRelicChoice==nil)
local marker={kind='explicit-owner-error'}
host.obtainCardCopy=function(owner,selected)owner.partial=selected;error(marker)end
local rejected={shopRelicChoice={kind='copy',relic='dollys_mirror',uids={19}}}
local called,why=pcall(Shop.chooseMirror,rejected,19,adapter)
assert(not called and why==marker,'[RUN_CYCLE_HOST] explicit owner error identity changed')
assert(rejected.partial==19 and rejected.shopRelicChoice~=nil,'caller retains the documented nontransactional partial state')
local reward={gold=0,pendingBossRelic={kind='rewards',gold=50,goldClaimed=false}}
local view=Pending.view(reward);local token=view.rows[1].token
local before=#calls;assert(Pending.resolve(reward,token,host))
assert(reward.gold==50 and reward.pendingBossRelic.goldClaimed)
assert(calls[before+1]=='transaction'and calls[before+2]=='transaction'and calls[before+3]=='gold')
local meat={hp=20,maxHp=80,relics={'meat_on_the_bone'}};U.battleEnd(meat,host);assert(meat.hp==32)
assert(package.loaded.abyss_run==nil,'explicit hosts must not discover or register a global Run owner')

-- Exercise the real command owner as well: a failed permanent grant must keep
-- every public owner and random stream unchanged after private writes.
local Run,R=require('abyss_run'),require('abyss_sts_random')
local run=Run.new(require('abyss_data'),'42',{experimental=true,character='ironclad'})
assert(Run.obtainRelic(run,'tiny_house'))
local pending,deck,relics,flow=run.pendingBossRelic,run.deck,run.relics,run.nodeFlow
local hp,maxHp,gold,random=run.hp,run.maxHp,run.gold,R.snapshot(run.miscRng)
local original=Run.obtainCard
Run.obtainCard=function(staged)
 staged.gold=staged.gold+71;R.randomInt(staged.miscRng,99)
 return false,'explicit_host_late_failure'
end
local ok,why=Boss.claim(run,'card',1,Run);Run.obtainCard=original
assert(not ok and why=='explicit_host_late_failure')
assert(run.pendingBossRelic==pending and run.deck==deck and run.relics==relics and run.nodeFlow==flow)
assert(run.hp==hp and run.maxHp==maxHp and run.gold==gold and not pending.cardResolved)
local after=R.snapshot(run.miscRng)
local function same(a,b)
 assert(type(a)==type(b),'private failed command changed random-state type')
 if type(a)~='table'then assert(a==b,'private failed command leaked random state');return end
 for key,value in pairs(a)do same(value,b[key])end
 for key in pairs(b)do assert(a[key]~=nil,'private failed command added random state')end
end
same(after,random)
print('RUN_CYCLE_HOST_PASS cold-load,explicit-owner,dynamic-slot,nested-transaction,late-rollback')
