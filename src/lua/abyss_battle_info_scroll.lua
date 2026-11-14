-- Read-only rows for the native Grid. Native scrolling, clipping and recycling
-- stay engine-owned; click-only readers retain the existing page controls.
local Theme=require('abyss_theme')
local I,C=Theme.layout.statusInfo,Theme.color
local M={}

local function appendText(rows,text,font,colour,icon)
    if not text or text==''then return end
    local width=I.width-I.pad*2-I.icon-I.gap-20
    local limit=math.max(1,math.floor(width/font))
    local line,used='',0
    local function flush()
        if line~=''then rows[#rows+1]={text=line,font=font,colour=colour,icon=icon};icon=nil end
        line,used='',0
    end
    for glyph in text:gmatch('[%z\1-\127\194-\244][\128-\191]*')do
        local amount=glyph:byte()<128 and .55 or 1
        if glyph=='\n' then flush()
        else
            if used+amount>limit then flush()end
            line,used=line..glyph,used+amount
        end
    end
    flush()
end

function M.rows(card)
    local rows={}
    for _,section in ipairs(card.sections)do
        appendText(rows,section.label,Theme.font.label,section.colour or C.textDim)
        for _,row in ipairs(section.rows)do
            local icon=row.icon or row.status and Theme.icon.status[row.status]
            if type(icon)=='string'then icon=Theme.icon.intent[icon]end
            appendText(rows,row.name,Theme.font.label,row.colour,icon)
            appendText(rows,row.tag,Theme.font.small,C.textDim)
            appendText(rows,row.text,Theme.font.reading,C.text)
            appendText(rows,row.note,Theme.font.reading,C.textDim)
        end
    end
    appendText(rows,card.empty,Theme.font.label,C.textMuted)
    return rows
end

function M.footer(card)
    local buffs,debuffs=0,0
    for _,section in ipairs(card.sections)do
        if section.label=='增益'then buffs=#section.rows
        elseif section.label=='减益'then debuffs=#section.rows end
    end
    return '增益'..buffs..' / 减益'..debuffs..' · 滑动 · 点此分页'
end

local function identity(rows)
    local parts={}
    for _,row in ipairs(rows)do
        parts[#parts+1]=row.text..'/'..row.font..'/'..tostring(row.icon)..'/'..tostring(row.colour)
    end
    return table.concat(parts,'\n')
end

function M.new(owner,panel,picture,ink,tint)
    local grid=panel:GetChild('statusGrid')
    local state={generation=0}
    local function current(info,generation)
        local battle=owner.run and owner.run.combat
        local actor=battle and(info.index==0 and battle.player or battle.enemies[info.index])
        return grid.alive~=false and owner.active and owner.info==info
            and owner.run.phase=='combat' and battle==info.battle and actor~=nil and actor==state.actor and actor.id==info.id and state.generation==generation
    end
    local function fill(control,row)
        if control.alive==false or not row then return end
        local text,icon=control:GetChild('text'),control:GetChild('icon')
        text.text,text.fontSize,text.minimumFontSize=row.text,row.font,row.font
        ink(text,row.colour or C.text)
        icon:SetVisible(row.icon~=nil)
        if row.icon then picture(icon,row.icon);tint(icon,row.colour or C.text)end
    end
    function state.available(_)
        return grid and grid.alive~=false and type(grid.RefreshItems)=='function'
    end
    function state:hide()
        self.generation=self.generation+1
        self.info,self.rows,self.pending=nil,nil,nil
        if grid and grid.alive~=false then grid:SetVisible(false)end
    end
    function state:update()
        local request=self.pending
        if not request then return end
        self.pending=nil
        if not current(request.info,request.generation)then return end
        self.base=request.base
        local rows=self.rows
        grid:RefreshItems(#rows,function(control,index)
            if current(request.info,request.generation)then fill(control,rows[index-request.base+1])end
        end)
    end
    function state:render(info,card,geometry,height)
        grid:SetAnchoredPosition(geometry.x,geometry.cursor-height/2)
        grid:SetSizeDelta(geometry.inner,height)
        grid:SetVisible(true)
        local rows=M.rows(card)
        local signature=identity(rows)
        local battle=owner.run.combat
        local actor=info.index==0 and battle.player or battle.enemies[info.index]
        if self.info==info and self.signature==signature and self.actor==actor then return end
        local changed=self.info~=info
        self.generation=self.generation+1
        self.info,self.rows,self.signature,self.actor=info,rows,signature,actor
        local generation=self.generation
        if changed then grid.scrollProgress=0 end
        if self.base~=nil then
            local base=self.base
            grid:RefreshItems(#rows,function(control,index)
                if current(info,generation)then fill(control,rows[index-base+1])end
            end)
            return
        end
        -- One item calibrates the real native 0/1 index base. Complete refresh is
        -- deferred to update, never re-entered from a native callback.
        grid:RefreshItems(#rows>0 and 1 or 0,function(control,index)
            if not current(info,generation)then return end
            self.pending={info=info,generation=generation,base=index}
            fill(control,rows[1])
        end)
    end
    return state
end
return M
