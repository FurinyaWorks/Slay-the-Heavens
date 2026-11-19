# v2.0.0 主菜单视觉对照

历史原生截屏与本轮布局投影均为 1280×720。正式构建继续使用原生三角、矩形和灯板，中文 Logo 与英文副标题来自 Owner 批准原图的轮廓测量。按钮命中由既有宿主持有。

[改前实际画面](../menu-red-quality-20261114/menu.png) · [正常态投影](menu-normal.png) · [开始按钮高亮投影](menu-hover.png) · [批准原图](../../design/reference-assets/v2.0.0/main-menu-approved-20261119.png)

投影使用正式构建生成的原生布局和 Noto Sans CJK，对照位置、组合、颜色和按钮轮廓。官方客户端的原生字体、导入和 PC／手机画面仍待发版时复验。

```sh
node scripts/build-ui.mjs .artifacts/v2-menu --official-assets --native-page-lifecycle
python docs/evidence/v2-ui-20261119/render-menu.py .artifacts/v2-menu/game-ui.json .artifacts/v2-menu/visual
```

## 选角、局内退出与 P1 取证

以下 1280×720 投影来自同一套正式原生布局及离线 Lua Host 的实际控件快照，展示图元、文字位置、画面状态和原生路线。官方图集、动态头像及平台字体仍待同候选实测。地图首领图标的资源绑定由 Lua 断言验证，投影省略专用图集纹理。

| 场景 | 对照和核对范围 |
| --- | --- |
| 选角 · TASK-103.3 | [既有选角画面](../sts-character-reference-20261113/visual-integrated/character-selected-idle.png) · [当前左侧信息板](runtime-character.png) |
| 局内菜单 · TASK-107 | [修复前的矩形](run-menu-before.png) · [复用红旗后的唯一操作](runtime-run-menu.png) |
| Neow · TASK-103.3 | [既有 SDK 参考画面](../sts-neow-reference-20261113/visual-integrated-final/two-normal.png) · [当前开局祝福](runtime-neow.png) |
| 地图与首领 · TASK-4.13 | [接受祝福后的地图](runtime-map.png) · [同一地图滚动至首领](runtime-map-boss.png) |

Lua Host 通过按钮监听从主菜单开局并选择祝福。局内空白关闭菜单，唯一可见操作返回主菜单，继续时仍持有同一个 Run 和地图且楼层不变。主菜单退出按钮打开确认，确认只请求一次平台结算。将原先的矩形旗放回会使正式布局的红旗轮廓断言失败。

```sh
node --test --test-name-pattern='official selection information board' tests/official-assets.test.mjs
node docs/evidence/v2-ui-20261119/capture-runtime.mjs .artifacts/v2-runtime-evidence
python docs/evidence/v2-ui-20261119/render-runtime.py .artifacts/v2-runtime-evidence
```

运行前按仓库流程拉取 Git LFS 资源并安装 npm 依赖。矩形对照使用基线 `29cce469c22dd190c1a9dace391926c7cb9e5e47` 的同配置、种子和脚本捕获。
