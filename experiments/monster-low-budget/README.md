# 旧怪物数百图元实验

TASK-25.7 的独立离线样品，保留旧源图，不改正式怪物登记、图库ID或发布构建。

复用 `scripts/art/segment-lowpoly.py` 的分区、轮廓简化和三角剖分，及既有单轴放置器。实验适配器只处理透明轮廓、同源轮廓底层和100/200/400预算；没有全画布底色，没有新增拟合算法。原始PNG的Git LFS oid从Git blob读取，因此源工作树已hydrate或未hydrate都不会把PNG当文本。所选两图的实际像素必须与该oid和原asset/source-review一致。

从本实验工作树执行，参数都指向已有本机设施，不安装包：

```powershell
& $python experiments/monster-low-budget/fit.py --source-root $sourceRoot
& $node24 --import $existingSdkHook experiments/monster-low-budget/runtime.mjs $sdkSession $sdkRenderer $imageCache
& $node24 --import $existingSdkHook experiments/monster-low-budget/switch.mjs $sdkSession
& $python experiments/monster-low-budget/compare.py --source-root $sourceRoot
node experiments/monster-low-budget/verify.mjs
```

`$python` 需现有 Pillow/NumPy/OpenCV/Shapely；`$node24`、SDK导入hook、`actual-session.mjs`/`actual-renderer.mjs` 与图库缓存沿用本机 `.artifacts/simulator-runtime/`，不复制SDK进仓库。`$sourceRoot` 指包含旧 `art/monsters/*/source.png` 真实像素的仓库副本。本轮使用根仓库只读源图。

输出均在已忽略的 `build/monster-low-budget/`：41份旧源图元数据清单、六档几何、同源引用预览、两份可加载的独立Simulator save、实际SDK软件截图、综合 `comparison.png`，以及fit/runtime/switch收据。独立save不含脚本接线；`runtime.mjs` 和 `switch.mjs` 是可重复执行的生命周期驱动。

`runtime` 直接使用生产 `abyss_battle_enemy_view.geometry` 取得173.33/300设计单位，而非把旧127预览尺寸当实际战斗尺寸。SDK图库ID与拟合样品同时显示，血条、意图标记和命中区域以生产几何对齐。五实例分配是合成资源上界实验，不宣称五Boss是合法遭遇。

`switch` 在一个持久宿主内实际实例化 jaw100→hex400→jaw200，销毁旧图元表面；同一身份请求复用现有实例。创建前取消、关闭后的旧回调均不能重新激活表面，最后销毁宿主至零残留。此独立控制器不是正式actor manager。

结果：100/200档No-Go；400档仅是后续人工比较候选，不能自动采用。SDK软件PNG、CPU墙钟、save/JSON字节不是官方容量、GPU FPS、PC客户端或实体手机验收。全部设备及官方容量保持 `UNVERIFIED`。
