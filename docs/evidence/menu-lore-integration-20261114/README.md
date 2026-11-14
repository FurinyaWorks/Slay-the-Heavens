# Lore 与菜单标题合流边界复核（2026-11-14）

仅诊断，不合并 Lore，不改变发布范围。

## 精确输入
- 菜单候选：7a1579740c2f5bf7ef63a5637d6a764e36225f39（本地同树 717ae654d1ddb300efef2465460b3024927bcb83）
- Lore #668：89fe65e39c5dd5d0840f833f2a65681ebd43a664
- 标题收尾分支：58fcd3bdb14cc7e3151c3083a9d33a5fc47a0561，尚未纳入本候选。
- `git merge-tree --write-tree 717ae654 89fe65e3` 产生未解决树 fd88577e532adfcac65978f628689d0d96c4488d，五处冲突：narrative.zh-CN.json、tests/game-ui.test.mjs、tests/lore-v2.test.mjs、tests/lua/game_ui.lua、tests/lua/game_ui_prologue.lua。该树不是合并完成的候选。
- 探针所取真实 adapter blob：53487fa914451a62509c01cbda7d9cfaa6f97901。

## 实测与界限
以下最小 mock 对真实 adapter 运行三种 profile，3/3 断言通过：
```text
generic assigned-title=Slay the Heavens visible=true tagline=true
v25-reference assigned-title=Slay the Heavens visible=false tagline=false
official-assets-first assigned-title=Slay the Heavens visible=false tagline=false
TITLE_VISIBILITY_BOUNDARY_PASS 3
```
标题由探针手工赋值。generic adapter 直接返回，保留初始可见性；V25/official 主菜单隐藏通用标题。
结论仅为“赋值或文案断言不等于正式标题可见”，不代表整屏没有图元标题。tagline仅日志观察，不计独立通过项。
未运行完整 presenter、实际布局/渲染或设备；不验证遮挡、标题牌或结果页。不得为使通用文字可见而直接打开叠层。
标题分支以静态图元 titleMark 提供牌形/字形，须与负责人按 #661/#663/#668 依赖协调最终同候选截图。活跃 Lore 分支与原作者改动保留，不抢先集成。

## 重放
保存下方代码为 /tmp/lore-title-probe/probe.lua，准备目录并从上述树提取 adapter：
```sh
mkdir -p /tmp/lore-title-probe
git show fd88577e532adfcac65978f628689d0d96c4488d:src/lua/abyss_v25_menu_view.lua > /tmp/lore-title-probe/adapter.lua
node node_modules/fengari-node-cli/src/lua-cli.js /tmp/lore-title-probe/probe.lua
```
```lua
local Theme={layout={v25Menu={title={0,0,100,40},start={0,0,100,40}},nativeMenu={title={0,0,100,40},resultRestart={0,0,100,40}}},font={display=40},space={border=1},menuPresentation={fontSize=20,labelX=0}}
package.preload.abyss_theme=function()return Theme end
package.preload.abyss_numbers=function()return {integer=tostring}end
local function node()
 local x={visible=true,children={}}
 function x:GetChild(k) if not self.children[k]then self.children[k]=node()end;return self.children[k]end
 function x:SetVisible(v) self.visible=v end
 function x:SetAnchoredPosition()end
 function x:SetSizeDelta()end
 return x
end
local M=dofile('/tmp/lore-title-probe/adapter.lua')
for _,profile in ipairs({'generic','v25-reference','official-assets-first'})do
 Theme.presentationProfile=profile
 local ctx={menu=node(),start=node(),settlement=node(),platform={},owner={mode='menu',motion={}}}
 ctx.menu:GetChild('title').text='Slay the Heavens'
 M.present(ctx,false)
 local visible=ctx.menu:GetChild('title').visible
 assert(visible==(profile=='generic'))
 print(profile..' assigned-title='..ctx.menu:GetChild('title').text..' visible='..tostring(visible)..' tagline='..tostring(ctx.menu:GetChild('tagline').visible))
end
print('TITLE_VISIBILITY_BOUNDARY_PASS 3')

```

独立评审：/root/lore_integration/review_probe，诊断边界 PASS；核对真实 blob 与上述结论，无源码修复或最终 UI 验收宣称。
