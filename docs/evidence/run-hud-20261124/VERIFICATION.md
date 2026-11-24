# P0 验证记录

BASE c4eec5f9dc0cebb6bf0295b1d25cb1000cc48b96；最终HEAD/Tree绑定在PR的三项原生独立Review。这里保存可检查的静态结果，不自指未来commit。

- `ABYSS_HUD_LUA=/tmp/lua-5.3.6/src/lua node --test tests/run-hud-inventory.test.mjs`：12/12 PASS。原生上游Lua5.3.6+正式生成UI/数据+GameUI控制器+native API mock，不是官方SDK客户端。上游tar SHA256 fc5fd69bb8736323f026672b1b7235da613d7177e72558893a0bdcd320466d60；默认CI仍用Fengari，未新增生产依赖。
- 默认Fengari `route`：1/1 PASS；Reviewer C 独立Fengari遗物/药水/几何/变更4/4 PASS（日志与最终原生Review关联）。手机原坐标事件/战斗脚本仍在12项矩阵内执行，旧事件隐藏断言由PD01对应RED→GREEN取代。
- `official-run-hud-reuse` + `official-run-chrome`：17/17 PASS。原图/原控件保留合同继续检查，新增地图入口单独识别；mini fixture显式加载真实RunHud模块。
- `node scripts/check-engineering.mjs`：357模块、6611测量，架构、静态、span、CC及scope全部PASS；保留原门槛和3个既有显式警告。
- 四项critical mutations均killed_by_assertion；原生启动/UI mock合同5/5 PASS；语法与UI参考索引检查PASS。
- 连续路径按真实seed1连接执行：开局祝福/地图/战斗/奖励/选牌/事件/事件选牌/商店/营地/宝箱/首领/首领宝箱/幕间；双端地图预览及嵌套详情/卡组/设置逐级返回；退出至主菜单、继续、重开、20次模态循环。combat胜利状态使用显式结果fixture，finish/reward/房间命令为正式实现；不把它说成官方客户端自然打牌通关。对象/绑定统计包含动态grid.items且去重。
- 正式配置buildUI生成完成，原生层级/尺寸/裁剪视口与离线投影详见README及16图。正式GIL构建/写入读回：UNVERIFIED（无底图与Miliastra工具链）。官方导入、Ready、同候选PC/iPhone14 Pro：UNVERIFIED。

## 全量与基线

本地npm test曾执行；第一轮缺LFS归档，定向展开后重跑。实施中Full含已存在source inverse失败和并发负载超时，未完成即终止以留给精确提交Hosted Full；不记为通过、不将所有失败归为历史。PR及Release精确SHA的Hosted状态另行读回。

presentation 66项中6失败，在精确BASE独立复现：strike、perfected_strike、pommel_strike、twin_strike、wild_strike、dual_wield 原型旧文案。BASE的Act1 source inverse static也同红；对应Act1源文件哈希在BASE/HEAD相同。BASE另有view复杂度16，已被本次职责拆分修正；未降低门槛。基线证据在tests/目录。不能据上述定向绿灯声称全量Full或发版通过。

初轮独立A/B/C发现均修复并有负控；正式终审以实际BASE/HEAD/Tree为准，所有新增真实阻塞必须关闭后才管理员合并。
