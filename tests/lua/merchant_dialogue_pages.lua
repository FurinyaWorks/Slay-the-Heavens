local Theme,Narrative=require('abyss_theme'),require('abyss_narrative')
local Prologue=require('abyss_prologue')
local layout=Theme.layout.merchant
local function control()
 local node={children={}}
 function node:GetChild(name) if not self.children[name] then self.children[name]=control() end return self.children[name] end
 function node:SetVisible(value) self.visible=value end
 function node:SetAnchoredPosition(x,y) self.x,self.y=x,y end
 return node
end
local function merchant(text,budget)
 local old=Narrative.merchant.greet
 Narrative.merchant.greet=text;layout.pageCharacters=budget
 package.loaded.abyss_merchant=nil
 local box=control();local m=require('abyss_merchant').new(box)
 Narrative.merchant.greet=old
 m:setVisible(true);assert(m:react('greet'));m.idleUsed=true
 return m,box:GetChild('line')
end
local function pages(text,budget,automatic)
 local m,line=merchant(text,budget);local out={}
 while true do
  if automatic then m:update(budget/layout.typeRate+.01) else assert(m:tap()) end
  out[#out+1]=line.text
  assert(utf8.len(line.text)<=budget,'page exceeded existing capacity')
  local done=m.current.shown>=#m.current.chars
  if done then break end
  if automatic then m:update(layout.hold+.01) else assert(m:tap()) end
 end
 assert(table.concat(out)=='「'..text..'」','lost or repeated text')
 return out,m,line
end
local failures=0
local function test(name,fn)local ok,err=pcall(fn);print((ok and 'ok 'or'FAIL ')..name);if not ok then print(err);failures=failures+1 end end
local originalBudget=layout.pageCharacters
test('approved greeting keeps its complete first sentence on both native budgets',function()
 for _,budget in ipairs({9,12}) do
  local p=pages(Narrative.merchant.greet,budget)
  print('greet budget '..budget..': '..table.concat(p,' | '))
  assert(p[1]=='「路不好走吧？','complete short sentence included the next sentence opening')
 end
end)
test('short sentences and their closing quotes stay complete when capacity permits',function()
 for _,mark in ipairs({'。','！','？','!','?'}) do
  local p=pages('好'..mark..'可以走了'..mark,9)
  assert(#p==1,'a complete fitting line was split')
  local split=pages('好'..mark..'这是比较长的后续句子'..mark,9)
  assert(split[1]=='「好'..mark,'short complete sentence crossed the page boundary')
 end
 local p=pages('「好。」这是一句较长的话。',9)
 assert(p[1]=='「「好。」','closing quote detached from its sentence')
end)
test('long unpunctuated lines retain the existing hard limit and exact copy',function()
 local text='甲乙丙丁戊己庚辛壬癸甲乙丙丁戊己庚辛壬癸'
 local p=pages(text,9)
 assert(p[1]=='「甲乙丙丁戊己庚辛')
end)
test('tap and automatic progression expose identical complete pages for every real reaction',function()
 for _,budget in ipairs({9,12}) do
  for _,text in pairs(Narrative.merchant) do
   local tap=pages(text,budget,false);local auto=pages(text,budget,true)
   assert(table.concat(tap,'|')==table.concat(auto,'|'),'tap and timer disagree')
  end
 end
end)
test('hidden dialogue pauses and dismissed reaction replays from the same first page',function()
 local m,line=merchant(Narrative.merchant.greet,9)
 assert(m:tap());local first=line.text;local shown=m.current.shown
 m:setVisible(false);m:update(100);assert(not m:tap() and m.current.shown==shown)
 m:setVisible(true);assert(line.text==first)
 while m.current.shown<#m.current.chars do assert(m:tap()) end
 assert(m:tap() and m.current.dismissed)
 assert(m:tap() and not m.current.dismissed and m.current.shown==0)
 assert(m:tap() and line.text==first,'replay did not restart the same first page')
end)
layout.pageCharacters=originalBudget
assert(failures==0,tostring(failures)..' merchant pagination failures')
