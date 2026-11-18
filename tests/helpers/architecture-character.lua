local Data=require('abyss_data')
local Copy=require('abyss_copy').copy
local Profiles=require('abyss_character_profiles')
local Presentation=require('abyss_character_presentation')
local Existing=require('abyss_presentation')
local function observe(label,value)CHARACTER_GRAPH_WRITE(value,label)end
for _,id in ipairs({'ironclad','silent','defect','watcher'})do
 local input=Copy(Data)
 local prepared,profile=Profiles.prepare(input,id)
 assert(prepared~=input and input.experimentalCharacter==nil)
 observe(id..':profile',{input=input,prepared=prepared,profile=profile})
 local display=Presentation.prepare(Existing,prepared)
 observe(id..':display',{prepared=prepared,profile=profile,display=display,existing=Existing})
end
local function refusal(label,fn)
 local ok,result=pcall(fn);assert(not ok,'expected refusal '..label)
 if type(result)=='string'then result=result:gsub('^.-:%d+: ','')end
 observe(label,{ok=ok,error=result})
end
for _,id in ipairs({'missing','ironclad','silent','defect','watcher'})do
 refusal('invalid-data:'..id,function()return Profiles.prepare(false,id)end)
end
refusal('prepared-data',function()local d=Copy(Data);d.experimentalCharacter='silent';return Profiles.prepare(d,'silent')end)
refusal('invalid-presentation',function()return Presentation.prepare(false,false)end)
refusal('duplicate-presentation',function()local d=Profiles.prepare(Data,'silent');d.cards.cards[#d.cards.cards+1]=d.cards.cards[1];return Presentation.prepare(Existing,d)end)
