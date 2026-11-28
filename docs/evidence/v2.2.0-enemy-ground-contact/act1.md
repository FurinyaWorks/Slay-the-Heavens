## 第一幕正式怪物接地核对

固定源码为 [aeubanks/sts@319009d5](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)。[AbstractMonster.java:131–145](https://github.com/aeubanks/sts/blob/319009d5/monsters/AbstractMonster.java#L131-L145) 将相对纵深叠到 `floorY`，[705–748 行](https://github.com/aeubanks/sts/blob/319009d5/monsters/AbstractMonster.java#L705-L748) 将绘制与动画偏移叠到 Spine 或静态图。这里只依据姿态与实图判定支承，保留源码队形和构造偏移。正式锚点来自发布基线的 `data/release/refined-monster-art.json` 图元，将图元按仓库 ZXY 投影复合至 106×106，检查底端实体轮廓，表中位置均相对中心。轮廓末行为 alpha≥192 的末个像素行。锚点和承重范围用于现有接触控件。下表涵盖第一幕全部 25 个正式怪物。

| 正式 ID | STS1 类与姿态或纵深依据 | 正式接触行 / 承重横向范围 | 实体末行 |
| --- | --- | --- | ---: |
| `looter` | `Looter.java:56,74–75`，idle 双足 | 46 / −21…−15，13…20 | 47 |
| `guardian` | `TheGuardian.java:86,111–112,251–255`，idle 地面装甲，防御阶段变更命中高；构造 y=−100 | 48 / −40…−18，15…35 | 48 |
| `raven_adept` | `Cultist.java:53,67–68`，waving 双足；源默认 y=−10 | 46 / 4…10，16…22 | 47 |
| `jaw_worm` | `JawWorm.java:69,100–101`，idle；MonsterHelper y=25 | 44 / −17…13 | 44 |
| `red_louse` | `LouseNormal.java:46–48`，idle 腹部贴石，原版混合甲虫实图 | 50 / 10…17 | 49 |
| `green_louse` | `LouseDefensive.java:49–51`，idle 腹部贴石，同一阵容偏移规则 | 44 / −12…5 | 43 |
| `acid_slime_s` | `AcidSlime_S.java:40,54–55`，idle 连续腹底 | 38 / −22…20 | 38 |
| `acid_slime_m` | `AcidSlime_M.java:61,72–73`，idle 连续腹底 | 46 / −26…25 | 46 |
| `acid_slime_l` | `AcidSlime_L.java:77,92–93`，Idle 连续腹底 | 45 / −26…23 | 45 |
| `spike_slime_s` | `SpikeSlime_S.java:37,51–52`，idle 连续腹底 | 30 / −35…22 | 30 |
| `spike_slime_m` | `SpikeSlime_M.java:56,65–66`，idle 连续腹底 | 38 / −23…17 | 38 |
| `spike_slime_l` | `SpikeSlime_L.java:72,85–86`，idle 连续腹底 | 22 / −24…24 | 22 |
| `blue_guard` | `SlaverBlue.java:44,59–60`，idle 双足 | 47 / −28…−13，26…43 | 48 |
| `red_guard` | `SlaverRed.java:54,69–70,129`，idle/idleNoNet 双足 | 47 / −41…−25，25…42 | 48 |
| `fungi_beast` | `FungiBeast.java:49,62–63`，Idle；蘑菇事件源 y=30/20/15 | 47 / −2…7 | 47 |
| `mad_gremlin` | `GremlinWarrior.java:41,53–54`，idle，原版小魔群实图双足 | 42 / −16…−3，9…15 | 42 |
| `sneaky_gremlin` | `GremlinThief.java:40,49–50`，animation，原版小魔群实图双足 | 45 / −17…0，13…30 | 46 |
| `fat_gremlin` | `GremlinFat.java:44,56–57`，animation；正式单承重脚 | 44 / 13…20 | 44 |
| `wizard_gremlin` | `GremlinWizard.java:43,56–57`，animation 双足贴石；保留 x−35 修正 | 49 / −2…0 | 48 |
| `shield_gremlin` | `GremlinTsundere.java:45,59–60`，idle 双足 | 44 / −35…−18，34…45 | 45 |
| `gremlin_nob` | `GremlinNob.java:55,75–76`，animation，双脚立于素材自带接触暗部 | 43 / 素材自带阴影，影心 42.98，不生成额外阴影 | 43（含阴影为 45） |
| `lagavulin` | `Lagavulin.java:64,76–84`，睡眠/醒来 Idle_1/Idle_2；构造 y=20 | 48 / −40…−6，18…45 | 48 |
| `sentry` | `Sentry.java:52,62–68`，idle；原版三哨卫最低点与地面有间隙 | 悬浮 | 46 |
| `hexaghost` | `Hexaghost.java:302–314` 和 `HexaghostBody.java:38,59–62`，独立抬高的浮体与轨道火焰；实图有清楚的离地间隙 | 悬浮 | 41 |
| `slime_boss` | `SlimeBoss.java:74,93–94`，idle、构造 y=28；原版实图连续腹底 | 38 / −37…33 | 38 |

`mad_gremlin` 原设 y=40，右腿实体到 y=42（最下像素 x=9，倒数第二行 x=9…10）。约 129×129 正式屏上立绘会把 2 个 matte 像素放大到约 2.4 逻辑像素，超出承重点 0–2 的验收间距。把锚点下移 2 个 matte 像素，沿用原来两脚横向跨度。已有的 1 matte 像素容差主要来自轮廓尖端或脚边取样。

[MonsterHelper.java:415–419](https://github.com/aeubanks/sts/blob/319009d5/helpers/MonsterHelper.java#L415-L419) 的双甲虫源坐标是 (−200,10)、(80,30)，混色或同色共用坐标。[731–758 行](https://github.com/aeubanks/sts/blob/319009d5/helpers/MonsterHelper.java#L731-L758) 的小魔群使用 (−320,25)、(−160,−12)、(25,−35)、(205,40)。[431–449 行](https://github.com/aeubanks/sts/blob/319009d5/helpers/MonsterHelper.java#L431-L449) 记录真菌、哨卫及首领编组，[外部证据索引 REFERENCE.md](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/5ccff59e/docs/design/reference-assets/v2.2.0/battle-scene/REFERENCE.md) 记录三哨卫实图 1280×720 逻辑末点 y≈477/486/473 和史莱姆首领 y≈497。

本轮直接目检了原版混合甲虫、四小魔群、三哨卫、六焰幽核和史莱姆首领。小魔群截图最右法师有两条腿紧接石板，其 y≈290 与同阵容前排较深的盗贼 y≈322 有清楚错层，亦与第四位源 y=40 及第三位源 y=−35 的相对次序一致。甲虫截图红左绿右，二者腹部分别紧贴其深度的石地。六焰幽核主体底与地板及血条均留明显间隔。[混合甲虫](https://www.slaythespirestrategies.com/2019/04/louse.html?m=1) · [四小魔群](https://i.redd.it/5rn0yr9zqvpe1.jpeg) · [三哨卫](https://media.indiedb.com/images/presskit/1/1/483/general/ss8.jpg) · [六焰幽核](https://images.steamusercontent.com/ugc/15865884906465359761/1A1A123E50998AD99FBC245924CCA0485EAAE751/) · [史莱姆首领](https://media.indiedb.com/images/presskit/1/1/483/general/ss13.jpg)

原版截图用于接地类别和队形辨读，其余怪物使用固定源码和本地正式 matte 核对。双赤甲虫用本项目同色的生产编组重现。正式 matte 检视与游戏内 Simulator 实渲分别取证。

### 追加的原版实战姿态

- 第一幕楼层 2 的石颚兽满血 43/43。牌在手中、没有位移特效，画面可见地面接触。 [原版石颚兽](https://games.mainguet.org/tests/SlayTheSpire/SlayTheSpire_combat.jpg)
- 第一幕高位灯火房的蓝衣束缚者满血 48/48，意图 12，手牌尚未打出。该截图可辨脚与武器轮廓，较暗的地面以同敌人的 Steam 落雷图交叉参考。 [蓝衣束缚者待机](https://raw.githubusercontent.com/PortsMaster/PortMaster-New/main/ports/slaythespire/screenshot.png) · [Steam 蓝衣束缚者落雷](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/646570/ss_01aa3e7759e457bfbf2422f31c325d7b3ba8a6eb.1920x1080.jpg)
- 第一幕祈火徒的静置出牌期可见腿部落在石地。Nintendo Life 同敌人的图有选牌瞄准叠层，仍可见脚。 [祈火徒静置](https://nguyenhuythanh.com/posts/images/slay-the-spire-fight-1.png) · [祈火徒瞄准](https://images.nintendolife.com/screenshots/97023/large.jpg)
- 蕈甲兽 27/27 与中型酸液团 29/29 同场。酸液团连续腹底可见，蕈甲兽局部被瞄准箭盖住，弯肢仍可辨。 [蕈甲兽与酸液团](https://www.hermitgamer.com/storage/attachments/images/slay-the-spire-ironclad-build.webp)
- 沉眠遗卫满血 109/109，睡眠扁躯贴石。醒后实战裁图可见三只钩脚和地面暗部，主体离地由钩脚支撑。 [沉眠与醒来](https://www.slaythespirestrategies.com/2019/04/lagavulin.html)
- 深渊守卫满血 240/240，普通站姿下双足可辨。瞄准箭盖住上身一部分。 [深渊守卫满血实战](https://www.gamingonlinux.com/uploads/articles/tagline_images/1101909804id14911gol.jpg)
- Mega Crit 官方媒体图的六焰幽核已经激活轨道火焰，主体仍和石地保持大间距，补足上述普通状态的悬浮对照。 [六焰幽核激活](https://www.megacrit.com/images/ss13.jpg)
- 怒焰巨魔在第一幕楼层 8 的静置出牌期可见双脚与接触暗缘。第二幕奴隶主战斗的右侧赤衣束缚者也可辨双足贴石，作为同类姿态附证。 [怒焰巨魔实战](https://i.redd.it/kx2nziovkc2g1.jpeg) · [赤衣束缚者实战](https://i.redd.it/ml670lyfku2f1.png)

本轮新增图直接核验了 `jaw_worm`、`blue_guard`、`raven_adept`、`fungi_beast`、`acid_slime_m`、`lagavulin`、`guardian`、`gremlin_nob`、`red_guard`，并增加 `hexaghost` 激活态。其余原版独立截图未新增，其中双赤甲虫仍使用固定源码与已确认的混色战斗参照。
