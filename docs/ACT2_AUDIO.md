# 二幕音频补全

## 修改前审计

基线 `73c21489efaab409d4c0c46bee517d410d3427fc`。原版触发从指定的 [STS1 社区反编译源码](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)核对。候选编号来自 2026-10-11 千星编辑器资产库的社区转录 [音效目录](https://github.com/8itlab/genshin-miliastra-mcp/blob/70470757d6fcb319c5afec13b178c87f2d8d54b3/src/scene/media/sounds.json)和 [音乐目录](https://github.com/8itlab/genshin-miliastra-mcp/blob/70470757d6fcb319c5afec13b178c87f2d8d54b3/src/scene/media/music.json)。编辑器当前版本和本作听感待验。

| 原版触发位置 | 本作基线触发点 | 缺口 | 候选 | 验证 |
| --- | --- | --- | --- | --- |
| `MainMenuScreen` 启动菜单音乐，`CharacterSelectScreen` 开局时才淡出 | `abyss_bgm.scene` 进入菜单即暂停 | 菜单和选角缺曲 | 共用 10041 暮夜绮想 | 主菜单、选角、选角牌库、返回、重新选角，记录原生切曲 |
| `TheCity` 设置幕音乐，`MusicMaster` 管理临时音乐和恢复主曲 | 原生 `ABYSS_BGM` | 已实现地图、商店、营地、普通事件和战后奖励的探索连续性 | 10040；房间交易、休息及事件选择用一次性音效 | 探索页面、房间与覆盖层同 cue |
| `MonsterRoomBoss` 暂停主曲，Boss 和部分事件指定临时曲 | `abyss_bgm.scene` 按房间类型 | 已实现普通、精英、Boss 三档 | 10044、10071、10140 | 三档、事件战斗、战后奖励 |
| `AbstractRoom` 战斗结束与 `DeathScreen` 结算音乐 | `abyss_feedback` 胜败短音；原生图独立结算曲 | 已有两层；失败有受击死亡与横幅两条入口，已有死亡去重 | 保留 50919/50931 与 10152/10179 | 杠杆点为终局帧、清理与重新开局 |
| `MenuButton`、`CharacterOption` 鼠标点击及悬停 | 已有指针所有权与选角确认 | 缺少有效操作短音 | 菜单确认、选择变化，悬停静音 | 点击、相同角色、无效触屏手势和刷新 |
| `DungeonMapScreen.open`、`MasterDeckViewScreen.open` | 地图提交、路线预览、牌库入口 | 缺失 | 页面打开与实际选点分开 | 开关覆盖层、失效或重复提交 |
| 卡牌及各自效果动作 | `abyss_feedback` 出牌、接触与死亡 | 已有，`card_play` 配置未被运行时引用 | 沿用 40313 起手及现有接触音 | 连续出牌、多段、群攻、多敌死亡 |
| `AbstractPotion`、`PotionPopUp` 使用与丢弃 | 战斗提交、房间药水弹窗 | 缺少对应使用和丢弃声音 | 成功消耗、成功丢弃分别提示 | 瞄准、取消、失效、跳过和两种弹窗 |
| `Merchant`、`ShopScreen` 欢迎、买卖、买不起、闲谈 | 商人 compact 版清空入场文本，仅交易和拒绝音已接线 | 缺欢迎；拒绝可反复请求；无可核实对白资源 | 一次店门提示；保留交易与拒绝的 UI 音；闲谈留待真实语音 | 同房刷新、反复点买不起、下一家店 |
| `CampfireSleepEffect`、`CampfireSmithEffect` | `abyss_node_ui_lifecycle` 与房间演出 | 已有成功休息/锻造，二选一接线 | 40002、50418 | 预览/取消静音，提交与播放帧共计一次 |
| `AbstractEvent` 各事件自行触发 | 节点动作提交 | 普通选择基本静默，个别已有奖励/净化音 | 成功确认音，金币及遗物优先 | 失败、奖励、打开选牌预览 |
| `AbstractChest.open`、`BossChest.open` | 宝箱打开、房间演出和领取 | 已覆盖开箱及宝箱领取 | 保留既有开箱，按实际金币或遗物发声 | 开箱、领取、跳过、刷新 |
| `RewardItem.claimReward`、`AbstractRelic` 获得音 | 战斗奖励及事件遗物提交 | 战斗奖励缺少分类反馈 | 金币、遗物、卡牌、药水各一次 | 领取成功、满药水栏、重复或跳过 |
| `EndTurnButton`、战斗回合提示 | `abyss_feedback` 双方横幅 | 两次对应两个回合边界 | 50926 | 正常和快速回放各有效边界一次 |
| `monsters/city` 各敌人的行动、发声、受击、死亡 | `intentStep` 用 `definitionId` 找键；基础主题检查只读 23 个一幕定义 | 二幕 17 个行动键完全缺失；命中与死亡已有独立触发 | 按下表试配，主打机械、魔法、兽鸣和短动作，保留一幕 | 构造 17 位战斗实体核对实际 ID，再驱动行动回放 |

## 二幕全部敌人

每位敌人按战斗实体的 `definitionId` 在行动起手取 `action_<id>`。睡眠、眩晕和逃跑静音。多段仍保留各实际接触帧的命中，同一群攻接触和群死批次各有去重。二幕 Boss 和精英采用下表的身份提示。

| 实际 `definitionId` | 原版战斗触发参考 | 行动 ID 与目录条目 | 选配理由 | 死亡 ID |
| --- | --- | --- | --- | --- |
| `spheric_guardian` | [SphericGuardian](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SphericGuardian.java) · 起手护盾、重捶动作 | 50421 场景物件_碰撞反馈_金属_04 | 金属机关 | 50423 |
| `centurion` | [Centurion](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Centurion.java) · 进攻发声、重锤接触 | 20167 怪物叫声_丘丘人_攻击_10 | 近战人形发声 | 30004 |
| `mystic` | [Healer](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Healer.java) · 行动及死亡发声 | 40003 战斗_治疗_回复_03 | 治疗能力 | 30004 |
| `taskmaster` | [Taskmaster](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Taskmaster.java) · 行动与死亡各有发声 | 20168 怪物叫声_丘丘人_攻击_11 | 人形挥鞭起手发声 | 30004 |
| `book_of_stabbing` | [BookOfStabbing](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BookOfStabbing.java) · 多刺各有穿刺 SFX，另有死亡 | 40310 战斗_近战攻击_武器_单手剑… | 快速刃器；起手一次 | 50614 |
| `snake_plant` | [SnakePlant](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/SnakePlant.java) · 啃咬、孢子各自呈现 | 20104 怪物叫声_魔兽_C_攻击_01 | 怪物撕咬 | 20093 |
| `chosen` | [Chosen](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Chosen.java) · 巫术效果，另有死亡音 | 50597 场景物件_通用魔法_激活-出… | 魔法起势 | 50614 |
| `shelled_parasite` | [ShelledParasite](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/ShelledParasite.java) · 重击、连击、吸血动作 | 20119 怪物叫声_魔兽_D_攻击_01 | 厚甲野兽 | 20093 |
| `byrd` | [Byrd](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Byrd.java) · 攻击发声、坠地与死亡另有触发 | 20042 动物叫声_鸟_叫声_02 | 鸟鸣 | 20092 |
| `snecko` | [Snecko](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Snecko.java) · 凝视起手及独立死亡音 | 20136 怪物叫声_魔兽_E_攻击_01 | 爬兽发声 | 20092 |
| `mugger` | [Mugger](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Mugger.java) · 攻击与死亡各有发声 | 20169 怪物叫声_丘丘人_攻击_12 | 劫匪起手发声 | 30004 |
| `gremlin_leader` | [GremlinLeader](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/GremlinLeader.java) · 连刺、召援、鼓舞各自呈现 | 20173 怪物叫声_丘丘人_嘲讽_03 | 丘丘人嘲讽；督军号令 | 30004 |
| `torch_head` | [TorchHead](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TorchHead.java) · 冲撞动作 | 40203 战斗_受击_命中_弓箭受击_01 | 元素起手效果 | 50614 |
| `collector` | [TheCollector](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/TheCollector.java) · 召唤和大减益各有专门 SFX | 50595 场景物件_通用魔法_激活-出… | 魔法召唤／诅咒 | 50614 |
| `automaton` | [BronzeAutomaton](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeAutomaton.java) · 浮核召唤两类提示音 | 50055 场景物件_常用元素_卡通_01 | 机械启动 | 50423 |
| `bronze_orb` | [BronzeOrb](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/BronzeOrb.java) · 光束专门 SFX | 50590 场景物件_通用魔法_激活-出… | 短促魔法激活 | 50423 |
| `champ` | [Champ](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/city/Champ.java) · 架势、耳光和怒吼；独立死亡发声 | 20175 怪物叫声_丘丘人_嘲讽_05 | 人形嘲讽；斗魁挑衅 | 30004 |

## 一幕沿用的敌人映射

| `definitionId` | 行动 ID 与目录条目 | 死亡 ID |
| --- | --- | --- |
| `cultist` | 20171 怪物叫声_丘丘人_嘲讽_01 | 30004 |
| `jaw_worm` | 20089 怪物叫声_魔兽_B_攻击_01 | 20092 |
| `red_louse` | 20080 怪物叫声_魔兽_A_攻击_01 | 20092 |
| `green_louse` | 20081 怪物叫声_魔兽_A_攻击_02 | 20092 |
| `acid_slime_s` | 20082 怪物叫声_魔兽_A_攻击_03 | 50614 |
| `acid_slime_m` | 20083 怪物叫声_魔兽_A_攻击_04 | 50614 |
| `acid_slime_l` | 20084 怪物叫声_魔兽_A_攻击_05 | 50614 |
| `spike_slime_s` | 20085 怪物叫声_魔兽_A_攻击_06 | 50614 |
| `spike_slime_m` | 20096 怪物叫声_魔兽_B_攻击_04 | 50614 |
| `spike_slime_l` | 20097 怪物叫声_魔兽_B_攻击_05 | 50614 |
| `looter` | 20146 怪物叫声_丘丘人_攻击_01 | 30004 |
| `blue_slaver` | 20147 怪物叫声_丘丘人_攻击_02 | 30004 |
| `red_slaver` | 20148 怪物叫声_丘丘人_攻击_03 | 30004 |
| `fungi_beast` | 20090 怪物叫声_魔兽_B_攻击_02 | 20092 |
| `mad_gremlin` | 20149 怪物叫声_丘丘人_攻击_04 | 20092 |
| `sneaky_gremlin` | 20150 怪物叫声_丘丘人_攻击_05 | 20092 |
| `fat_gremlin` | 20151 怪物叫声_丘丘人_攻击_06 | 20092 |
| `wizard_gremlin` | 20152 怪物叫声_丘丘人_攻击_07 | 20092 |
| `shield_gremlin` | 20153 怪物叫声_丘丘人_攻击_08 | 20092 |
| `gremlin_nob` | 20098 怪物叫声_魔兽_B_攻击_06 | 20093 |
| `lagavulin` | 20099 怪物叫声_魔兽_B_攻击_07 | 20093 |
| `sentry` | 50421 场景物件_碰撞反馈_金属_04 | 50423 |
| `guardian` | 50422 场景物件_碰撞反馈_金属_05 | 50423 |

## 共享音效与场景音乐

| Cue | ID 与目录条目 | 触发 |
| --- | --- | --- |
| `menu_confirm` | 50916 确认按钮_轻 | 有效菜单动作与开局确认 |
| `character_select` | 50942 切换_轻_选择_01 | 角色或元素确实变化 |
| `map_open` | 50944 切换_轻_展开_01 | 路线预览打开 |
| `map_pick` | 50948 切换_轻_标记_01 | 地图选点提交 |
| `deck_open` | 50950 切换_中_页面打开_01 | 牌库、战斗牌堆、遗物查看、重开战斗奖励 |
| `deck_close` | 50951 切换_中_页面关闭_01 | 主动关牌库 |
| `potion_use` | 50591 场景物件_通用魔法_激活-出… | 实际消耗药水 |
| `potion_discard` | 50930 提示性UI_轻_删除 | 实际丢弃药水 |
| `potion_claim` | 50935 提示性UI_中_恢复 | 成功领取药水 |
| `merchant_greet` | 50923 提示性UI_重_页面开启_01 | 每次真正进入新商店时的界面提示 |
| `merchant_buy` | 50940 切换_轻_提升_01 | 购买和付费删牌成功 |
| `merchant_deny` | 50937 提示性UI_中_锁定 | 明确买不起，同一提示显示期间只响一次 |
| `event_confirm` | 50917 确认按钮_中 | 事件选项或一般营地奖励提交 |
| `gold_gain` | 50419 场景物件_碰撞反馈_金属_02 | 领取战斗金币、取回失金或房间实际增加金币 |
| `player_action` | 40313 战斗_近战攻击_武器_单手剑… | 每张成功出牌的单次动作反馈 |
| `hit` | 40106 战斗_受击_命中_躯体打击_-… | 普通命中 |
| `hit_heavy` | 40224 战斗_受击_命中_爆炸_岩_04 | 重击命中 |
| `hurt` | 50936 提示性UI_中_扣血 | 玩家受击 |
| `block_hit` | 50420 场景物件_碰撞反馈_金属_03 | 完全格挡 |
| `block_gain` | 50940 切换_轻_提升_01 | 实际获得格挡 |
| `status` | 50928 提示性UI_重_提示_03 | 战斗状态变化 |
| `turn` | 50926 提示性UI_重_提示_01 | 敌方和我方回合各有边界 |
| `enemy_die` | 20092 怪物叫声_魔兽_B_死亡_01 | 通用敌人死亡 |
| `enemy_die_human` | 30004 人物动作_倒地_01 | 人形死亡 |
| `enemy_die_magic` | 50614 场景物件_通用魔法_消失-失… | 魔法类死亡 |
| `enemy_die_metal` | 50423 场景物件_碰撞反馈_金属_06 | 机械类死亡 |
| `enemy_die_large` | 20093 怪物叫声_魔兽_B_死亡_02 | 大型怪物死亡 |
| `victory` | 50919 提示性UI_重_结束_01 | 战斗胜利短音 |
| `defeat` | 50931 提示性UI_轻_失败 | 角色死亡或失败横幅短音 |
| `forge` | 50418 场景物件_碰撞反馈_金属_01 | 锻造成功 |
| `rest` | 40002 战斗_治疗_回复_02 | 营地休息 |
| `heal` | 40001 战斗_治疗_回复_01 | 战斗内实际治疗 |
| `treasure_open` | 50214 场景物件_机关交互_宝箱_01 | 开宝箱 |
| `reward` | 50919 提示性UI_重_结束_01 | 战利品与获得遗物/钥匙 |
| `card_remove` | 50928 提示性UI_重_提示_03 | 事件净化/移除 |
| `card_play` | 50916 确认按钮_轻 | 历史配置，现有出牌统一走 player_action |
| `prologue_rumble` | 40224 战斗_受击_命中_爆炸_岩_04 | 历史配置，当前无调用 |
| `prologue_crack` | 50928 提示性UI_重_提示_03 | 历史配置，当前无调用 |
| `prologue_rise` | 50926 提示性UI_重_提示_01 | 历史配置，当前无调用 |

| 场景 | 原生曲目 | 秒数 | 循环 | 音量 |
| --- | --- | --- | --- | --- |
| 主菜单、选角和选角牌库 | 10041 暮夜绮想 | 98 | 是 | 40 |
| 地图、开场、商店、营地、事件、宝箱和战后奖励 | 10040 谨慎的探索 | 57 | 是 | 45 |
| 普通战与普通事件战斗 | 10044 战斗的秘仪 | 261 | 是 | 45 |
| 精英战 | 10071 难逃之阵 | 256 | 是 | 45 |
| Boss 战 | 10140 无尽的挑战 | 323 | 是 | 45 |
| 本局胜利结果 | 10152 欢笑的凯旋 | 111 | 否 | 40 |
| 本局失败结果 | 10179 愁绪谧息 | 129 | 否 | 40 |
| 平台结算提交或脚本致命错误 | 原生暂停 | — | — | — |

10044 沿用用户先前认可的选曲。10041 作为主菜单与选角的试听候选。其余曲目沿用既有编号。商店、营地和事件维持同一探索曲。战斗类型变化时由平台换曲，回探索时平台从片段起点播放。原版营地有持续火声，本作保留探索曲和休息提示，以免多一条需要跨房间管理的循环。商人交易与买不起的短音继续承担操作反馈，真实欢迎对白、交易对白和闲谈语音待编辑器确认。40313 是武器动作。丘丘人目录项是怪物叫声。

目录快照 SHA-256 为 `0b79b167db6a0ca80e622498987974b6b17424687e87730fb3e64b4684a30997`（SFX）及 `29fe676b0886548fee65b01a263560f3a8228cf4f43898e8f6b6ae7bceb83150`（BGM）。带省略号的条目按目录原样记录。声音的长度、强度、混音与语音匹配均待同候选实机试听。

## PC 和手机试听清单

- **PC · 菜单与房间**：主菜单等入曲，开关选角和初始牌库，切换两种可用元素再确认开局。进入商店、营地、事件，打开并关闭牌库和路线预览。确认菜单和选角之间、同一探索曲的房间之间的连续性。探索曲至少试听完整跨过 57 秒循环点。
- **PC · 战斗**：分别进入普通、精英和 Boss 战，听普通战 10044。覆盖刺棘秘典多段、巡风隼连续啄击、丘丘督军召援、聚烬领主咒术、青铜机枢召浮核、磐岩斗魁挑衅。连续出牌后群攻同时杀死多个敌人，辨认起手、命中和死亡，留意发声的频率与响度。
- **手机 · 有效操作**：快速点选、滑动取消和重复触屏，检查悬停静音。试正常购买、连续点买不起、成功锻造、开箱及领取、药水使用和丢弃、卡牌及金币和遗物奖励。每次成功动作听一次，预览、刷新及失效操作应保持安静。
- **PC 和手机 · 结果与恢复**：听一次胜利和失败及其曲尾。从战斗返回主菜单再继续，平台结算后重新挑战，退出关卡再进。核对旧曲消失、新曲只起一次，以及战斗演出和结算音的衔接。
- 同一候选留存含声音录屏或 WAV，附 GIL SHA-256、设备、时间戳、`ABYSS_AUDIO`、`ABYSS_BGM_REQUEST` 和 `ABYSS_BGM_APPLIED`。当前设备条目均为**待验**。录音到手后再确认曲目、尾音与混音。

## 验证入口

`tests/lua/feedback_polish.lua` 逐个创建 17 位二幕敌人并经过生产回放，检查实际 ID、行动唯一请求及死亡编号分离。既有回放用例保留多段、群攻、同批多敌死亡、连续出牌、取消后无旧音重播。交互回归见 `tests/lua/act2_audio_interactions.lua`。音乐由 `native_bgm.lua`、`native_bgm_host.lua`、原生图及打包测试覆盖。异常路径沿用致命启动／更新故障的停播合同。

```sh
npm run build:data && npm run build:ui
node scripts/test-lua.mjs tests/lua/act2_audio_interactions.lua
node scripts/test-lua.mjs tests/lua/feedback_polish.lua
node scripts/test-lua.mjs tests/lua/feedback_continuous_cards.lua
node --test tests/native-bgm-graph.test.mjs tests/native-bgm-build-provenance.test.mjs tests/native-audio-release-provenance.test.mjs
npm run check:engineering
npm run build:native -- <千星底图.gil> build/act2-audio-playtest
```

使用 `audio/candidate.json` 核对最终 GIL 的身份。空白底图用来验证离线装配，PC 和手机试听请使用实际关卡底图重建。
