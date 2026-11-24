-- Read existing checkpoint identities without storing or reproducing the old labels.
-- Only the previously shipped exact identity fingerprints have migration entries.
local M={}
local aliases={
    ['900170739:1286980596']='Raven Adept',
    ['469335252:1806456488']='Blue Guard',
    ['1896667623:478596501']='Red Guard',
    ['1686122363:1694361660']='Raven Adept and Chosen',
    ['1786529214:436242958']='3 Raven Adepts',
    ['1750590974:1509637266']='Arena Guards',
    ['1568541488:1333913831']='Tactical Badge',
    ['1726222432:144695210']='ArenaCollar',
    ['1583126269:182537437']='raven_adept_solo',
    ['972423885:364502624']='blue_guard_solo',
    ['2071484289:1517985881']='red_guard_solo',
}

function M.resolve(value)
    if type(value)~='string' or #value>30 then return value end
    local first,second=0,0
    for index=1,#value do
        local byte=value:byte(index)
        first=(first*131.0+byte)%2147483647
        second=(second*137.0+byte)%2147483629
    end
    return aliases[string.format('%.0f:%.0f',first,second)] or value
end
return M
