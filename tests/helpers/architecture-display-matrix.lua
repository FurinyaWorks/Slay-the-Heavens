local Display=require('abyss_original_v4_display')
local Colorless=require('abyss_colorless_cards')
local Potions=require('abyss_potion_text')
local copy=require('abyss_copy').copy
local cases=0
local function record(label,fn,...)
    local result=table.pack(pcall(fn,...))
    local parts={label}
    for i=1,result.n do
        local value=tostring(result[i]):gsub('(src/lua/[%w_]+%.lua):%d+:','%1:<line>:')
        parts[#parts+1]=string.format('%q',value)
    end
    print(table.concat(parts,'\t'));cases=cases+1
end
for _,raw in ipairs(DISPLAY_CARDS)do
    for _,upgraded in ipairs({false,true})do
        record(raw.id..':describe:'..tostring(upgraded),Display.describe,raw,upgraded)
        record(raw.id..':brief:'..tostring(upgraded),Display.brief,raw,upgraded)
        record(raw.id..':preview:'..tostring(upgraded),Display.brief,raw,upgraded,
            {originalV4=true,{op='damage',actual=3},{op='block',low=2}})
        record(raw.id..':face:'..tostring(upgraded),Display.faceText,raw,upgraded)
        record(raw.id..':coloured:'..tostring(upgraded),Display.faceText,raw,upgraded,
            {snapshot={eye=true,musou=false,not_musou=true,resolve3=true}},{gold='#123456',dim='#987654'})
    end
end
for _,role in ipairs({'HT','AR','FR','RD','unknown'})do
    for _,mode in ipairs({'ousia','pneuma'})do
        for _,amount in ipairs({0,1,3})do
            record('summary:'..role..':'..mode..':'..amount,Display.summary,{originalV4={role=role,mode=mode,
                infuse=amount,chargedUsed=amount,bond=amount,fan=amount,fanGained=amount,
                guests={usher=amount,chevalmarin=amount,crabaletta=amount},singer=amount,
                revelry={uses=amount,ends=amount,bonus=amount},resolve=amount,resolveGained=amount,
                eye={uses=amount,ends=amount},musou={uses=amount,ends=amount},musouRefunded=amount,
                healUsed=amount,nextEnergy=amount,nextDraw=amount,nextBlock=amount,
                bonus={n=amount,tag='normal'},counter=amount,soften=amount},enemies={
                    {hp=5,name='甲',v4Bloom={strength=amount,ticks=amount},v4Directive={mature=amount>1}},
                    {hp=0,name='乙',v4Bloom={strength=2,ticks=1}},{hp=2,escaped=true},
                    {hp=3,v4Directive={mature=false}}}})
        end
    end
end
record('summary:nil',Display.summary,nil)
record('summary:no-original',Display.summary,{})
for _,raw in ipairs({false,{}, {base={effects={{op='missing'}}},requirements={},category='skill'}})do
    record('invalid:describe',Display.describe,raw)
    record('invalid:brief',Display.brief,raw)
    record('invalid:face',Display.faceText,raw)
end
local catalog=require('abyss_colorless_catalog').withCards({cards={cards={}},statuses={statuses={}}})
for _,card in ipairs(catalog.cards.cards)do
    for _,upgraded in ipairs({false,true})do
        local variant=copy(card)
        if upgraded then for k,v in pairs(card.upgrade or {})do variant[k]=copy(v)end end
        for _,dynamic in ipairs({false,true})do record('colorless:'..card.id..':'..tostring(upgraded)..':'..tostring(dynamic),Colorless.describe,variant,dynamic)end
    end
end
for _,effect in ipairs({{op='missing',value=1},{op='colorless',kind='missing',value=1},{op='gainStatus',status='missing',value=1}})do
    record('colorless:invalid',Colorless.describe,{id='invalid',effects={effect}})
end
local effects={}
for _,kind in ipairs({'focus','capacity','darkness','miracle','divinity','stance','unknown'})do effects[#effects+1]={op='classPotion',kind=kind,value=2}end
for _,op in ipairs({'silentShivs','silentGhost','discover','generatePotions','fatalRevive','damage','damageAll','block','energy','draw',
    'upgradeHand','healPercent','increaseMaxHp','exhaustMany','discardRedraw','discardToHand','randomizeHandCost','escape',
    'playTopCards','gainTemporaryStrength','gainTemporaryDexterity','gainStatus','applyStatus','unknown'})do
    effects[#effects+1]={op=op,value=2,status='strength',kind='skill'}
end
for i,effect in ipairs(effects)do
    local item={id='probe',effects={effect}}
    for _,bark in ipairs({false,true})do
        for _,context in ipairs({{}, {potionCapacity=5},{potionSlots=4},{rules={player={potionSlots=2}}}})do
            local owner=copy(context)
            owner.relics=bark and {'SacredBark'}or {}
            owner.data={potions={potions={item}},statuses={statuses={{id='strength',name='力量',stack='intensity'}}},rules={player={potionSlots=6}}}
            local label='potion:'..i..':'..tostring(bark)..':'..tostring(owner.potionCapacity or owner.potionSlots or 0)
            record(label..':short',Potions.special,item,owner,false)
            record(label..':long',Potions.special,item,owner,true)
            record(label..':shop',Potions.shop,item,owner)
            record(label..':describe',Potions.describe,owner,'probe')
        end
    end
end
record('potion:empty',Potions.special,{})
record('potion:unknown',Potions.describe,{data={potions={potions={}},statuses={statuses={}}}},'missing')
-- Ordinary field proxies detect eager reads or reordered lazy predicates.
local function traced(fields,label,reads)
    return setmetatable({}, {__index=function(_,key)
        reads[#reads+1]=label..'.'..tostring(key)
        return fields[key]
    end})
end
for _,effect in ipairs({{op='damage',value=7},{op='gainStatus',status='artifact',value=1},
    {op='colorless',kind='ritual',value=2,damage=15},{op='colorless',kind='unknown',value=2}})do
    for _,dynamic in ipairs({false,true})do
        local reads={}
        local card=traced({id='probe',effects={traced(effect,'effect',reads)},innate=true,exhaust=true,ethereal=true},'card',reads)
        record('colorless:read-order',Colorless.describe,card,dynamic)
        print('READ_TRACE '..table.concat(reads,','))
    end
end
for _,effect in ipairs({{op='classPotion',kind='focus',value=2},{op='discover',kind='skill',value=2},
    {op='generatePotions',value=2},{op='fatalRevive',value=2},{op='unknown',value=2}})do
    for _,expanded in ipairs({false,true})do
        local reads={}
        local item={effects={traced(effect,'effect',reads)}}
        local owner=traced({relics={},potionSlots=4},'owner',reads)
        record('potion:read-order',Potions.special,item,owner,expanded)
        print('READ_TRACE '..table.concat(reads,','))
    end
end
print('ARCHITECTURE_DISPLAY_MATRIX '..cases)
