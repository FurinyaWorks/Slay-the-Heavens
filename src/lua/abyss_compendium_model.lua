-- Detached display projection of the pinned compendium groups. Never a Run.
local M={}
M.colors={'red','green','blue','purple','colorless','curse'}
M.colorNames={red='红色',green='绿色',blue='蓝色',purple='紫色',colorless='无色',curse='诅咒'}
M.rarities={relics={'starter','common','uncommon','rare','boss','special','shop'},potions={'common','uncommon','rare'}}
M.rarityNames={starter='初始',common='普通',uncommon='罕见',rare='稀有',boss='首领',special='特殊',shop='商店'}
local rarity={basic=0,special=1,common=2,uncommon=3,rare=4,curse=5}
local types={attack=1,skill=2,power=3,status=4,curse=5}
-- Constructor cardsToPreview, not a guess from an effect that creates a card.
-- Source identities and exact constructor lines are in the parity receipt.
M.previews={power_through={id='wound'},wild_strike={id='wound'},reckless_charge={id='dazed'},
    immolate={id='burn'},blade_dance={id='shiv'},cloak_and_dagger={id='shiv'},
    infinite_blades={id='shiv'},alpha={id='beta'},beta={id='omega'},reach_heaven={id='through_violence'},
    carve_reality={id='smite'},deceive_reality={id='safety'},evaluate={id='insight'},pray={id='insight'},
    overclock={id='burn'},turbo={id='void'},deus_ex_machina={id='miracle'},accuracy={id='shiv'},
    collect={id='miracle',upgraded=true},storm_of_steel={id='shiv',followParent=true},conjure_blade={id='expunger'},
    battle_hymn={id='smite'},study={id='insight'}}
local function key(row,mode)
    if mode=='rarity'then return rarity[row.rarity]or 9 end
    if mode=='type'then return types[row.type]or 9 end
    if mode=='cost'then return row.definition.cost end
    return row.name
end
function M.sourceRow(row)
    if row.id~='expunger'or row.compendiumConstructor==true then return row end
    local first,last=row.text:find('共 0 次',1,true)
    assert(first and not row.text:find('共 0 次',last+1,true),'Expunger constructor display identity changed')
    local copy={};for key_,value in pairs(row)do copy[key_]=value end
    -- The constructor DESCRIPTION is distinct from setX's EXTENDED_DESCRIPTION.
    -- The public original card image confirms literal X. Never project the
    -- inherited field (-1), provider fallback (0), or a guessed paid X as fact.
    copy.text=row.text:sub(1,first-1)..'共 X 次'..row.text:sub(last+1)
    copy.compendiumConstructor=true
    return copy
end
function M.cards(rows,color,mode,ascending)
    local result={}
    for _,row in ipairs(rows)do
        local group=row.type=='curse'and'curse'or row.color or 'colorless'
        if group==color then result[#result+1]=row end
    end
    result=M.sort(result,'name',true)
    return M.sort(result,mode,ascending)
end
function M.sort(rows,mode,ascending)
    local result,order={},{}
    for i,row in ipairs(rows)do result[i]=row;order[row]=i end
    table.sort(result,function(a,b)
        local x,y=key(a,mode),key(b,mode)
        if x==y then return order[a]<order[b]end
        if ascending then return x<y end
        return x>y
    end)
    return result
end
function M.sections(rows,kind)
    local result,groups={},{}
    local order={}
    if kind=='potions'then
        for i,row in ipairs(require('abyss_potion_random').pool('ironclad'))do order[row.id]=i end
    end
    for _,rarity_ in ipairs(M.rarities[kind])do
        local group={}
        for _,row in ipairs(rows)do if row.rarity==rarity_ then group[#group+1]=row end end
        if kind=='relics'then group=M.sort(group,'name',true)
        else table.sort(group,function(a,b)return assert(order[a.id],'missing source potion order')<assert(order[b.id],'missing source potion order')end)end
        groups[rarity_]=group
        result[#result+1]={heading=M.rarityNames[rarity_],rarity=rarity_}
        for first=1,#group,10 do
            local line={rarity=rarity_,entries={}}
            for index=first,math.min(first+9,#group)do line.entries[#line.entries+1]={row=group[index],index=index}end
            result[#result+1]=line
        end
        result[#result+1]={}
    end
    return result,groups
end
function M.cardPages(row)
    row=M.sourceRow(row)
    local Theme=require('abyss_theme')
    local box=Theme.layout.card.textBox
    local scale,font=Theme.layout.compendium.popupScale,Theme.layout.compendium.popupBodyFont
    local selected,fits=require('abyss_card_display').fit(row.text,font,box[1]*scale,box[2]*scale,1.3,1)
    if fits and selected==font then return {row.text}end
    return M.pages(row.text,{detailColumns=math.max(1,math.floor(box[1]*scale/font)-1),
        detailLines=math.max(1,math.floor(box[2]*scale/(font*1.3))-1),detailCharacters=160})
end
function M.keywordRows(row,data)
    local words={}
    for _,status in ipairs(data.statuses.statuses)do
        local at=row.text:find(status.name,1,true)
        if at and status.description then words[#words+1]={at=at,name=status.name,text=status.description}end
    end
    local traits={
        {'消耗','打出后移出本场战斗，不进入弃牌堆。'},
        {'虚无','回合结束时若仍在手中，将被消耗。'}}
    for _,trait in ipairs(traits)do
        local at=row.text:find(trait[1],1,true)
        if at then words[#words+1]={at=at,name=trait[1],text=trait[2]}end
    end
    table.sort(words,function(a,b)return a.at<b.at end)
    return words
end
function M.keywords(row,data)
    local text={};for _,word in ipairs(M.keywordRows(row,data))do text[#text+1]=word.name..'\n'..word.text end
    return table.concat(text,'\n\n')
end
function M.tipMeasure(text)
    local layout=require('abyss_theme').layout.compendium.tip
    local font,lines=layout.font,1
    local display=require('abyss_card_display')
    while true do
        local height=lines*font*1.3+8
        local selected,fits=display.fit(text,font,layout.bodyWidth,height,1.3,1)
        if fits and selected==font then return height,height+50.666666666666664 end
        lines=lines+1;assert(lines<100,'unbounded static compendium tooltip')
    end
end
function M.tipPages(rows,startY)
    startY=startY or-80
    local pages,page,anchor={}, {}, startY
    for _,row in ipairs(rows)do
        local body,height=M.tipMeasure(row.text)
        if #page>0 and(anchor+21.333333333333332-height < -340 or #page>=4)then
            pages[#pages+1]=page;page={};anchor=startY
        end
        page[#page+1]={row=row,body=body,height=height,anchor=anchor}
        anchor=anchor-height-3.2
    end
    if #page>0 then pages[#pages+1]=page end
    return #pages>0 and pages or {{}}
end
function M.cardPosition(index,count,progress)
    local layout=require('abyss_theme').layout.compendium
    local width,height=table.unpack(layout.cardCell)
    local dx,dy=table.unpack(layout.cardSpacing)
    local columns=layout.cardColumns;local rows=math.ceil(count/columns)
    local content=16+rows*height+math.max(0,rows-1)*dy
    local x=-layout.list[3]/2+8+width/2+(index-1)%columns*(width+dx)
    local y=layout.list[2]+layout.list[4]/2-8-height/2-math.floor((index-1)/columns)*(height+dy)
    return x,y+math.max(0,content-layout.list[4])*(progress or 0)
end
function M.hoverLayout(x,y,keywords)
    local width=require('abyss_theme').layout.compendium.tip.width
    local left,previewX
    if x>320 then left=x-108-width;previewX=x+190.66666666666666
    else left=x+108;previewX=x-190.66666666666666 end
    local anchor=y+118.66666666666667
    if keywords>=4 then anchor=anchor+(keywords-1)*41.333333333333336 end
    return left,anchor,previewX,y+28
end
function M.pages(text,layout)
    local chars=require('abyss_prologue').chars(text)
    local pages,first,column,lines={},1,0,1
    for i,char in ipairs(chars)do
        if char=='\n' then column=0;lines=lines+1
        else column=column+1;if column>=layout.detailColumns then column=0;lines=lines+1 end end
        if lines>layout.detailLines or i-first+1>=layout.detailCharacters then
            pages[#pages+1]=table.concat(chars,'',first,i);first,column,lines=i+1,0,1
        end
    end
    if first<=#chars then pages[#pages+1]=table.concat(chars,'',first)end
    return #pages>0 and pages or {''}
end
return M
