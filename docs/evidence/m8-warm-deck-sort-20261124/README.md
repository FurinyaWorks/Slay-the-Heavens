# TASK-42.1: 75 张牌的暖态排序

## 结果

在 Develop `7348ab8598c8607712d525bd732239f89bb52830`，用实际原生分页牌组的地图入口、排序键及返回键，打开由生产数据中 75 个不同旅行者卡牌 ID 构成的测试牌组。冷开只用于填充现有卡池；关闭并暖开后才计量。每个排序模式分别点击两次（正反序）。

- **当前 Develop：** 六次点击均有 2–3 次模拟更新牌区被可见遮罩挡住；首次露出完整牌时同一页十张均完成。没触发准备提示。
- **本地 #932 产品投影：** 将该 PR 的六个生产路径，以其原 BASE 为共同祖先合到上述 Develop 源码，且重新生成同配置布局。六次排序可见遮罩均为 0 次；第一次完整牌均在第 2 次更新出现，十张都就绪在第 2–3 次。仍有 2–3 次内部输入门禁轮次，未把输入门禁误称为黑遮罩。
- 两组排序前后都是 8 页；保留原牌组实体与 UID 顺序、同一打开会话、相同实际 10 个牌面根，排序未增加或销毁根与分段。原序正反均核对，类型/费用均核对模式、完整排列及无重复 UID，此探针不替代各牌的排序键规则用例。地图渲染调用 0 次；隐藏战斗渲染入口 1 次/点击，不等于玩家看到战斗重绘。
- 采用独立复核后的口径：日志的 `blank_frames` 指无无遮挡完整牌被观察到，不能据此说全屏黑、原始控件全不可见或实机卡顿。此为 1 组 6 对离线样本。耗时不是 P95 或客户端帧延迟，无官方导入、渲染或真机结论。

## 复跑边界

复用 [#932 的原生 Host 探针](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/00dc14e0b263572a47ddb5e855167ceeb3190ee7/docs/evidence/deck-cold-start-20261124/probe.lua)；用 `warm-sort.patch` 改探针并将结果命名为 `sort-probe.lua`，`roster.lua` 置于运行目录（从 `data/cards.json` 的默认卡组与 reward 池去重）。生产生成使用 `--official-assets --native-page-lifecycle --refined-release-monsters`，源资产以 Git LFS 指针的 OID 和字节数校验。两组 `game-ui.json` SHA-256 同为 `1e9992927aaf1a13d8e08d86fffd5f2534cc4891733f186157e68a6cf6d1616b`，分段模板绑定 Lua 同为 `297b9655a3e58537a7c1ca7da1591f443ea53e2bf5c2e8808f1b67aaa792adc8`。

候选为本地六个生产文件的三方合成（#932 BASE `364f43e8d7e0c03835676f2867ab9be0db496d29`、原 HEAD `00dc14e0b263572a47ddb5e855167ceeb3190ee7`、Develop `7348ab85`），逐文件 `git merge-file -p current ancestor candidate`，无冲突。没有合成测试/回放合同；不是正式合入树。构建完成后在各自目录执行：

```sh
DECK_GENERATED="$PWD/generated" DECK_AMOUNT=75 DECK_SAMPLES=1 luatex --luaonly sort-probe.lua
```

当前生产没有改动。已有 #932 继续负责集成，不另开修复 PR，不启动全量 CI。候选进正式合流后，仍需对应源码回放门禁与同设备验证。
