# 原生图标绑定与验证

最终范围为药水四条既有路径及战后两行遗物奖励。保留原图号、染色和失败 fallback，不改尺寸、触点、shell、说明或命令。当前发布的 `official-assets-battle-v2` / `nativePageLifecycle=true` 路径使用现有图元绘制器；默认 profile 不添加池。

药水完整 Host 固定47池，10图元/池，加517控件。战后两行遗物奖励各四状态使用既有16图元容量，加8池/136控件；完整 Host 共55池/653新增控件。独立 battle 定义为32池/400控件。33项遗物配方自身不增加池。以上是离线结构统计，不是官方容量或设备FPS。

P2修复前的 `node --test tests/potion-art-runtime.test.mjs` 三项通过，34.235秒，见 [runtime-final.tap](runtime-final.tap)。该轮按职责分层验证：

- 全部42药水配方在实际导入的10图元瓶池逐项切换，校验图形与重复绘制零图元写入。
- 实际 Host 四条绑定路径分别使用6种分支代表：火焰、力量、肌肉（同旧图号），能量、护盾及缺少 Theme 映射的 foreign `ambrosia`。覆盖5槽/四状态、换物、空槽、取消、各路径原生失败fallback、unknown/missingpool及非药水奖励保护。marker 为 `42_GENERIC 4_PATHS 6_SAMPLES`，不是42种在四路径全量循环。
- 新短 Host 验证两行遗物奖励的 sourceId/alias、换物、空/unknown、失败/cache和重新进入；另验证两种同旧图号药水的奖励切换，gold/key/card独立绘制不被清除。

原先一次性的42药水×四路径完整 Host 广验为2/2、58.606秒，接近原60秒Lua时限，故最终测试改为上述分层合同，没有放宽超时。旧结果见 [original-potion42-test.tap](original-potion42-test.tap)；旧JS/Lua源快照与历史清单内LF摘要逐字一致，留作原证据，不作为每次CI重复任务。相对该广验，最终只有 loader、reward_layout、shop_ui 三个生产文件变化；另外三个生产文件及baseline配置身份不变。原 shop 快照从独审提交80ccb读回，匹配旧manifest的12b5开头LF身份。历史与最新身份在 [runtime-source-manifest.json](runtime-source-manifest.json) 分开记录。

提交80ccb独审发现P2：绘制器曾成功隐藏原图标后，pool lookup若missing/dead/抛错，原shop/reward调用方未恢复原图可见性。真实短Host新增断言先RED（12.341秒），随后仅在shop药水icon与reward药水/遗物自有分支增加3处可见性恢复。四个真实owner分别覆盖missing/dead/throw，同item刷新显示原fallback，恢复pool后显示正确配方，短项GREEN为1/1、15.362秒。见 [RED](p2-fallback-red.tap.gz)、[中途shop池名fixture失败](p2-fallback-fixture-failure.tap.gz) 和 [GREEN](p2-fallback-green.tap)。没有改通用绘制器或其他奖励row；原来的34.235秒三项结果属于P2之前，没有重复整套或冒称它覆盖最新P2修复。

原88份完整资产按ID投影后的身份不变，固定新增33集合拒绝额外ID；全部121遗物/42敌人的旧通用绘制器轮换、失败/重入/缓存合同通过。新增7份遗物图集的hash、实际尺寸及批准配方另经定向测试通过；药水4项资产合同保持通过。

JavaScript语法、Lua静态门禁与架构检查通过。静态基线仅维护3项既有W431源位置77/98/103→80/101/106，outer引用48→51；原失败和修正后报告保留，未新增告警豁免或改变阈值。沙箱spawn EPERM及测试fixture的父路径、旧图号假设、raw34与production33区分等首轮失败见清单，未抹去或冒作产品通过。

主控随后只运行默认profile的单个raw Lua入口，实际发现 `Theme.lowCostArt` 为nil；不是执行Full。原363字节日志已无损gzip归档为 [standalone-potion-red.log.gz](standalone-potion-red.log.gz)，记录fixture耗时3612ms。两份需官方profile的Lua夹具因此逐字迁至 `tests/helpers/potion-art-runtime.lua` 与 `tests/helpers/reward-art-runtime.lua`，作为profile-only支持文件，由既有JS隔离official构建执行，不再作为raw `tests/lua` 独立库存重复运行。Lua内容、生产六文件和baseline均未变；只更新JS两个dofile字符串及第三项说明标题，断言、marker、超时和预算不变。

新路径最终JS三项重新执行3/3、21.620秒，覆盖P2后的代码，见 [runtime-relocated-final.tap](runtime-relocated-final.tap)。新路径执行结果与历史旧路径TAP分别保留，不把旧路径GREEN冒称新路径证据。执行后按主控要求仅将第三项标题统一为 `42 recipes in native pool and six representatives across four paths`；该说明修正不改变测试体，未额外重跑。最新manifest同时记录执行时与最终标题版JS身份，以及两份内容哈希不变的support新路径。

尚无官方导入、新ready或PC/手机设备实测。证据生成阶段未提交；后续提交、复审、推送及准入状态见canonical Backlog，由主控统一维护。
