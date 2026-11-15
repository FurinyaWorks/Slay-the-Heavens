# TASK-4.5：原生 Power 数字对齐适配

本切片只修正 Power 数字相对图标的原生字体投影。保持20号字、完整正负数、状态数量/顺序、点击身份、原 source geometry、actor/art/实际命中区及核心规则。没有推广已否决的 HP 横向铺满或双带布局；TASK-4.5 整体仍未完成。

## 原版事实与平台适配

固定参考为社区反编译镜像 [aeubanks/sts@319009d5](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)。[AbstractPower.renderAmount](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/powers/AbstractPower.java#L184) 调用 `renderFontRightTopAligned`；[FontHelper](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/helpers/FontHelper.java#L687) 先测原字号 GlyphLayout 高 H0，再向上加回该高度。与同文件 centred 绘制式相减，源目标中心为 `amountY + H0`。[AbstractCreature](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/AbstractCreature.java#L944) 的 amount 原点相对 icon 为 desktop -18 / mobile -22 source px。

原生控件为 right/top、40高透明文本框、20号字。旧框中心 `project(amountY)-20`，按项目20像素保守字形预算，墨迹中心为 `project(amountY)-10`，方向相反。现框中心为 `project(amountY)+1.5*20-40/2`，预算中心为 `project(amountY)+20`，保持原横向 right anchor。

此20是项目既有 native 字形预算，不是原版 H0。源 powerAmountFont 使用 `font/04b03.ttf`，desktop nominal16 / mobile20，另受 Settings.scale、BIG_TEXT_MODE 与 FreeType 参数影响；固定源完整 Git 树未含字体资产，FontInfo 也无量测。现有离线官方 ClientUITextBoxControl 文档仅列字号/对齐/自适应等，没有公开字形测量方法。本轮未取得精确字体高度，不声明像素复刻、官方或设备验收。

完整参考 Git blob：AbstractPower `70347e8e642e8c45e6c6aadbe6e34f0472220c18`，FontHelper `41862f2f8fea30e33ca3b5078df70f211aa8844b`，AbstractCreature `bee5f7d0d955528b69007376cc0465ed60e577c6`。

## 实证

新真实 Host 回归在完整旧模块上首先于 `NATIVE_POWER_RIGHT_TOP` 断言失败；当前90个桌面/触屏、1/10/99/100/999/1000/-7/-999/0投影通过。完整 Run 快照、核心容器引用、actor 命中区、Power 原顺序和真实 status hit 回调身份保持。三位 Block 容量不足仍显式断言为已知 NoGo，没有借本切片修正或抹去。

生产当前布局、完整真实1/5/10张静止手牌的保守矩形对照（没有加载任何 HP/双带候选）：

| 来源 | 旧碰撞数 | 新碰撞数 |
| --- | --- | --- |
| Lots of Slimes | 0 / 2 / 4 | 0 / 0 / 0 |
| Gremlin Gang | 0 / 1 / 4 | 0 / 0 / 2 |

Gremlin10张剩余两处是 sneaky_gremlin_3 的 **icon** 与第9/10张牌，仍为失败；不把数字方向修正当作图标、Block/HP 容量、HP999/999、邻接或整体验收通过。原诊断及30项碰撞记录原样保留，见 [原诊断](TASK-4.5-NATIVE-BLOCK-DIAGNOSIS-20261114.md)。旧 source 窄HP三位容量、水平归属与双带净空 NoGo 均没有改要求。

复现：先 `npm run build:data`、`npm run build:ui`；运行 `node experiments/native-power-count-alignment/run.mjs <新的build子目录>`。真实 Lua 失败状态记录在 result.json，外层脚本为完整保存所有对照场景而正常返回；不能用其退出码冒充所有场景绿。完整场景为离线 Host 控件/预算快照，未知素材与浏览器字体不证明原生实际墨迹。

## 工程与历史来源

当前模块 LF SHA256 `a760832e5d98e689ad1ae16437544cdda0f2082089058ea9174fe730e42c7bbe` / Git blob `eaecfa88b7606fb9523ae98122fdea397a665e3d`；旧模块 `64a01d5c8b97872a574749418afa0ee415290a760f62f8b70e40f369a9f90627` / `ce7e3f358c6508a9a49e836f6fef36b8b131d361`。完整 before/after fixture 绑定，只对 exact path 和完整双身份投影；未知、污染、异路径不获得读取许可。原 proof/current 仍描述旧历史来源，不能称为新生产已认证。

初次5项 Node 运行4绿1红（37575.0389ms）：真实 corpus 中该模块历史目标均相同，未列 owners，单靠旧 owner 循环未采样 continuation 自身，after→before切换负控被接受。现显式在调用内采样一次自身，若也属于 owner 则复用同次样本；没有跨调用授权缓存。bounded 与真实 corpus 的污染、缺失、换读数、warm 后恢复均复验，非 owner 情形另有低成本固定回归。

来源与 Host 按既有测试入口拆成两文件，保留原预算：新 Host完整2/2 20768.5652ms；来源完整3/3 20307.766ms，新增缺失/非owner负控又定向1/1 83.5182ms。既有 Power/模板/presentation 共9/9 13291.981ms。历史来源46项首轮45绿，唯一完整当前树比较仍期待旧字节；改为严格完整投影并明示历史边界后定向1/1通过（13243.9054ms），原45项没有删除或改断言。

固定 Luacheck1.2.0：2161项职责测量、14项既有告警，无新增；架构346模块/1955依赖边通过。增量 ratchet 在本地 commit 后绑定精确 HEAD 另报告。不跑 Full/远程CI，无 PR/合并/集成；独立复审与正常自有分支 push 分别读回。

只读 related 计划为 full:false，但传递依赖选出10 fast / 606 integration / 587 Lua；未把这个广泛集合冒充已执行，仅执行上述风险对应的定向门禁。首次把 --files 写成逗号字符串得到“未知文件”计划，改为空格分隔后才取得真实计划；没有改路由/预算。verify:backlog 与 check:guidance 均通过。

日常 check:platform-load 通过，14301控件、最大59子控件；仍有相对原d4c4b255基线的既有组装增长警告，原样保留，不换算官方容量或提高预算。新切片没有增控件/模板。

最初新树缺生成 abyss_theme 的环境失败在 build:data/build:ui 后消除，随后才取得旧源方向红例；该环境错误不是产品缺陷。来源比较失败与自身采样缺口均如实保留，验证原始输出和完整场景位于 [证据目录](../evidence/native-power-count-alignment-20261115/README.md)。
