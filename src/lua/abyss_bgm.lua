-- Scene signalling only. The platform's per-player BGM node owns playback.
local M = {}
local signals = {
    menu = "ABYSS_BGM_MENU", map = "ABYSS_BGM_MAP", battle = "ABYSS_BGM_BATTLE", elite = "ABYSS_BGM_ELITE",
    boss = "ABYSS_BGM_BOSS", victory = "ABYSS_BGM_VICTORY", defeat = "ABYSS_BGM_DEFEAT", stop = "ABYSS_BGM_STOP",
}
local battleCues = { battle = true, elite = true, boss = true, defeat = true }
function M.scene(mode, run, busy, previous, characterOpen)
    if characterOpen or mode == "menu" then return "menu" end
    -- Terminal rule state may arrive before the last hit. On returning from the
    -- main menu during playback, recover the combat cue from the room.
    if busy and battleCues[previous] then return previous end
    if not busy and (mode == "victory" or mode == "defeat") then return mode end
    if run and (busy or run.phase == "combat") then
        local kind = run.nodeFlow and run.nodeFlow.type
        if kind == "elite" or kind == "boss" then return kind end
        return "battle"
    end
    return "map"
end
function M.new(send)
    local self = {}
    function self.update(owner,cue)
        if not signals[cue] or type(send) ~= "function" then return false end
        if cue == owner.cue then return not owner.error end
        owner.cue = cue -- A broken audio path must not create a retry storm on UI refresh.
        local ok, accepted = pcall(send, signals[cue])
        owner.error = not ok or accepted == false
        return not owner.error
    end
    return self
end
return M
