-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local M = {}
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, _ownership, host, dependencies)
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
    function owner:render(presentationOnly, deckCoversHand)
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
    end
    return {
    }
end
return M
