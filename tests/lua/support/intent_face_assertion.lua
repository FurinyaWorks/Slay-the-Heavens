-- Preserve the source primary; TASK-4.4 M08 adds only DEFEND_BUFF's pending buff.
local Theme=require('abyss_theme')
return function(box,face,label)
    if label then assert(face.label==label,'intent wording changed') end
    assert(not box:GetChild('intentLabel').visible,'obsolete face label must stay hidden')
    local badge=box:GetChild('intentBadge')
    local secondary=face.sourceEnum=='DEFEND_BUFF' and face.worldVisible==true
    assert(badge.visible==secondary,'only source DEFEND_BUFF receives the pending buff badge')
    assert(not box:GetChild('intentExtra').visible,'unrelated tooltip rows must stay off the world face')
    local visible=face.sourceEnum and face.worldVisible==true or not face.sourceEnum
    local icon=box:GetChild('intentIcon')
    assert(icon.visible==visible,'original world intent visibility changed')
    if visible then
        assert(icon.imageId==Theme.icon.intent[face.worldKind or face.kind],'original world intent image changed')
    end
    if secondary then
        assert(badge.imageId==Theme.icon.intent.buff,'DEFEND_BUFF secondary must identify the pending buff')
        assert(badge.sizeDeltaX==Theme.layout.intent.badge and badge.sizeDeltaY==Theme.layout.intent.badge)
        assert(math.abs(badge.y-icon.y)<.001 and badge.x-badge.sizeDeltaX/2>=icon.x+icon.sizeDeltaX/2+Theme.space.xs-.001,
            'secondary buff must clear the source primary')
    end
    if face.sourceEnum and face.sourceEnum:sub(1,6)=='ATTACK' then
        assert(face.worldKind=='attack' and face.sourceTexture:match('^INTENT_ATK_[1-7]$'),
            'mixed attacks use the same source damage-tier world image as ATTACK')
    elseif face.sourceEnum=='UNKNOWN' or face.sourceEnum=='STUN' then
        assert(not icon.visible,'UNKNOWN/STUN use source VFX, not a base world image')
    end
end
