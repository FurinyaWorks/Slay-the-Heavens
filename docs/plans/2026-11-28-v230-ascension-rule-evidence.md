# v2.3.0 进阶规则来源与实装对照

核对基线为 `develop@32a15219aecd145c59cb1b2fcf477e5556766e5d`。原版以仓库既有的 STS1 PC 社区反编译镜像 `aeubanks/sts@319009d5df0a82d9fb0f23cc22322286c6a87ec0` 为固定证据。[版本声明][version]为 V2.3.4（2022-12-18），已只读核对相关实现。镜像未与官方安装二进制鉴证。以下记录玩法事实和本作的映射。开局生命的取整及分档交叉参照了 [SlaySpireDB 的 V2.3.4 记录][db]。[既有证据口径](../rules/evidence/fresh-run-seed-20261024.json)

## A0～A14 累积规则

每行的规则从对应难度开始生效。表中的位置为该基线的候选接入点。以下生命、金币的非负整数都按最接近整数取整，半数向上。

| 档位 | STS1 V2.3.4 依据与行为 | 本作接入点 |
| --- | --- | --- |
| A0 | 普通模式，作为同开关双态、固定种子以及旧调用的回归对照。 | `abyss_run_initialization.lua`、既有业务回放 |
| A1 | 原精英池配额为 `round(n × 0.08)`。A1 在取整前继续乘 `1.6`。原版按 Java binary32 顺序从左到右乘，`n` 为配额算法的可用节点计数。其他特殊房间配额不变，普通战斗消化剩余。精英实际放置受楼层、父节点和同父节点约束。[Dungeon 配额][quota] [Exordium 权重][exordium] | `abyss_map_rooms.lua` 的配额和分配。保留现有节点计数、限制与地图流。 |
| A2 | 普通怪按原敌人及技能分别改伤害、连击次数或力量等，见下表。 | 静态敌人定义、动态敌人生成与初始化 |
| A3 | 精英按原敌人分别改数值，含缚役监军的伤口数量，见下表。 | 同上 |
| A4 | Boss 按原敌人分别改攻击及部分力量数值，见下表。 | 同上 |
| A5 | 换幕时通过通常治疗路径恢复 `round((上限 − 当前生命) × 0.75)`。[换幕][transition] | `abyss_run_transition.lua` 的 `advanceAct` 及现有 `Run.heal` |
| A6 | 新局初始当前生命取 `round(本局生命上限 × 0.9)`。每局一次。[初始化][transition] | `abyss_run_initialization.lua`，在选定角色且 A14 初始上限已调整后 |
| A7 | 普通怪提高生命区间或防御参数。磐核守卫维持固定生命，见下表。 | 静态敌人定义、动态敌人生成与初始化 |
| A8 | 精英提高生命区间，见下表。 | 同上 |
| A9 | Boss 及指定随从提高生命，部分 Boss 同时提高防御/相变门槛，见下表。 | 同上 |
| A10 | 每次新局向永久牌组顶放入一张进阶之灾。它是特殊诅咒、不可打出、虚无、不可升级。普通移除或转换筛选排除其身份。[初始化][transition] [牌定义][bane] [筛选][purge] | 原生卡牌定义及 `abyss_run_initialization.lua`，复用 `abyss_purge_candidates.lua`、`abyss_fountain.lua` 与既有虚无结算。覆盖实际移除和转换命令。 |
| A11 | 玩家初始化时药水位减一，标准 3→2。初始化后正常容量修饰仍可叠加。[容量][potion] | `abyss_run_initialization.lua` 与 `abyss_run_potions.lua` 已有容量入口 |
| A12 | 第一幕 0%→0%，第二幕 25%→12.5%，原版第三、四幕 50%→25%。常规奖励中对非稀有牌先抽升级概率，再判可升级。第一幕概率为 0 时也保留该抽样。[第一幕][exordium] [第二幕][city] [第三幕][beyond] [第四幕][ending] [奖励][cards] [概率抽样][chance] | `abyss_acts.lua` 与 `abyss_card_pool.lua` 常规战斗卡牌奖励。两幕验收表取前两幕。 |
| A13 | 原金币流先抽一次 `100 + random(-5,5)`，再应用 `round(基数 × 0.75)`。结果 71～79。已有金币奖励修饰在生成基础奖励之后结算。[Boss 金币][gold] | `abyss_gold_rewards.lua` 现有 `prepare`，接入奖励事务，保留危险房间和宝箱各自的随机流。 |
| A14 | 铁甲战士初始生命上限减 5，静默猎手、故障机器人、观者各减 4。初始化先减初始上限，再做 A6。原版各角色定义独立，按已批准范围仅映射岩旅行者。[顺序][transition] [铁甲战士][ironclad] [静默猎手][silent] [故障机器人][defect] [观者][watcher] | 角色级数据与开局快照。岩旅行者 80→75。 |

`n=32` 时 A0/A1 精英配额分别为 3/4。`n=20` 时分别为 2/3。拿已经取整的 3 再乘 1.6 在第一个向量会得到 5。用相同的 `n` 比配额，并单独核对真实地图的放置限制与节点分布。配额阶段只计算数量，业务 RNG 仍由既有地图生成拥有。

## 第一、二幕在库敌人映射

每行只列 V2.3.4 在 A0～A14 内的变化。数值格式为 A0→对应档位，生命区间端点均包含。第一幕定义见 `data/enemies.json`、`abyss_act1_bosses.lua`。第二幕见 `abyss_act2_enemies.lua`。事件专用定义见 `abyss_event_combat_enemies.lua`。原版类名链接指向实际参数。按敌人身份匹配阈值，例如何种房间引用 Slaver 或 Sentry 由既有编队定义决定。随从继承表内对应阈值。

| 本作 ID | STS1 来源 | A2 攻击等变化 | A7 生命等变化 |
| --- | --- | --- | --- |
| `raven_adept` | [Cultist][cultist] | 仪式 3→4，攻击仍为 6 | 48–54→50–56 |
| `jaw_worm` | [JawWorm][jawworm] | 啃咬 11→12，怒吼力量 3→4 | 40–44→42–46 |
| `red_louse` | [LouseNormal][lousen] | 啃咬 5–7→6–8 | 10–15→11–16，蜷缩格挡 3–7→4–8 |
| `green_louse` | [LouseDefensive][loused] | 啃咬 5–7→6–8 | 11–17→12–18，蜷缩格挡同上 |
| `acid_slime_s/m/l` | [小][as] [中][am] [大][al] | 小 3→4。中腐蚀/撞击 7/10→8/12。大腐蚀/撞击 11/16→12/18 | 小 8–12→9–13。中 28–32→29–34。大 65–69→68–72 |
| `spike_slime_s/m/l` | [小][ss] [中][sm] [大][sl] | 小 5→6。中 8→10。大 16→18 | 小 10–14→11–15。中 28–32→29–34。大 64–70→67–73 |
| `looter` | [Looter][looter] | 普通/猛击 10/12→11/14 | 44–48→46–50 |
| `blue_guard` / `red_guard` | [SlaverBlue][blue] [SlaverRed][red] | 蓝主/副 12/7→13/8。红主/副 13/8→14/9 | 均 46–50→48–52 |
| `fungi_beast` | [FungiBeast][fungi] | 强化力量 3→4，基础伤害仍为 6 | 22–28→24–28 |
| `mad_gremlin` | [GremlinWarrior][mad] | 4→5 | 20–24→21–25 |
| `sneaky_gremlin` | [GremlinThief][sneaky] | 9→10 | 10–14→11–15 |
| `fat_gremlin` | [GremlinFat][fat] | 4→5 | 13–17→14–18 |
| `wizard_gremlin` | [GremlinWizard][wizard] | 25→30 | 21–25→22–26 |
| `shield_gremlin` | [GremlinTsundere][shield] | 6→8 | 12–15→13–17，给队友的格挡 7→8 |
| `spheric_guardian` | [SphericGuardian][sphere] | 单次伤害 10→11，连击段数照旧 | 固定 20 |
| `centurion` | [Centurion][centurion] | 斩击 12→14，狂怒 6×3→7×3 | 76–80→78–83 |
| `mystic` | [Healer][healer] | 攻击 8→9，强化力量 2→3 | 48–56→50–58 |
| `snake_plant` | [SnakePlant][snake] | 7×3→8×3 | 75–79→78–82 |
| `chosen` | [Chosen][chosen] | 电击 18→21，衰弱打击 10→12，戳击 5×2→6×2 | 95–99→98–103 |
| `shelled_parasite` | [ShelledParasite][parasite] | 双击 6×2→7×2，重击 18→21，吸血 10→12 | 68–72→70–75 |
| `byrd` | [Byrd][byrd] | 啄击 1×5→1×6，俯冲 12→14 | 25–31→26–33 |
| `snecko` | [Snecko][snecko] | 咬击/尾击 15/8→18/10 | 114–120→120–125 |
| `mugger` | [Mugger][mugger] | 普通/猛击 10/16→11/18 | 48–52→50–54 |
| `bandit_pointy` / `bandit_leader` / `bandit_bear` | [Pointy][pointy] [Romeo][romeo] [Bear][bear] | 依次为 5→6，Cross Slash/Agonizing Slash 15/10→17/12，Maul/Lunge 18/9→20/10 | 依次为 30→34，35–39→37–41，38–42→40–44 |

史莱姆生命区间用于初始随机生成。分裂构造仍以既有父体当时生命给子体初始化，保留子体技能自身的 A2 数值。中/大型史莱姆用于随机初始生成及分裂的构造分支可见各类参数。

| 本作 ID | STS1 来源 | A3 攻击等变化 | A8 生命等变化 |
| --- | --- | --- | --- |
| `gremlin_nob` | [GremlinNob][nob] | Skull Bash/Bull Rush 6/14→8/16 | 82–86→85–90 |
| `lagavulin` / `lagavulin_awake` | [Lagavulin][lag] | 18→20，事件唤醒入口保留其初始状态 | 109–111→112–115 |
| `sentry` | [Sentry][sentry] | 光束 9→10 | 38–42→39–45 |
| `taskmaster` | [Taskmaster][taskmaster] | 每次攻击加入 1→2 张伤口，伤害仍为 7 | 54–60→57–64 |
| `book_of_stabbing` | [BookOfStabbing][book] | 多刺每段 6→7，重刺 21→24 | 160–164→168–172 |
| `gremlin_leader` | [GremlinLeader][leader] | 鼓舞力量 3→4，攻击仍为 6×3 | 140–148→145–155 |

| 本作 ID | STS1 来源 | A4 攻击等变化 | A9 生命等变化 |
| --- | --- | --- | --- |
| `guardian` | [TheGuardian][guardian] | Fierce Bash/Roll 32/9→36/10 | 240→250，首个姿态切换伤害门槛 30→35 |
| `hexaghost` | [Hexaghost][hex] | 火焰连击 5×2→6×2，Inferno 2×6→3×6，Divider 仍由玩家当前生命决定 | 250→264 |
| `slime_boss` | [SlimeBoss][slimeboss] | Slam 35→38。构造另有 Tackle 9→10 字段，原版正式选招仅使用 Slam，测试以实际行动为准。 | 140→150 |
| `collector` | [TheCollector][collector] | 火球 18→21，鼓舞力量 3→4 | 282→300，格挡 15→18 |
| `automaton` | [BronzeAutomaton][automaton] | 甩击 7×2→8×2，光束 45→50，强化力量 3→4 | 300→320，强化格挡 9→12 |
| `champ` | [Champ][champ] | 斩击/掌击 16/12→18/14，强化力量 2→3（暴怒为三倍 6→9），处决仍为 10×2 | 420→440，防御格挡 15→18，Metallicize 5→6 |
| `torch_head` / `bronze_orb` | [TorchHead][torch] [BronzeOrb][orb] | 保持 | 炬火侍从 38–40→40–45，青铜浮核 52–58→54–60。两者战斗归类可保留普通，生命阈值遵循各自 A9。 |

表覆盖基线前两幕常规编队、Boss 与相关事件专用敌人。代码库另有第三、四幕及原型、调试遭遇。本轮验收以用户批准的两幕候选为界，不据此推定其他编队的进阶数值或改变任何章节发布配置。

## 可独立验收的切片

- **T02 地图。** 对固定种子分别检查关闭/A0 的原有地图与业务流、A1 配额向量、有效放置约束、同难度重放。A1 和 A14 的地图规则一致。房间分配继续通过原地图所有者，避免把配额增幅变成每格独立掷骰。
- **T02 敌人。** 用真实战斗初始化与执行入口逐个检查表内属性的门槛前后。特别检查 Sentry 在普通编队仍用 A3/A8、Slavers 在精英编队仍用 A2/A7、Gremlin Leader 召出的普通随从、两种 Boss 随从以及分裂。用代表性固定种子检查 A0 原有战斗流。在 A14 检查低档强化仍生效。技能意图和实际数值使用同一来源。
- **T03 玩家。** 岩旅行者 A0 为 80/80、A6 为 72/80、A14 为 68/75。A5 缺血 1/2/3/6 点分别恢复 1/2/2/5，按现有治疗效果结算。A10 检查虚无只移出本场手牌、永久牌组仍持有一张，商店与事件移除/转换路径都拒绝。A11 基础槽位 3→2，药带等既有扩容继续生效。
- **T03 奖励。** A12 按幕、稀有度和固定随机向量检验实际奖励卡。A13 用 95→71、98→74、100→75、105→79 检查先抽后缩放，并确认仍只消费原金币流一次。用旧回放验证原 A0 结果和取得奖励前后的流状态。

[db]: https://slayspiredb.com/zh-hans/sts1/ascension
[version]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/CardCrawlGame.java#L112
[quota]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/AbstractDungeon.java#L538-L572
[transition]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/AbstractDungeon.java#L2562-L2581
[exordium]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/Exordium.java#L91-L104
[city]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/TheCity.java#L72-L80
[beyond]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/TheBeyond.java#L77
[ending]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/TheEnding.java#L155
[cards]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/AbstractDungeon.java#L1445-L1457
[chance]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/random/Random.java#L79-L82
[bane]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/curses/AscendersBane.java#L17-L32
[purge]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/CardGroup.java#L958-L968
[potion]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/AbstractPlayer.java#L188-L200
[gold]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/rooms/AbstractRoom.java#L276-L287
[ironclad]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/Ironclad.java#L156-L158
[silent]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/TheSilent.java#L159-L161
[defect]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/Defect.java#L156-L158
[watcher]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/Watcher.java#L193-L195
[cultist]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/Cultist.java#L54-L62
[jawworm]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/JawWorm.java#L74-L97
[lousen]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/LouseNormal.java#L50-L66
[loused]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/LouseDefensive.java#L53-L69
[as]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/AcidSlime_S.java#L39-L51
[am]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/AcidSlime_M.java#L50-L67
[al]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/AcidSlime_L.java#L66-L87
[ss]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SpikeSlime_S.java#L37-L46
[sm]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SpikeSlime_M.java#L46-L60
[sl]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SpikeSlime_L.java#L62-L80
[looter]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/Looter.java#L59-L71
[blue]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SlaverBlue.java#L45-L55
[red]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SlaverRed.java#L55-L65
[fungi]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/FungiBeast.java#L50-L61
[mad]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinWarrior.java#L43-L52
[sneaky]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinThief.java#L42-L48
[fat]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinFat.java#L46-L55
[wizard]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinWizard.java#L46-L55
[shield]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinTsundere.java#L46-L58
[nob]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/GremlinNob.java#L61-L72
[lag]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/Lagavulin.java#L63-L75
[sentry]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/Sentry.java#L53-L61
[guardian]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/TheGuardian.java#L90-L106
[hex]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/Hexaghost.java#L95-L120
[slimeboss]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/SlimeBoss.java#L78-L91
[sphere]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SphericGuardian.java#L40-L48
[centurion]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Centurion.java#L51-L65
[healer]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Healer.java#L53-L70
[snake]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SnakePlant.java#L53-L59
[chosen]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Chosen.java#L74-L87
[parasite]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/ShelledParasite.java#L74-L88
[byrd]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Byrd.java#L72-L88
[snecko]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Snecko.java#L66-L77
[mugger]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Mugger.java#L57-L69
[pointy]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BanditPointy.java#L40-L46
[romeo]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BanditLeader.java#L54-L65
[bear]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BanditBear.java#L51-L62
[taskmaster]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Taskmaster.java#L45-L54
[book]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BookOfStabbing.java#L55-L66
[leader]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/GremlinLeader.java#L66-L79
[collector]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TheCollector.java#L81-L101
[automaton]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeAutomaton.java#L71-L87
[champ]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Champ.java#L96-L131
[torch]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TorchHead.java#L42-L49
[orb]: https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeOrb.java#L44-L53
