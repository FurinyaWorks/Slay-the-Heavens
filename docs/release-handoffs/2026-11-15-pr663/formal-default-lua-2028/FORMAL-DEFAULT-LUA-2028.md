# 2.0.0 默认发版配置：Lua 字节对比与角色边界

以真实 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2` 为基线，只覆盖 [#691](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/691) `f85f4e4435e8b128c16713ed23bcbb2559f4fd1e` 的五个生成脚本，以相同视觉参数各生成一次。默认发布参数：卡图关、自定义菜单背景开、选角头像开、战斗立绘开、自定义怪物素材关，`contest-2026`；实验 official-assets 和 native-page-lifecycle 均关。本轮是生成器 A/B，未用 `--release-candidate`，沿用原版本元数据，不出 GIL，不操作 SDK、用户设备或托管 CI。

| 真实部署脚本来源 | 原始字节 | 序列化后 | 减少 |
|---|---:|---:|---:|
| 366 份 Lua 脚本合计 | 4,977,537 | 4,411,370 | 566,167 |
| 其中：V4 的卡牌、角色规则和遗物数据 | 577,904 | 229,355 | 348,549 |

Lua 5.4 比对确认五份变化表内的键、值、整数/浮点类型和字符串字节相等；其余 19 份输出逐字相同，包括用于构建安装原生 UI 的 `game-ui.json`。开发测试桥 `abyss_ui_layout.lua` **不在**部署脚本清单内，不重复计入。详见 [逐模块哈希](proof.json) 与 [脚本合计](script-totals.json)。之前 **640,086** 是官方素材与页生命周期预览参数下的源文件减量；不是这套默认配置的数字。任何一项都不能折算为平台 MB、GIL、运行时内存或帧率。

## V4 哪里用到、为何本轮不删

- [打包清单](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/scripts/native-candidate-scripts.mjs#L6)无条件把 V4 数据列入，虽正式选角和 [竞赛两幕入口](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/src/lua/abyss_ui.lua#L226-L234)只放行岩系旅行者。声明的 `experimentalCharacters=false` 不是这条入口的实际门禁。
- V4 开发选角预览、开局套牌/规则初始化、V4 战斗 HUD 会读这份数据；代码还兼容旧的 prepared 运行入口。目前「继续」是同一会话的内存状态，**没有证据**表明有跨会话的持久化 V4 存档。
- [定向日志](v4-admission.log)：基线 Geo 公开入口、开发/竞赛准入均通过；只在隔离测试中移走 V4 模块时，Geo 公开入口的同一组仍过，但既有开发选角立即报 `module 'abyss_original_v4_data' not found`。现有正式打包清单也要求该文件在场。这不是可直接剪包的依据；先发当前内容，只有正式同配置实测仍超限，再评估生产专用裁剪是否值得做。

## 复现与放行边界

在精确基线隔离副本加载已锁定的 Node24 依赖、按 Git LFS 指针水合实际资产。将 [比较器](compare-serializer-lua.py) 与 [库存脚本](inventory.mjs) 复制到仓库根目录，前后分别运行：

```sh
node scripts/build-lua-data.mjs data build/before/abyss_data.lua
node scripts/build-ui.mjs build/before --work-key=contest-2026 --art-cards=false --art-menu-background=true --art-selection-avatar=true --art-battle-portrait=true --art-monsters=false
git apply /path/to/serializer.patch
node scripts/build-lua-data.mjs data build/after/abyss_data.lua
node scripts/build-ui.mjs build/after --work-key=contest-2026 --art-cards=false --art-menu-background=true --art-selection-avatar=true --art-battle-portrait=true --art-monsters=false
python compare-serializer-lua.py build/before build/after
node inventory.mjs
```

[生成器补丁](serializer.patch)仅用于这项证据复现，不包含 #691 正式打包前置及显式静态卡图修复；正式集成仍需原独审和必要检查。Release 的 [1cc 原生 push Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43753582674) 已确认存在，20:33 UTC 快照仍未完成；#679 Exact `f564aea6` 已接实际基线，与旧 `10847d76` 完全同树，原定向结果不必重跑，[其 Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43758225514) 尚未通过。未启动重复 Full，未合入任何产品改动。最终入场仍需正式一套版本元数据和实际产品范围、同一新候选的官方容量/导入及 PC 和实体手机复验。
