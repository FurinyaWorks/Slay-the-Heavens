# v2.2.0 正式怪物接地复核

发布基线为 `5ccff59e9df396849216fb3f790be8852974c769`。生产与测试提交为 `d281dd075437a99eecf2fd8146ebd486c6e335b0`。参照固定版 STS1 的构造、绘制与动画，以及两幕实战截图。素材脚底取自两幕当前正式的 106×106 低多边形图元。 [固定源码](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)

| 范围 | 审计与测量 |
| --- | --- |
| 第一幕 25 个 | [构造、姿态、原版实战来源和接触行](act1.md) · [正式素材合图](act1-native-contact-sheet.png) |
| 第二幕 17 个 | [构造、姿态、原版实战来源和接触行](act2.md) · [正式素材合图](act2-native-contact-sheet.png) |

35 个正式怪物有固定接触面，5 个保留悬浮高度，聚烬领主保留高位并有石座支撑，巡风隼用既有 Flight 逻辑在飞行与收翼接地之间切换。赤甲虫和巫师小魔补上实测接地点。收藏家是本作的聚烬领主。只有聚烬领主 Boss 房使用石座，对接立绘内建暗边并连接地面。它复用普通二幕场景的 250 个现有槽，进场选择一次，同一战斗刷新、召唤或死亡反馈时不重画。 [原版实战图](https://wikiwiki.jp/slaythespire/%E3%82%B3%E3%83%AC%E3%82%AF%E3%82%BF%E3%83%BC) · [原版王座绘制条件](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/scenes/TheCityScene.java#L188-L197)

四个接地素材保留内建接触影，接触面按实体底部对齐。正式主题构建将测量和显式高度规则与精绘目录逐项匹配，拒绝缺项、重复与未知 ID。

固定源码和本作 Simulator 全覆盖 42 个正式身份。两幕表分别列出可直接实看的 STS1 截图，双赤甲虫的同色阵容以固定源码和本作 Simulator 为证。

[全部 42 个正式怪物与重点阵容的 Simulator 画面对照](SIMULATOR.md) · [双赤甲虫与聚烬领主前后整画面](priority-louse-collector.webp)

## 定向回归

- 旧版生成物在赤甲虫的实际几何断言处退出。修复后 `node --test tests/native-enemy-portraits.test.mjs` 两项全过。正式轮次加载 41、96、115 槽模板，检验全部 42 个怪物的分类、脚底、影子、立绘、血条、意图、状态和热区。测试覆盖生产双赤、混色与小魔群阵型，Collector/Automaton 专用召唤，以及 Strike 击落和巡风隼复飞。
- 官方主题 13/13，附带的历史回放 10/10。精绘目录、层级与 UI 24/24。受影响的历史来源验证 5/5。 [命令及生成器负测](generator-checks.txt)
- 正式 GIL、官方客户端和实体设备由同包发布验收核验。
