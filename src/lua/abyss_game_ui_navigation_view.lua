local Theme=require('abyss_theme')
local Navigation=require('abyss_game_ui_navigation')
local M={}
local sessionHint='本局仅在当前奇域会话中保留；退出奇域后无法继续。'
local concise={title='放弃本局？',label='确认放弃',message='当前本局进度将被清除。'}
local confirmations={
    abandon={title='放弃本局？',label='确认放弃',message='确认放弃本局？本局进度将被清除，无法恢复。\n放弃后返回主菜单。'},
    new={title='开始新游戏？',label='开始新游戏',message='确认开始新游戏？现有本局进度将被清除，无法恢复。'},
}
local function frame(control,at,inset)
    control:SetAnchoredPosition(at[1],at[2])
    control:SetSizeDelta(at[3]-inset,at[4]-inset)
end
local function dialogGeometry(panel,compact)
    local layout=Theme.layout.exitMenu
    local size=compact and {0,0,480,204} or layout.panel
    frame(panel:GetChild('border'),size,0)
    frame(panel:GetChild('face'),size,Theme.space.border*2)
    frame(panel:GetChild('title'),compact and {0,64,430,48} or layout.title,0)
    frame(panel:GetChild('message'),compact and {0,12,430,48} or layout.message,0)
    local buttons=compact and {cancel={-110,-58},confirm={110,-58}} or layout
    for _,name in ipairs({'cancel','confirm'})do
        local control,at=panel:GetChild(name),buttons[name]
        control:SetAnchoredPosition(at[1],at[2])
        control:SetLocalScale(compact and .58 or 1,compact and .85 or 1,1)
    end
    for _,name in ipairs({'border','rule','help'})do panel:GetChild(name):SetVisible(not compact)end
end
local function confirmation(self)
    local spec=confirmations[self.navigationAction]
    local compact=Theme.presentationProfile=='official-assets-first' and spec~=nil
    return compact and concise or spec,compact
end
function M.dialog(self,panel)
    local spec,compact=confirmation(self)
    dialogGeometry(panel,compact)
    local message=self.run and '确认退出游戏？退出后本局结束，进度无法恢复。\n将进入平台结算，随后可选择离开。'
        or '确认结束当前关卡？\n将进入平台结算，随后可选择离开。'
    if self.mode=='victory' then message='确认结束本局并结算胜利？\n随后可在平台结算页选择离开。' end
    panel:GetChild('title').text=spec and spec.title or '退出游戏？'
    panel:GetChild('message').text=spec and spec.message or message
    for _,state in ipairs({'normal','hover','pressed','disabled'})do
        panel:GetChild('confirm'):GetChild('hit'):GetChild(state):GetChild('label').text=spec and spec.label or '退出并结算'
        panel:GetChild('cancel'):GetChild('hit'):GetChild(state):GetChild('label').text='取消'
    end
    local why=panel:GetChild('whyText')
    why.text=not compact and self.run and self.mode~='victory' and sessionHint or ''
    why:SetVisible(why.text~='')
end
function M.title(self,menu,outcome,v25)
    menu:GetChild('titleQuit'):SetVisible(not outcome)
    local resume=menu:GetChild('continueRun')
    resume:SetVisible(not outcome and self.sessionPaused==true and not self.settlementRequested)
    v25.button(resume,not self.disabled and not self.exitOpen and not self.characterOpen and not self.settlementBusy)
    menu:GetChild('sessionHint').text=Theme.presentationProfile~='official-assets-first' and not outcome and self.sessionPaused and sessionHint or ''
end
local function compact(menu,routeEnabled,mainEnabled)
    local R=Theme.layout.runMenu
    local step=R.help[2]-R.map[2]
    local upperGap=(routeEnabled and 0 or step)+(mainEnabled and 0 or step)
    local gap=upperGap+(mainEnabled and 0 or step)
    local function at(name,spec,dy)menu:GetChild(name):SetAnchoredPosition(spec[1],spec[2]+dy)end
    at('rule',R.rule,upperGap);at('abandon',R.abandon,upperGap);at('dismissHint',R.dismissHint,gap)
    at('mainMenu',R.mainMenu,routeEnabled and 0 or step)
    at('quit',R.quit,gap)
    for _,name in ipairs({'border','face','catch'})do
        local c=menu:GetChild(name)
        c:SetAnchoredPosition(R.panel[1],R.panel[2]+gap/2)
        local inset=name=='face' and Theme.space.border*2 or 0
        c:SetSizeDelta(R.panel[3]-inset,R.panel[4]-gap-inset)
    end
end
local function showRunOptions(menu,show)
    for _,name in ipairs({'border','face','catch','title','resume','help','rule','abandon','dismissHint'}) do
        menu:GetChild(name):SetVisible(show)
    end
    menu:GetChild('catch').raycastTarget=show
end
function M.runMenu(self,menu,routeEnabled)
    local minimal=Navigation.minimalRunMenu(self)
    showRunOptions(menu,not minimal)
    if minimal then routeEnabled=false end
    local hasRun=Navigation.hasRun(self)
    local mainEnabled=hasRun and not self.sessionPaused
    menu:GetChild('mainMenu'):SetVisible(mainEnabled)
    menu:GetChild('quit'):SetVisible(mainEnabled and not minimal)
    for _,state in ipairs({'normal','hover','pressed','disabled'})do
        menu:GetChild('abandon'):GetChild('hit'):GetChild(state):GetChild('label').text=hasRun and '放弃本局' or '退出游戏'
    end
    local route=menu:GetChild('map')
    route:SetVisible(routeEnabled)
    route:GetChild('hit').interactable,route:GetChild('hit').raycastTarget=routeEnabled,routeEnabled
    if minimal then
        local R=Theme.layout.runMenu
        menu:GetChild('mainMenu'):SetAnchoredPosition(R.panel[1],R.title[2]-20)
    else
        compact(menu,routeEnabled,mainEnabled)
    end
end
return M
