# STS1 战斗布局参考

源码固定为 `aeubanks/sts@319009d5df0a82d9fb0f23cc22322286c6a87ec0`。公式坐标采用左下原点，实图读数采用左上原点。实图读数为目测近似值，按原图像素记录。

## 固定源码与几何推导

| 项目 | 1920×1080、各轴比例为 1 时 | 源码 |
| --- | --- | --- |
| 全局地面基线 | y=340，占高度 31.48% | [AbstractDungeon](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/AbstractDungeon.java#L2732) |
| 守护者骨骼锚点 | x=1390、y=240；全局怪物定位是 75% 屏宽与固定地面基线再叠加各自偏移 | [AbstractMonster 构造](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/AbstractMonster.java#L133-L151) · [TheGuardian 构造](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/TheGuardian.java#L85-L112) |
| 守护者命中框与形态 | x=1170..1610，底边 y=335（骨骼锚点上移 95）；攻形态高 350、防形态高 250；形态变换重建命中框，HUD 仍以同一底边定位，意图锚点随顶边下降 100 | [TheGuardian changeState](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/exordium/TheGuardian.java#L228-L258) · [AbstractMonster updateHitbox](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/AbstractMonster.java#L832-L840) |
| 血条 | 稳定后从命中框底边向下偏 28，绘制高 20，故 nominal y=307..327；初次显示有向下归位过渡 | [AbstractCreature renderHealth](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/AbstractCreature.java#L836-L857) · [参数](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/AbstractCreature.java#L104-L116) · [过渡](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/AbstractCreature.java#L650-L658) |
| 状态图标与数值 | 一行。图标中心从命中框左侧向右 10，向下 48（移动 53）；数字右上锚点向右 32、向下 66（移动 75）；步进 48（移动 55），移动 atlas 图标尺寸乘 1.17 | [AbstractCreature renderPowerIcons](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/AbstractCreature.java#L944-L963) · [AbstractPower](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/powers/AbstractPower.java#L167-L195) |
| 五张普通手牌 | 225×315，中心 x=603/771/960/1149/1317、y=15/50/70/50/15，转角 +10/+5/0/−5/−10°。标称全手最高点 227.5；PC 第一状态图标名义底边 263，实际外框由图集决定 | [CardGroup refreshHandLayout](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/CardGroup.java#L216-L281) · [卡面尺寸](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/AbstractCard.java#L2625-L2628) |
| 1～10 张常态布局 | 1～7 张目标缩放 0.75，8/9/10 张依次 0.7125/0.675/0.6375，使用确定的角度扇形、沉降与逐张数的横向坐标 | [CardGroup 列表](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/CardGroup.java#L216-L379) |
| 遮挡与互动 | 手部在 overlay 渲染，晚于房间与怪物 HUD；挪到前景的悬停牌 1×、0°、中心 y=210，理论顶边 y=420。拖拽位置跟指针，移动触屏拖动额外向上偏 270；因此交互中的短暂覆盖符合源码层级。原作怪物状态详情由身体/意图/血条组合热区触发，拖拽期间跳过怪物详情，项目中的单个状态热区属于适配 | [Dungeon 图层顺序](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/dungeons/AbstractDungeon.java#L2149-L2168) · [OverlayMenu](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/OverlayMenu.java#L146-L157) · [悬停](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/AbstractPlayer.java#L797-L825) · [拖拽](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/characters/AbstractPlayer.java#L1137-L1149) · [命中区](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/MonsterGroup.java#L236-L250) |

移动端构造函数只在初次构造时把身体横宽乘 1.17。守护者形态重建时套用 440×scale，不再次叠加该倍数。移动界面调整还有原生横竖缩放，例如 4:3 采用 xScale=WIDTH/1920、yScale=HEIGHT/1080。不能用两幅不同宽高比画面的单一比例去判断落点误差。[构造](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/monsters/AbstractMonster.java#L133-L151) · [Settings](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/Settings.java#L235-L273)

## 实际画面

| 画面（非本项目实测） | 左上原点读数 | 来源 |
| --- | --- | --- |
| Linux/PC，950×534，守护者攻击形态，四牌可见且正在瞄准 | 脚端约 y=365；血条中心约 (688,377)；模式图标约 (584,392)，绿色数值可见；抬升牌上端 y≈390，目标箭头在前景跨过战场 | [报道](https://www.gamingonlinux.com/2019/08/one-of-our-favourite-games-slay-the-spire-is-getting-even-better-on-linux-with-a-new-beta-up/) · [原图](https://www.gamingonlinux.com/uploads/articles/tagline_images/1101909804id14911gol.jpg) |
| PC，1560×878，十张常态牌 | 最靠近手牌的敌方图标底边 y≈690，同一 x 附近的手牌顶边 y≈731，局部纵向间距约 40 px（高度约 4.6%） | [Steam 官方预告的约 0:31 画面及来源说明](https://playcraft.space/gallery/slay-the-spire/combat-ten-card-hand/) · [画面](https://playcraft.space/assets/library/slay-the-spire/slay-the-spire-3.webp) |
| iOS，720×540，守护者攻击形态，敌方回合 | 脚端约 y=370；血条中心约 (521,391)；模式图标约 (444,403)，绿色数值可见；此帧无手牌 | [iOS 试玩文章](https://www.mobile01.com/topicdetail.php?f=676&t=6123104) · [原图](https://attach.mobile01.com/attach/202006/mobile01-1f279a823691f5299a3abdf9f9c3a995.png) |
| iOS，720×540，五张常态牌，甜圈与八体 | 左侧敌方状态最低像素 y≈390，附近手牌上缘 y≈454，局部间距约 64 px（高度约 11.9%）；右侧怪物详情正在显示 | [同一篇 iOS 试玩](https://www.mobile01.com/topicdetail.php?f=676&t=6123104) · [原图](https://attach.mobile01.com/attach/202006/mobile01-ec851abc9e41a017aeb53513cc7873cb.png) |
| Android，800×450，乐加维林瞄准过程 | 选中牌上缘约 y=327，邻牌低于它，红色路径越过战场指向敌人 | [Android Central 试玩](https://www.androidcentral.com/slay-spire-android-game-week) · [原图](https://cdn.mos.cms.futurecdn.net/G673aCZYK3bMKLE3uHiBij.jpeg) |

两端各有读图及源码证据。守护者攻击形态的实图来自四牌瞄准及无牌敌方回合，五张常态牌的实图来自 iOS 的另一阵容。守护者五牌的参数比较基于固定源码推导。
