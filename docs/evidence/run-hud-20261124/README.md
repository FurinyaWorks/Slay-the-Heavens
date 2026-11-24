# Run HUD / PD-01～PD-05 独立离线证据 · 2026-11-24

**证据类型：真实 Lua GameUI Host + 正式配置生成树 + 原生 API mock + 运行时坐标投影。不是官方客户端截图或真机验收。** 正式 GIL 构建/读回、官方导入及同候选 PC/iPhone 实测仍待验。图上100px说明条不属于设备画面；下方分别为1920×1080、2556×1179。

BASE为`c4eec5f9dc0cebb6bf0295b1d25cb1000cc48b96`。两树各自运行 `buildUI(...,{officialAssets:true,nativePageLifecycle:true,refinedReleaseMonsterArt:true})` 与真实 GameUI，未将当前生产模块移植到BASE。源码、生成物及压缩运行时状态分别绑定于 `before/after-source-hashes.json.gz`、`before/after-generated-hashes.json.gz`、`before/after-scenes.json.gz`。AFTER由正式配置生成后，对最终冻结生产源码重新执行捕获；生成器/配置与构建时哈希一致，`after-production-start.json.gz`与结束源码哈希相同，见`source-integrity.json`。最终独立复审另绑定实际BASE/HEAD/Tree，避免报告自指树SHA。

## 已核对画面与行为

`before/`共4图：双端map5/event5。`after/`共12图：双端map5、event5、26遗物页1/页2、单详情、关闭返回。

- BEFORE手机事件：field从设备y70.4125绘制，资源栏结束于y170.3，后画field覆盖姓名/生命/金币/楼层；页外入口仍存在。这复现了遮挡机制，不能据此替未知设备截图绑定候选身份。手机map5只有count1/+N入口。
- AFTER手机：资源栏y0…170.3，遗物命中带止于y311.125，事件field从y311.125开始、标题从y312.7625开始，三层无覆盖。5件显示5图；26件首屏11图。PC资源栏y0…64.5，每屏25图，第2页只有实际剩余图。
- 物理坐标Down/Up/Click点第2页首图，手机定位索引12，PC定位26。单详情仅一个对象；关闭仍是原事件及条带第2页。详情暗幕覆盖完整底层HUD，模态下层不接收触点。
- 手机条带与箭头命中137.55²px，即45.85²pt；详情关闭157.2×137.55px，前后294.75×137.55px，均高于44pt。有效热区与可见按钮边框分别量测。
- 独立`nested-review.log`双端PASS：战斗→暂看地图→遗物/卡组并返回；药水可查看、非选敌药水按Run权限使用、丢弃，选敌药水禁止隔地图进入选敌，设置逐级返回地图后再返回原战斗。最后P1负控也已独立验证：旧设置Down→打开遗物详情→旧Up/Click不能覆盖当前模态，直接openMenu同样拒绝。

`capture.lua`在Host构造前记录每次`SetAsLastSibling`序号，按真实父子顺序展开；坐标路由使用公共辅助器的`helpers`模式。原始捕获日志为`before/after-host.log`，全状态在压缩scene文件。脚本为本轮执行留档，路径记录当时源树；复现时按`capture.mjs <source> <before|after>`准备对应路径。

`render.py`只绘制捕获的图元/文字；青框是中心点可接收的声明命中框。Noto字体近似、SDK未知纹理只标边框/ID，透明纹理、裁切和旋转不作原生质量结论。`diagnostics.json`的12个AFTER场景未发现正文溢出候选；不代替完整生命周期测试。

原版依据与场景区别见[本轮正式产品决定](../../design/reference-assets/v2.0.0/run-hud-pd-20261124/REFERENCE.md)。`original-reference-hashes.json`只登记外部原版研究文件身份，未把第三方游戏原图或源码复制到生产资产。旧项目截图不作为当前设计依据。

最终冻结源码重放的12个scene与已渲染PNG输入逐项相同，故保留同像素PNG；新source/trace身份已更新，见`source-integrity.json`。
