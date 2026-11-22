-- Preserve the primary intent and show the distinct effect alongside it.
local Theme=require('abyss_theme')
return function(box,face,label)
    if label then assert(face.label==label,'intent wording changed') end
    assert(not box:GetChild('intentLabel').visible,'obsolete face label must stay hidden')
    local badge=box:GetChild('intentBadge')
    local visible=face.sourceEnum and face.worldVisible==true or not face.sourceEnum
    local secondary=visible and face.badge~=nil
    assert(badge.visible==secondary,'the secondary effect must match the visible intent')
    assert(not box:GetChild('intentExtra').visible,'unrelated tooltip rows must stay off the world face')
    local icon=box:GetChild('intentIcon')
    local kind=face.worldKind or face.kind
    assert(icon.visible==visible,'original world intent visibility changed')
    if visible then
        assert(icon.imageId==Theme.icon.intent[kind],'original world intent image changed')
    end
    if secondary then
        assert(badge.imageId==Theme.icon.intent[face.badge],'secondary must identify its pending effect')
        assert(badge.sizeDeltaX==Theme.layout.intent.badge and badge.sizeDeltaY==Theme.layout.intent.badge)
        local side=kind=='attack' and -1 or 1
        assert(math.abs(badge.y-icon.y)<.001 and (badge.x-icon.x)*side>=(badge.sizeDeltaX+icon.sizeDeltaX)/2+Theme.space.xs-.001,
            'secondary must clear the primary and its damage')
    end
    if face.sourceEnum and face.sourceEnum:sub(1,6)=='ATTACK' then
        assert(face.worldKind=='attack' and face.sourceTexture:match('^INTENT_ATK_[1-7]$'),
            'mixed attacks use the same source damage-tier world image as ATTACK')
    elseif face.sourceEnum=='UNKNOWN' or face.sourceEnum=='STUN' then
        assert(not icon.visible,'UNKNOWN/STUN use source VFX, not a base world image')
    end
end
