-- Inputs are frozen Git blobs injected by generate.mjs, never current build output.
local function json(value)
 if type(value)=='string' then
  return '"'..value:gsub('\\','\\\\'):gsub('"','\\"'):gsub('\n','\\n'):gsub('\r','\\r'):gsub('\t','\\t')..'"'
 elseif type(value)~='table' then return tostring(value) end
 local parts={}
 if #value>0 then
  for _,v in ipairs(value) do parts[#parts+1]=json(v) end
  return '['..table.concat(parts,',')..']'
 end
 for k,v in pairs(value) do parts[#parts+1]=json(k)..':'..json(v) end
 return '{'..table.concat(parts,',')..'}'
end
local function control()
 local node={children={}}
 function node:GetChild(name) if not self.children[name] then self.children[name]=control() end return self.children[name] end
 function node:SetVisible(value) self.visible=value end
 function node:SetAnchoredPosition(x,y) self.x,self.y=x,y end
 return node
end
local result={}
for _,version in ipairs(INPUT.versions) do
 for _,profile in ipairs(INPUT.profiles) do
  for _,kind in ipairs({'encounter','greet','buy','poor','leave','idle'}) do
   for _,path in ipairs({'tap','auto'}) do
    package.loaded.abyss_theme=profile.theme
    package.loaded.abyss_narrative=INPUT.narrative
    package.loaded.abyss_prologue=assert(load(INPUT.prologue,'@frozen/abyss_prologue.lua'))()
    local module=assert(load(version.source,'@frozen/'..version.label..'/abyss_merchant.lua'))()
    local box=control();local merchant=module.new(box);merchant:setVisible(true)
    if kind=='encounter' then merchant:enter({}) else assert(merchant:react(kind)) end
    merchant.idleUsed=true
    local current=merchant.current
    local pages,taps={},{}
    local clock,nextTap,dt=0,.25,.025
    local function observe()
     if merchant.current~=current then return true end
     local page=current.page
     local row=pages[page]
     if not row then
      if pages[page-1] then pages[page-1].endedAt=clock end
      row={page=page,startedAt=clock,text=''};pages[page]=row
     end
     local text=box:GetChild('line').text
     if row.text~=text then row.finalTextAt=clock end
     row.text=text
     row.lastShown=current.shown
     if current.dismissed then row.endedAt=clock;return true end
     return false
    end
    observe()
    local finished=false
    for _=1,8000 do
     clock=clock+dt;merchant:update(dt)
     if observe() then finished=true;break end
     if path=='tap' and clock+1e-8>=nextTap then
      taps[#taps+1]={time=clock,page=current.page,accepted=merchant:tap()}
      nextTap=nextTap+.25
      if observe() then finished=true;break end
     end
    end
    assert(finished,'capture exceeded simulated time bound')
    pages[#pages].endedAt=clock
    result[#result+1]={version=version.label,profile=profile.label,kind=kind,path=path,
     simulatedSeconds=clock,pages=pages,taps=path=='tap' and taps or nil}
   end
  end
 end
end
print('MERCHANT_REVIEW '..json(result))
