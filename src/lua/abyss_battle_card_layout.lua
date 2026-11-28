-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Run = require("abyss_run")
local Theme = require("abyss_theme")
local Viewport = require('abyss_viewport')
local M = {}
local L = Theme.layout
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, _ownership, host, _dependencies)
    local R = L.rewardPick
    local function placeHandHit(box, point, scale)
        local angle=box.localRotationZ
        local x,y,width,height=Viewport.handHit(point[2],angle,scale,point)
        local hit = box:GetChild('hit')
        hit:SetAnchoredPosition(x,y)
        hit:SetSizeDelta(width,height)
        hit:SetLocalScale(1,1,1)
        hit.localRotationZ = -angle
    end
    local function placeCard(box, count, index, selected, measureOnly)
        local x, baseY, angle, spacing = Viewport.handSlot(count, index, owner.handWidthExtra)
        local y = selected and Viewport.handFocus(baseY) or baseY
        local laneWidth=count>1 and spacing or nil
        local point={x,y,baseY=baseY,restAngle=angle,hitWidth=laneWidth,hot=selected}
        if measureOnly then return point end
        box:SetAnchoredPosition(x, y)
        local scale = selected and Theme.motion.hoverScale or 1
        box:SetLocalScale(scale, scale, 1)
        box.localRotationZ = selected and 0 or angle
        placeHandHit(box,point,scale)
        box:GetChild("glow"):SetVisible(selected)
        box:SetAsLastSibling()
        return point
    end
    local function rewardTarget(slot)
        local hot = owner.hover == slot
        return hot and R.hoverScale or R.scale, hot and R.hoverLift or 0
    end
    local function placeReward(box, count, index, anim, hot)
        local hit = box:GetChild('hit')
        hit:SetAnchoredPosition(0,0)
        hit:SetSizeDelta(L.card.size[1],L.card.size[2])
        hit:SetLocalScale(1,1,1)
        hit.localRotationZ = 0
        local x = (index - 1 - (count - 1) / 2) * R.step
        box:SetAnchoredPosition(x, R.y + anim.lift + anim.rise)
        box:SetLocalScale(anim.scale, anim.scale, 1)
        box.localRotationZ = 0
        box:GetChild("glow"):SetVisible(hot)
        -- Later siblings draw on top: neighbours first, the hovered card last.
        if not hot then box:SetAsLastSibling() end
        return {x, R.y}
    end
    local function canHover()
        return owner.active and not owner.busy and not owner.gesture and not owner.carry
    end
    local function hoverCard(run,slot)
        if not run or not slot then return end
        if run.phase=='combat' and run.combat.phase=='player' then return run.combat.hand[slot] end
        if run.phase=='reward' and owner.rewardScreen=='cards' then return nil,Run.rewardOptions(run)[slot] end
    end
    function owner:setHover(slot, full)
        local run = self.run
        local hand,reward = hoverCard(run,slot)
        if slot and not (canHover() and (reward or hand)) then slot,hand = nil,nil end
        if self.hover == slot then return end
        self.hover = slot
        self.handHover = hand and {run=run,battle=run.combat,turn=run.combat.turn,slot=slot,uid=hand.uid}
        if full then return self:render() end
        if not host.cardView.refreshHover() then return self:render(true) end
        if self.info then self:renderDetailsOnly() end
    end
    return {
        placeCard=placeCard, rewardTarget=rewardTarget, placeReward=placeReward, canHover=canHover
    }
end
return M
