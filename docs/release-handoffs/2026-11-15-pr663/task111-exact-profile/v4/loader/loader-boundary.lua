local rawRequire=require
local attempts=0
function require(name)
 if name=='abyss_original_v4_data' then attempts=attempts+1 end
 return rawRequire(name)
end
local Data=require('abyss_data')
local Run=require('abyss_run')
local Select=require('abyss_character_select')
local Presentation=require('abyss_presentation')
local roles={'hutao','arlecchino','furina','raiden'}
for _,profile in ipairs({'production','competition-candidate','alpha'})do
 local state=Select.new(Data,Presentation,profile)
 for _,role in ipairs(roles)do assert(not state:select(role)) end
 assert(state:select('traveler') and state.info.id=='ironclad')
end
for _,role in ipairs(roles)do
 local ok,err=pcall(Run.new,Data,'1',{character=role,experimental=true,campaign=true,campaignProfile='competition-two-act'})
 assert(not ok and tostring(err):find('competition_character_unavailable',1,true))
end
for _,field in ipairs({'experimentalCharacter','characterId','originalV4Role'})do
 local forged={};for k,v in pairs(Data)do forged[k]=v end;forged[field]='raiden'
 local ok,err=pcall(Run.new,forged,'1',{experimental=true,campaign=true,campaignProfile='competition-two-act'})
 assert(not ok and tostring(err):find('competition_character_unavailable',1,true))
end
assert(attempts==0,'public rejection touched omitted data')
local geo=Run.new(Data,'1',{character='ironclad',experimental=true,campaign=true,campaignProfile='competition-two-act'})
assert(geo and not geo.data.originalV4Role and attempts==0)
print('PUBLIC_BOUNDARY_PASS: 12 selector rejects; 4 Run option rejects; 3 marker rejects; Geo Run created; V4 loads=0')
local start=attempts
local ok,err=pcall(Run.new,Data,'1',{character='raiden',experimental=true,campaign=true,campaignProfile='full-source'})
assert(attempts>start,'negative route did not reach V4 loader')
if EXPECT_OMIT then assert(not ok and tostring(err):find("module 'abyss_original_v4_data' not found",1,true)) else assert(ok,tostring(err)) end
print('FULL_SOURCE_CONTROL',ok,'V4 load attempts',attempts)
