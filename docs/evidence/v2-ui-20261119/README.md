# v2.0.0 主菜单视觉对照

历史原生截屏与本轮布局投影均为 1280×720。正式构建继续使用原生三角、矩形和灯板，中文 Logo 与英文副标题来自 Owner 批准原图的轮廓测量。按钮命中由既有宿主持有。

[改前实际画面](../menu-red-quality-20261114/menu.png) · [正常态投影](menu-normal.png) · [开始按钮高亮投影](menu-hover.png) · [批准原图](../../design/reference-assets/v2.0.0/main-menu-approved-20261119.png)

投影使用正式构建生成的原生布局和 Noto Sans CJK，对照位置、组合、颜色和按钮轮廓。官方客户端的原生字体、导入和 PC／手机画面仍待发版时复验。

```sh
node scripts/build-ui.mjs .artifacts/v2-menu --official-assets --native-page-lifecycle
python docs/evidence/v2-ui-20261119/render-menu.py .artifacts/v2-menu/game-ui.json .artifacts/v2-menu/visual
```

## 局内退出、祝福、地图与共享顶栏

以下 1280×720 投影来自正式原生布局和离线 Lua Host 的控件快照。地图首领图标的资源绑定由 Lua 断言验证，投影中省略专用图集纹理。官方字体和同候选设备体验留到发版验证。

| 场景 | 当前证据 |
| --- | --- |
| 局内菜单 · TASK-107 | [唯一可见的退出操作](runtime-run-menu.png) |
| Neow · TASK-103.3 | [开局祝福](runtime-neow.png) |
| 地图与首领 · TASK-4.13 | [接受祝福后的地图](runtime-map.png) · [同一地图滚动至首领](runtime-map-boss.png) |
| 顶栏 · TASK-4.23 | [Mega Crit 官方参照和项目布局](../../design/reference-assets/v2.0.0/shared-floor-counter.md) |

Host 通过按钮监听完成开局、祝福、打开局内菜单、空白关闭、退出回主菜单和继续。本局、地图及楼层保持原值，主菜单退出确认只请求一次平台结算。祝福与地图共享栏均显示 0，首战显示 1。楼梯位于药水栏右侧，由三块原生矩形组成。

正式选角构建仍使用 [Owner 调好的 1600 图元原生背景](../../../experiments/lumine-native-fit/fit-hybrid-final/budget-1600.json)。构建验证背景数据的摘要、图元数量及正式原生挂载标识。

```sh
node docs/evidence/v2-ui-20261119/capture-runtime.mjs .artifacts/v2-runtime-evidence
python docs/evidence/v2-ui-20261119/render-runtime.py .artifacts/v2-runtime-evidence
```

运行前按仓库流程拉取 Git LFS 资源并安装 npm 依赖。
