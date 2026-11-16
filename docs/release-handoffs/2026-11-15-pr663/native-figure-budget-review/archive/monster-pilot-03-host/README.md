# 第三批开局敌人：实际 Host 离线资格验证

基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`，使用既有 Release 的 buildUI / buildLuaData、GameUI、Combat、MonsterArt 与仓库原生控件 mock。第三批四份候选原生行只作为显式测试输入；没有改生产开关、源码、绑定或提交，未消费 Codex、运行 Full CI 或操作游戏窗口。源码/配置/data/tests 的 git diff 为空；已有图像 LFS 展开与 node_modules 保留不碰。

## 实测结果

19 个场景 PASS，各场景 120 帧；活跃图元对象身份、位置/尺寸/XYZ旋转/最终RGBA正确，旋转写入次数保持不变。不是完整 GPU 写入计数，也不是帧率测量。

- 真实 room resolver 的 Cultist、Jaw Worm。
- 真实 formation 的 `2 Louse` 全部4种颜色组合、`3 Louse` 全部8种颜色组合；只注入 Boolean 边界，不声称原始随机流回放。
- 真实 `Exordium Thugs` 指定分支：赤甲虫＋祈火徒。
- 明确标为 fixture 的混合旧图库回退、同一surface/actor ID从115图元重绑到41/40图元，旧尾部隐藏；移除一只不丢失另一只绘图。

| 口径 | 图元槽／完整单位模板控件 |
|---|---:|
| 原整库保留输入 | 600 槽 |
| 上一轮史莱姆限定试点（历史对照） | 41 槽／79 控件 |
| 本轮第三批＋必选兼容中草的限定输入 | **115 槽／154 控件** |

共享模板取激活集合中最大图元数，而非各怪物实际可见数：两只蕈兽只显示80–82个图元，却分配230槽；三只显示120–123个却分配345槽。祈火徒＋赤甲虫显示156个，分配230槽。**44/119绘图预算不能冒充整只敌人的运行时控件成本。**154还不含各独立Power状态实例。完整历史目录仍参与容量取最大时是600，不是115。

完整目录先经过现行 prepareMonsterArt 校验，再对内存测试输入裁取候选；替换现有绑定时同时移去仅被其引用的旧资产，避免制造无绑定资产。保留的所有资产仍验证；这是隔离实验输入，不是删生产历史资产。rowsToSlots适配器仅将既有上限41提高到本批已核实115，保留无mask、居中、单位缩放、有限数值/原生image等所有断言。

## 复现

在对应文件准备好的隔离目录，设RELEASE_REPO为上述精确Release，BATCH03_DIR为第三批四个子目录的父目录，ACID_MEDIUM_LAYOUT为已归档兼容中草native-layout.json：

```sh
RELEASE_REPO=/path/to/release BATCH03_DIR=/path/to/monster-pilot-03 ACID_MEDIUM_LAYOUT=/path/to/acid-medium/native-layout.json node run-host.mjs
```

运行器输出生成Lua fixture、原始日志和JSON回执。构建目录仅本地诊断，不需要归档。输入SHA256写在JSON回执。

未验证：原神官方引擎/手机、GIL/服务器容量、视觉最终批准、正式候选、战斗结算完整路径。新稿仍待用户视觉确认。本轮只补真实Host层证据，未扩大发布状态。
