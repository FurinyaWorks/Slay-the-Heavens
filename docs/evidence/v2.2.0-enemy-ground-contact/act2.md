# v2.2.0 第二幕怪物接地核对

发布基线 `5ccff59e9df396849216fb3f790be8852974c769` 的正式 `data/release/refined-monster-art.json` Git blob 为 `55ac89d4d6dafd5feb108ca6dfdbcc430ca45c97`。以正式 106×106 图元顺序、锚点、三轴旋转、RGBA 栅格化 8 倍后缩回 1 倍；像素 alpha >127 记为可见。取身体底行和承重范围时单独排除内建暗椭圆、武器、孤立的抗锯齿边缘。行号自画布中心向下，横向范围自中心向右。透明图元测量合图为 `act2-native-contact-sheet.png`，SHA-256 为 `0a2d390cc6dded0180e064bd2bae90158dd43bb4ac652f4451308f9ead72053b`。

源类坐标来自同一固定源码。构造时 drawY 是原版地线加传入纵深偏移，绘制时再叠动作位移。地线、立绘不透明下沿、热区底部各有独立意义。第二幕阵容中故意用不同 x/y 的组合包括三奴隶主、二盗贼、寄生兽与真菌、盾卫与治疗者以及巡风隼。 [AbstractMonster 构造器与绘制](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/AbstractMonster.java#L131-L145) · [MonsterHelper 二幕阵容](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/helpers/MonsterHelper.java#L455-L525)

| 正式 ID | 原版姿态与纵向依据 | 正式素材测量及参数建议 |
| --- | --- | --- |
| `spheric_guardian` | 球体的 `Idle` 动画，构造 y=0、热区底 +10。实战内部球核和外附件离地转动。 | 外壳最深行 45，无支撑点，显式悬浮。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SphericGuardian.java#L56-L66) · [实战截图](https://i.redd.it/lscyb3fp80fa1.jpg) |
| `centurion` | 与治疗者同遭遇，构造 x=-200、y=15，盾与武器闲置 `Idle`。实战脚与衣摆立于地面。 | 右组脚趾行 52，取近底范围 [14,30]，另一组脚趾抬起，保留原记。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Centurion.java#L49-L70) · [实战截图](https://i.redd.it/886zvy0dy1ld1.jpg) |
| `mystic` | `Healer` 的 `Idle`，该遭遇构造 x=120、y=0；与 Centurion 同场的白色披风下沿贴近地面。 | 左脚行 45 截止，现表 [-11,3] 只覆盖左脚。右脚 (x=+21…31) 行 46 有实色着地点，行 47 剩 +26…29。建议 47、[21,31]。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Healer.java#L48-L74) · [实战截图](https://i.redd.it/886zvy0dy1ld1.jpg) |
| `taskmaster` | `idle` 双足执鞭。三奴隶主 x/y=(-385,-15)、(-133,0)、(125,-30)，本体居中。 | 左右靴主轮廓范围 [-24,-7]、[12,29]，右靴最末少量像素行 48。双足共用行 47 可以保留。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Taskmaster.java#L43-L57) · [实战截图](https://i.redd.it/j6yg50275jcb1.jpg) |
| `book_of_stabbing` | 构造 y=5，`Idle` 和 `Attack`/ `Attack_2`。实战书本本体悬浮，带向下摆动的刀锋与飘带。 | 本项目书角最深行 45，斜角无承重结构，显式悬浮。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BookOfStabbing.java#L45-L50) · [实战截图](https://i.redd.it/pldb6vkhjkha1.jpg) |
| `snake_plant` | `Idle` 从地面块长起；MonsterHelper (-30,-30)，类内额外 +50，绘制 y=20。 | 根底基座宽，左最低尖末行 44，主体底边取 43、[-25,28]。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SnakePlant.java#L46-L50) · [蛇植实战局部](https://i.redd.it/cpus8erczrqd1.png) |
| `chosen` | `Idle` 站姿持杖，类内 y−20。与异鸟同场时原构造 offset 分别是 Chosen y=0、Byrd y=25…70。 | 内建暗椭圆为首槽，中心行约 43.82，完整 alpha 末行 46。移除首槽只作测量时衣摆到行 43。建议行 43 对接地面，由原椭圆承接阴影。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Chosen.java#L66-L94) · [与狂信者同场实战截图](https://i.redd.it/x1yzggtxyjja1.jpg) |
| `shelled_parasite` | `Idle` 有壳足站姿，独立构造 (-20,10)，真菌组合偏移 (-260,15)。 | 多足底不能取一条横贯空区的影。中央最深趾行 44（+9…10），左近趾行 42（−13…−8），建议 44、[-14,-8] 与 [6,12]。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/ShelledParasite.java#L62-L70) · [独立遭遇实战截图](https://lib.reviews/static/uploads/slaythespire-1649048758634.jpg) |
| `byrd` | 3/4 只阵容独立随机 y=25…70，初始 `idle_flap`，击落换成 `grounded.atlas` 的 `idle`，并改热区从 (0,50) 至 (10,-50)，恢复时换回。 | 飞行主图趾尖行 41，只作观察。击落复用已有原生 26 图元收翼姿态，行 35，两足影中心/宽度 -12/9 与 3/7，紧凑热区随姿态。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Byrd.java#L145-L167) · [飞行实战截图](https://i.redd.it/crmfuh01ea6a1.jpg) |
| `snecko` | y=0，`Idle`；原版 Steam 实战蜥脚贴地。 | 原单段 [-26,12] 横跨透明区并漏右脚。主体脚底行 33 取左右 [-26,-15]、[27,38]，左脚行 34 只有稀疏尖缘。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Snecko.java#L54-L64) · [实战截图](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_c171816f7ecd35b5b46d2fa27532f4c5b8ca3cc5.1920x1080.jpg) |
| `mugger` | 两盗贼组合 Mugger (80,0)，Looter (-200,15)，均为双足站姿；Mugger `idle`。 | 近脚行 48，远脚略高。既有两脚范围 [-26,-15]、[14,29] 与姿态相符。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Mugger.java#L53-L75) · [两盗贼实战截图](https://i.redd.it/2zgp7owsiefa1.jpg) |
| `gremlin_leader` | `Idle`，本体 (35,0)，小魔位置 y=-4、6、0，召集沿这些位置补位。 | 内建暗椭圆中心行约 42.98，完整 alpha 末行 46。仅测身体时近脚行 43。建议行 43 对接地面，继续用原椭圆独立支撑。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/GremlinLeader.java#L41-L63) · [首领与两小魔实战截图](https://images.steamusercontent.com/ugc/13033852683006152981/474580CAA2FAAC1A610C0162D377B28637FE1E21/) |
| `torch_head` | `idle` 有双足。Collector 初始召唤于 x=-285/-470、y=-5…25。项目现行召唤 x 相同、固定 y=0，保留该生产入口。 | 内建暗椭圆中心行约 37.98，完整 alpha 末行 41，身体底座止于行 34，并在约 34.22 行遇到椭圆顶部。建议 34 对齐真实底座，以内建影为唯一暗部。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TheCollector.java#L115-L125) · [实战截图](https://wikiwiki.jp/slaythespire/%E3%82%B3%E3%83%AC%E3%82%AF%E3%82%BF%E3%83%BC) |
| `collector` | (60,135)，`idle`；实战本体高坐右侧树根与王座，远高于 Torch Heads。 | 项目以王座高位分类保留源高度。主体行 42，内建暗椭圆中心行 42.15、完整 alpha 末行 45，其底缘接上仅该 Boss 房绘制的石座。 [原版场景绘制条件](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/scenes/TheCityScene.java#L188-L197) [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TheCollector.java#L76-L105) · [实战截图](https://wikiwiki.jp/slaythespire/%E3%82%B3%E3%83%AC%E3%82%AF%E3%82%BF%E3%83%BC) |
| `automaton` | Boss (-50,20)、`idle`，原版战斗两腿着地。 | 两组足，范围 [-23,-5]、[2,26]。主轮廓末行 44，中央趾尖实色可见至 46，正式行取 46。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeAutomaton.java#L62-L67) · [实战截图](https://blog-uploads.eneba.games/uploads/2025/09/Ironclad-excels-at-strength-scaling-and-exhaust-synergies.png) |
| `bronze_orb` | 正式 Automaton 召唤位置 (-300,200)、(200,130)，静态 `orb.png` 加独立 `animY=±6*cos`，双 Orb 实战有不同高度。 | 新造型有下部尖角，最深行 45。实际召唤沿源高度保留，静态图像轮廓不导出地面接触。 [召唤源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeAutomaton.java#L105-L117) · [浮动源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeOrb.java#L73-L78) · [实战截图](https://blog-uploads.eneba.games/uploads/2025/09/Ironclad-excels-at-strength-scaling-and-exhaust-synergies.png) |
| `champ` | (-90,0)、`Idle`，原版实战两靴落在玩家地面带附近。 | 项目姿态左前脚最深 43，右承重靴到 48，近底范围 [10,30]。保持右脚承重点。 [源码](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Champ.java#L87-L94) · [实战截图](https://www.megacrit.com/images/ss23.jpg) |

内建阴影校正让立绘相对同一接触面向下移动 `(旧行−身体行)×立绘尺寸/106`。Chosen、Leader、Torch Head 分别移动 2、3、6 行，随立绘移动的阴影仍在相应身体底点及下方。现有 `EnemyView` 的 HUD 通过接触面和 healthGap 布置，因此修改美术锚点会缩小原先假悬空距离，血条与状态锚点仍保持。Torch Head 暗椭圆的天然下沿位于脚下约 7 素材像素。Simulator 复审需要确认它仍落在连续石地且与血条保持可读间距。

此表记录全部 17 个二幕 ID 的源码与原生素材审计，并标明已经实看对应 STS1 画面的项目。现行版本 Simulator 截图及 HUD 间距测试由独立验证补齐。

基线及修复候选的生产控件投影提供以下 1280×720 逻辑坐标校验。Y 自画面顶部向下，脚底和暗椭圆末行由上面的正式素材测量乘以对应实际立绘比例，血条上缘由生产 Y 和 20×2/3 高度计算。

| 单位 | 原身体底 Y | 修复后地面及身体底 Y | 修复后内建暗椭圆底 Y | 修复后血条上缘 Y | 暗椭圆与血条间距 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `gremlin_nob` | 467.22 | 472.00 | 479.17 | 491.33 | 12.16 |
| `chosen` | 473.14 | 476.67 | 481.95 | 496.00 | 14.05 |
| `gremlin_leader` | 466.15 | 472.00 | 477.85 | 494.67 | 16.82 |
| `torch_head` | 462.94 | 472.00 | 482.57 | 498.00 | 15.43 |

四者接触面和血条绝对位置与发布基线一致。修复后脚底及内建暗椭圆处于接触面与血条之间，暗椭圆底到血条上缘保留 12.16 至 16.82 像素，无第二道生成阴影。该表来自 `grounding-sim/{before,after}/scenes.ndjson` 中相应怪物的生产控件投影。

补充截图的核验范围。蛇植链接是社区构图帖的实战裁片，使用左半蛇植核对根底，右半的合成组合不作为遭遇证据。寄生兽链接是独立遭遇，组合纵深仍依据 MonsterHelper。Chosen 的截图来自与狂信者同场的实战。
