-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Theme = require("abyss_theme")
local M = {}
local pileIcons = {"drawIcon","discardIcon","exhaustIcon"}
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, ownership, host, dependencies)
    local renderDepth, cleared = 0, false
    local function feedbackRetired(view)
        local feedback=view.feedback
        return not view.busy and not view.feedbackRun and not view.feedbackBattle
            and not feedback.busy and not feedback.idleBattle and not feedback.battle
    end
    local function unowned(view)
        return not view.active and not view.run and not view.viewRun and not view.viewBattle
            and not view.displayBattle and not view.suspendedBattle and feedbackRetired(view)
            and not view.gesture and not view.carry and not view.help and not view.info and not view.potionAim
    end
    local function retiredControlsHidden()
        -- These surfaces hide through their own views rather than the shared
        -- visibility setter. A refused hide must leave full rendering enabled.
        local stage=host.stage
        if stage:GetChild("statusInfo").visible or stage:GetChild("statusDismiss").visible then return false end
        local potionHelp=stage:GetChild("potionHelp")
        if potionHelp:GetChild("potionPopup").visible or stage:GetChild("energyIcon"):GetChild("light").visible then return false end
        for i=1,10 do if stage:GetChild("card"..i).visible then return false end end
        for i=1,Theme.layout.battlePotions.count do
            if potionHelp:GetChild("potionCaption"..i).visible then return false end
        end
        for _,name in ipairs(pileIcons) do if stage:GetChild(name):GetChild("hit").visible then return false end end
        return true
    end
    function owner:hasClearedHiddenProjection()
        return cleared and renderDepth==0 and not ownership.projectionRejected and unowned(self)
    end
    -- Detail changes reuse native controls; mutable content is queried on each paint.
    -- Preserve the explicit render's pointer invalidation and validity checks.
    function owner:renderDetailsOnly(full)
        local run=self.run
        if full or self.busy or self.gesture or self.carry or self.potionAim
            or self.viewRun~=run or self.viewBattle~=(run and run.combat) then return self:render() end
        run=dependencies.prepareRenderInputs(self)
        if not dependencies.renderFeedbackReady(run) then return end
        dependencies.renderDetails(dependencies.renderFrame(run))
    end
    local function project(self, presentationOnly, deckCoversHand)
        local run = dependencies.prepareRenderInputs(self, presentationOnly)
        if not dependencies.renderFeedbackReady(run) then return end
        dependencies.syncRenderIdentity(run)
        local frame = dependencies.renderFrame(run)
        dependencies.syncRewardOwner(frame)
        dependencies.syncRewardEntrance(frame)
        dependencies.prepareRenderPotions(frame)
        dependencies.renderStartControls(frame)
        dependencies.rewardNavigation(frame)
        dependencies.renderRewardRows(frame)
        dependencies.renderRewardButtons(frame)
        dependencies.renderPotionReward(frame)
        dependencies.renderRewardStage(frame)
        dependencies.renderPlayArea(frame)
        dependencies.renderHudVisibility(frame)
        dependencies.renderPlayerTotals(frame)
        dependencies.renderSceneHeading(frame)
        dependencies.renderEnergy(frame)
        dependencies.renderPilesAndTurn(frame)
        dependencies.renderResult(frame)
        dependencies.renderEnemies(frame)
        local playable
        if deckCoversHand and not self.active and self.suspendedBattle and self.suspendedBattle==frame.battle then
            -- Input and actors still retire through this render. The retained
            -- hand will be projected from current state when browsing closes.
            host.cardView.suspendHand()
        else
            playable=host.cardView.renderCards(self.data,self.presentation,frame.battle,frame.fighting,frame.active,frame.reward,frame.picking)
        end
        host.cardView.renderDrag()
        dependencies.renderDetails(frame)
        dependencies.button("endTurn", frame.active == true, not playable)
        dependencies.renderRewardActions(frame)
        dependencies.renderContinue(frame)
        if host.potionPopup then host.potionPopup:render() end
        dependencies.renderPotions(frame)
        return not run and not frame.battle and not self.active and retiredControlsHidden()
    end
    function owner:render(presentationOnly, deckCoversHand)
        cleared=false
        if renderDepth==0 then ownership.projectionRejected=nil end
        renderDepth=renderDepth+1
        local ok,empty=pcall(project,self,presentationOnly,deckCoversHand)
        renderDepth=renderDepth-1
        if not ok then error(empty,0) end
        -- A nested projection cannot confirm the outer frame's native writes.
        cleared=renderDepth==0 and empty and unowned(self)
    end
    return {
    }
end
return M
