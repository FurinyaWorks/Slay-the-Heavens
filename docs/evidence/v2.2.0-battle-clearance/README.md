# v2.2.0 战斗状态与常态手牌

目标分支为 `release/v2.2.0`，修改前为 `7dded1e93f169f319c4a52e38f1ba47943ac4463`。生产修复为 `c28b0221422fe38fe26bd115007bdc24551e0d7e`，树 `c57f75646f5bf9745c1e42063629e35492d4acef`。相关任务为 TASK-115.7.3。

## STS1 原版依据

在固定源码 1920×1080 参考坐标中，地面基线是 y=340，深渊守卫对应的原版守护者骨骼锚点是 (1390, 240)，命中框底边因构造器 +95 而在 y=335。攻防转换将框高从 350 改为 250，底边和 HUD 锚点保持一致。血条标称 y=307–327，首个状态图标中心在 y=287，移动分支是 y=282。五张静止手牌尺寸 225×315，中央牌中心 y=70，整手名义最高点 y=227.5。PC 首个状态区域名义底边 y=263，两者相距约 35.5。悬停牌高于常态手牌且后绘制，瞄准或悬停期间可以临时遮挡。分别查阅了 PC 守护者瞄准、PC 十牌常态、iOS 守护者敌方回合、iOS 另一阵容五牌常态以及 Android 瞄准实图。守护者五牌数值来自固定源码推导。[源码定位、实图链接和读图坐标](sts1-reference.md)

## 回归根因

以下是各版本独立生成官方 UI 后，由生产 GameUI 写出的舞台坐标，Y 向上。v2.1.1 使用正式归档记录中的构建源 `06c2577ecc6c07593c6bf8b6e79e158dac5b6195`。

| 版本 | 守卫血条中心 Y | 移动端模式转换图标底 Y | 五牌最高 Y |
| --- | ---: | ---: | ---: |
| 线上 v2.1.1 `06c2577e` | −101.060 | −156.500 | −177.726 |
| 接地改造前 `20b7b4f6` | −41.333 | −96.773 | −177.726 |
| 首次接地 `e483c6a1` | −155.333 | −210.773 | −177.726 |
| 回流组合 `f2575217` | −155.333 | −210.773 | −177.726 |
| 目标 Release `7dded1e9` | −155.333 | −210.773 | −177.726 |

#1007 将精绘怪物脚底锁在场景接触面。守卫从原先的立绘与抬高命中框路径切换到经场景深度修正的接触锚点，HUD 取命中框底边再减原有 8 单位间隔。它跨过了旧预留线，手牌坐标与卡牌大小保持原值。随后合并 v2.1.1 的公共布局时，`reservePowerRow` 继续服务未贴地且命中框抬高的旧路径，正式接地分支跳过该预留。#1065 扩大接地名单时守卫接触参数相同。旧防遮挡测试仅生成 `officialAssets`，而正式精绘测试关注贴地、立绘和一张手牌，未组合检验正式扇形、费用徽章和透明卡牌接收器。[线上归档](https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/v2.1.1) · [#1007](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1007) · [#1008](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1008) · [#1065](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1065)

官方全幅图标与原生矩形文字框是平台差异。#661 引入有界栏目、折行和溢出入口。#877 在血条下置时引入 `nativePowerFloorY`，用固定手牌边界控制行数，并给抬高命中框的旧路径预留完整状态行。#887 让 `+N` 从首个溢出状态打开详情。它们保留了正式端的文字边界和可访问性。新参数给正式精绘重划固定行下界，并沿用相同的容量和详情规则。[#661](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/661) · [#877](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/877) · [#887](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/887)

## 修复

- 正式精绘以接触面的命中框底边为共同几何锚点。血条中心距底边 14 舞台单位，接地状态图标顶端距血条外边 4 单位。立绘、接触影、实体目标框和意图继续从 `EnemyView.geometry` 取得几何。
- 用静态手牌扇形将中央牌落点设为 y=−320。STS1 同画布换算是 y=−313.33，额外的 6.67 单位给千星版本外凸的费用徽章留出空间。扇形纵向每档落差 10，边界保留原版沉出画面的布局方式。第一版试制在 y=−314 时，单牌费用文字与小黏液第二行热区重叠 2.667 单位。y=−320 时该组合留有 3.333 单位间隔，保留第二行。
- 手牌热区统一由 `Viewport.handHit` 计算。常态热区跟随静止卡面高度，聚焦后覆盖完整抬升行程。左右输入分道与拖拽事件模型继续沿用现有逻辑。布局只使用固定参数和现有动画写入路径，无逐帧碰撞搜索和新增控件。

## 组合验证

`node --test tests/enemy-status-hand-clearance.test.mjs` 以 `{officialAssets:true, refinedReleaseMonsterArt:true, nativePageLifecycle:true, experimentalCharacters:false}` 生成正式 UI。实际控件夹具检验五牌 PC 和手机宽屏的两个形态，检查真实状态名和数值、卡面与接收器、鼠标悬停、触控详情、点选和取消、拖拽提交一次。修改前在 PC 直接失败，手牌顶 −177.726、状态最低 −205.333、卡牌接收器顶 −80.763。修改后五牌静止卡面和卡牌接收器最高均为 −215，PC 状态最低 −194，移动状态最低 −199.440。

几何矩阵覆盖 42 种精绘怪物、4 种事件兼容怪物、53 个遭遇与转换入口、2,428 种离散阵容结果（2,404 种多怪），连续随机偏移按端点及中点取样。对影响展示的 317 种去重实体布局，组合 PC 16:9、宽屏、移动 16:9、宽屏与 4:3，1–10 张手牌和四种状态组合。63,400 个组合均通过，检查了 39,758 个状态或血条图元、文字与热区矩形，包含 3,805 个溢出组合，最小分离轴距离 3.333 舞台单位。相交测试包含卡面、外凸费用边框和文字、常态高光及卡牌接收器。既有全 42 贴地、巡风隼飞行切换、状态详情及旧布局负控继续执行。

## 实渲 A/B

在两份独立源码中生成正式布局，由 Fengari 执行各自的生产 GameUI 并记录原生控件树。Beyond Simulator 0.5.2 Host 渲染这些控件快照。PC 1600×900、移动 1560×720，共 12 张原始 PNG，均无素材告警。对照包含守卫攻防形态、PC 悬停及移动端五只黏液配十张手牌。清单记录各帧位置、尺寸、截图摘要、生成主题摘要及生产源码摘要。[守卫局部 A/B](guardian-layout-ab.webp) · [十牌和悬停整屏 A/B](hand-layout-ab.webp) · [实渲清单](render-manifest.json)

| 守卫五张静止手牌 | PC 净距 前 → 后 | 移动净距 前 → 后 |
| --- | ---: | ---: |
| 状态图标与数字对卡面 | −27.608 → +21.000 | −33.048 → +15.560 |
| 状态接收器对卡牌接收器 | −124.570 → +21.000 | −127.290 → +18.280 |

脚底 Y 为 −135.333，血条中心从 −155.333 升至 −149.333。捕获的所有五牌和十牌场景中，牌名和费用文本框均位于视口内。外侧牌的类型文本框可触及或越过屏幕底部，聚焦后可完整查看。桌面悬停仍允许抬升牌临时盖过状态行。官方客户端导入与实体设备在本轮云环境未验证。

### 复现

在前后两个独立检出执行 `npm ci`，通过 Git LFS 填充当前正式头像预览。另在临时位置安装 `beyond-simulator-mcp@0.5.2`，将 `ART_LAB_MCP_ENTRY` 指向其 `dist/index.js`。拼图需要 Python、Pillow 和 Noto Sans CJK。用任意临时目录设置 `scratch`，令 `base` 和 `after` 分别指向报告开头的生产源码检出。从报告所在仓库根目录执行以下命令。

```bash
capture="$PWD/docs/evidence/v2.2.0-battle-clearance/simulator"
for side in before after; do
  source="$base"
  if [ "$side" = after ]; then source="$after"; fi
  node "$capture/capture.mjs" "$source" "$scratch/$side"
  SIM_OUTPUT_SUBDIR=png NODE_USE_ENV_PROXY=1 node "$capture/sim-render.mjs" "$source" "$scratch/$side/host.log"
done
python "$capture/measure.py" "$scratch/before" "$scratch/after"
python "$capture/compare.py" "$scratch/before" "$scratch/after" "$scratch/evidence"
python "$capture/summarize.py" "$base" "$after" "$scratch/before" "$scratch/after" "$scratch/evidence"
```
