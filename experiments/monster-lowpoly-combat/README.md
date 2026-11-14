# 双怪低多边形拟合与原生战斗实验（TASK-25.8）

**结论：技术链路可运行；当前新版不建议替代旧391/590，更不建议直接量产42怪。**

本轮已实际拟合、生成原生矩形/三角形/椭圆、接入生产 GameUI/Combat/actor、构建可导入GIL并在安装的SDK中执行完整战斗。官方导入、官方新ready、PC/GPU、实体手机及官方容量均为 **UNVERIFIED**；用户选择自行导入，Agent没有操作客户端或输入设备。

## 交付与使用

Windows交付目录：`F:\New folder\交付\怪物低多边形实验-20261114\`。以该目录的 `manifest.json` 校验各GIL SHA256。

| 文件 | 岩史莱姆实际图元 | 遗迹守卫实际图元 | 用途 |
| --- | ---: | ---: | --- |
| 新版低档-200-349.gil | 200 | 349 | 推荐先试玩的技术A/B，不是审美批准稿 |
| 新版上限-349-500.gil | 349 | 500 | 画质/负载上限对照 |
| 旧版对照-391-590.gil | 391 | 590 | 同一基线、同一战斗配方的旧原生稿 |
| 新版上限-轻量池兼容.gil | 349 | 500 | 窄范围叠加#661轻量实现的共存样品，不等于整个#661版本 |

在千星沙箱中**作为新存档导入**，进入试玩。候选默认自动进入岩系旅行者的双怪战斗实验，跳过开局祝福，使用固定种子及标准攻击/防御牌测试组；不改角色定义、伤害、AI、账户等级或正式存档。该入口是独立遭遇，HUD可能显示实验默认层数0，不是两幕推进/奖励平衡验收。

- 可正常出牌、结束回合并观察待机、敌人动作、受击和死亡。遗迹守卫沿用 `lagavulin` 的休眠/攻击规则，不重新发明AI。
- 原生命中框保持生产几何。SDK中悬浮手牌曾遮挡史莱姆命中框中心；最终测试点击原框上半部，严格核对命中ID并确认HP下降。该遮挡失败轨迹保留，不声称所有位置都畅通。
- `monsterFitDemo=false` 可保留普通入口；实验只登记 `spike_slime_l → large-geo-slime`、`lagavulin → ruin-guard` 两个映射。发布由人完成，本PR不合并、不发布。
- 本轮PC验收仍需用户导入后提供候选身份、新日志/ready及画面；不能把这里的SDK ready当作官方ready。

## 复用与隔离

分支 `feat/monster-lowpoly-combat`，从最新核对的 `origin/develop@9f2f44e4` 创建。已核对在途#661的固定HEAD `fdfca5bf`，并读取其新风格规范 `docs/design/GEO_LUMINE_RENDERABLE_ART_PROMPT_20261113.md`；没有接管TASK-25.7、修改其工作树或重复原轻量绘图框架。

源图及旧391/590原生文件来自 `art/monster-benchmarks/genshin-v2/{large-geo-slime,ruin-guard}/`，v1/v2其他源稿完整保留。拟合前用Git原始blob/LFS oid核验真实PNG像素。源图不是运行时纹理。

`fit.py` 复用 `scripts/art/segment-lowpoly.py` 的分区、轮廓、覆盖顺序与三角化，以及 `native-triangle-placement.py`。局部适配处理Alpha轮廓、8色平涂、眼/核心同源椭圆和守卫橙色肩筒/腰饰，不生成陌生怪物。单轴不可表达的面复用V25两个半三角，按两个图片控件计数。保留孔洞的底轮廓与覆盖色区分别分配预算，避免细纹吞掉全部面数。

`build.mjs` 只扩展隔离GIL：增加 `MonsterFitActor` 图池，替换候选内5个模块（actor绑定、怪物数据、CardDisplay半三角填充适配、候选美术开关、实验入口），其余356模块逐字节保留。源码、默认美术登记、生产构建及原运行时均未改。新增图元沿用每actor最多600、每组最多60的现有限制。

待机/攻击/受击/死亡及回收使用原机制；图元几何在同一实例首次绘制时写入，位移/缩放用父容器。同战斗120次待机更新0新建。**跨战斗仍销毁并重建actor**，不是永久缓存：每次双怪重开旧版1282、低档792、上限1100个控件创建且等量销毁。颜色/死亡Alpha变化仍沿用逐图元tint，因此静态不重建不等于零渲染/零变更成本。

## 源图、几何与原生对照

- [岩史莱姆：源图/几何/原生](evidence/comparison/large-geo-slime-source-fit-native.png)
- [遗迹守卫：源图/几何/原生](evidence/comparison/ruin-guard-source-fit-native.png)
- [实际战斗与10手牌](evidence/final-high/ten-hand.png)
- [五怪与10手牌](evidence/final-high/five-monsters-ten-hand.png)
- [遗迹守卫死亡](evidence/final-high/guard-death-feedback.png)

106/127表示相同的**宿主设计尺寸**；截图保留SDK原像素，旧新主体实际占用边界不同，不能称等主体面积比较。源图及几何预览不是原生输出；原生对照使用安装SDK的真实控件/旋转/填充软件重建，仍不是官方GPU画面。

| 预算 | 史莱姆实际图元 | 守卫实际图元 |
| ---: | ---: | ---: |
| 100 | 100 | — |
| 200 | 200 | 199 |
| 350 | 349 | 349 |
| 500 | — | 500 |

独立审美复审 `/root/monster_visual_review:TASK-25.8:R4:20261114T134253Z`：修正后的眼睛一致性、橙肩筒和腰饰较前轮明显改善；但史莱姆中央岩甲/身体体积、守卫胸核环/关节/拳脚结构仍弱于旧稿。349/500只比旧391/590少10.7%/15.3%可见图元，画质代价不划算。200/349适合技术成本A/B；全档均未获正式量产审美放行。

初轮眼/核心消失、后续纹理碎面、错误输入断言和启动失败均保留在 `failed-r01`、`failed-r02`、`failed-r03`、`evidence/runtime-*`、`evidence/build-failures.json` 及本工作树 `build/monster-*` 中。

## A/B实测

完整机器收据：[AB.json](evidence/AB.json)。相同develop基线、相同配方与SDK，按上限→低档→旧版串行执行，避免并行CPU争用。每套3次独立VM启动、5次重开；样本少、顺序固定，不能据此承诺真机提速比例。

| 指标 | 旧391/590 | 新低档200/349 | 新上限349/500 |
| --- | ---: | ---: | ---: |
| 每actor实际预留绘图槽 | 590 | 349 | 500 |
| 每actor全部模板控件 | 637 | 392 | 546 |
| 双怪整屏控件 | 20,072 | 19,582 | 19,890 |
| 五怪+10手牌实测峰值 | 21,999 | 20,774 | 21,544 |
| VM建模至双怪就绪，中位ms | 3,224.8 | 2,008.0 | 2,210.5 |
| 重开+5次更新，中位ms | 431.8 | 342.7 | 360.7 |
| GIL实际文件字节 | 19,298,275 | 18,901,722 | 19,166,743 |
| 测试结束剩余控件 | 0 | 0 | 0 |

共享池按最大图元容量分配：上限档史莱姆虽只画349，仍预留500槽。整屏含18,790个基线控件及动态Power/意图/宿主，不能把“怪物500图元”当成“整屏500控件”。旧版→低档每actor少245个全部控件，上限少91个；五怪峰值分别少1225/455。

CPU墙钟仅是SDK/Fengari模型，不包含OS冷启动，不是官方加载、GPU帧时间或手机FPS。PNG时间含软件渲染、文件写入与校验。部分基线图库缓存缺项（107106、100149、100150、100129、100122）在收据明列；新怪只用100001/100002/100003，不依赖这些纹理。整屏材质不能因此宣称最终画质通过。

三套各26项完整生产Lua/SDK检查均PASS：双怪原生显示、图库回退/恢复、120帧待机不新建、10手牌、四个敌方回合与真实伤害、原生点击命中且扣血、双怪致死/奖励转移、5次重开、五怪/手牌/特效、降为单怪和销毁归零。致死检查使用显式1HP/0格挡前置状态，不调整怪物定义或正式平衡。三套日志都有守卫对玩家造成18伤害；这只证明这些确定场景，不是全怪全招式验收。

## #661轻量共存

`compat-build.mjs` 从固定Git blob读取原 `lowcost-art.mjs`、两个绘制调用模块、轻量登记；直接执行其附加池方法，替换时保留实验模板索引。**复用#661已有成功优先级，不重复实现。** 主三候选不含整个#661集成变更；第四样品及[4项共存收据](evidence/compat661-final/compatibility.json)只证明这一美术边界。

原池容量32，全目录最大有效28；本次史莱姆原轻量实际14、守卫12（cultist20）。验证：新版成功→轻量层隐藏；关闭新版→原14/12逐项恢复；重启新版→无双绘；未转换怪物→原轻量回退；销毁0残留。最初把两怪都断言为28的失败收据也保留。

独立代码复审 `/root/monster_code_review:TASK-25.8:20261114` 与增量 `/root/monster_code_review:TASK-25.8:compat661` 均PASS。已有 `monsterActorInventory()` 把模板名硬编码成AbyssMonsterActor；原收据保留此历史字段，实际GIL/读回模板名是MonsterFitActor，AB报告已分别列名，控件数不受影响。

## 生产建议与42怪成本

推荐 **语义色区源稿简化 → 现有自动轮廓拟合 → 少量人工修整 → 设备放行**。目前应保留旧391/590的视觉质量作为门槛；新版200/349用于技术对照，不宜只凭低图元采用。两样本自动拟合约2.0/6.2秒（以最终收据为准），但这不能代表审美修稿、身份审查、导入和设备QA的生产时间。

规划估算（未实测人工吞吐）：每怪源稿语义简化0.5–1.5小时、拟合与局部修整0.25–0.75小时、原生战斗QA0.25–0.5小时，42怪合计约42–115.5小时；不含复杂首领/多阶段、真机回合和返工。只外推这两个样本的自动拟合约85–260秒，不能把它当整个量产成本。42份高档Lua目录的字节外推见AB.json，是源码载荷估计，绝非官方资源读数；运行时只为活跃actor分配池，不把42个图池一次常驻。

本轮没有调用新图片生成API；代理计费和人工时间没有计量数据。正式量产 **No-Go**，需先补中央岩甲、胸核环等语义结构，证实中档画质/性能同时优于现有方式，再决定批量路线。

真实设备缺口：官方新存档导入与源码核对、新日志/ready、PC实际动作/接缝/响应、官方静态/动态/容量/上传启动读数、实体手机单怪/多怪/10手牌/特效帧时间与反复进出清理、亮背景暗边及官方XYZ轴序。SDK逆向0差异、mock或PNG均不替代这些项目。

## 复现

使用已有Python3.12（Pillow/NumPy/OpenCV/Shapely）、Node24.18.0、安装的千星MCP与SDK，不安装第二套绘图框架。保持 `MILIASTRA_ALLOW_LIVE_WRITE=0`；所有构建输出为新目录。

```powershell
& $py experiments/monster-lowpoly-combat/fit.py --source-root $sourceRoot
& $node24 experiments/monster-lowpoly-combat/baseline.mjs $existingBaseGil $newBaselineOut
& $node24 experiments/monster-lowpoly-combat/build.mjs $baselineReceipt $newCandidateOut 200 350
& $node24 experiments/monster-lowpoly-combat/project.mjs $candidateReceipt $newPreviewOut
& $node24 --import $existingSdkHook experiments/monster-lowpoly-combat/runtime.mjs $projectedSave $existingSdk $existingRenderer $newEvidenceOut
& $node24 --test experiments/monster-lowpoly-combat/contracts.test.mjs
& $node24 experiments/monster-lowpoly-combat/verify.mjs
```

Windows设施存在跨盘junction权限/复制依赖双genshin-ts上下文问题；本轮 `baseline.mjs` 直接调用同一安装工具的白名单离线API，所有原静态/图编译门禁照常执行，必要时子进程使用本目录 `local-junction-hook.mjs`。该钩子只处理本工作树内指向既有MCP依赖的node_modules，并统一编译上下文；不修改工具安装。已有MCP工作流和平台规则在构建前实际读取。失败记录保留，不通过删门禁制造成功。
