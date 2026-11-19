# v2.0.0 主菜单视觉对照

历史原生截屏与本轮布局投影均为 1280×720。正式构建继续使用原生三角、矩形和灯板，中文 Logo 与英文副标题来自 Owner 批准原图的轮廓测量。按钮命中由既有宿主持有。

[改前实际画面](../menu-red-quality-20261114/menu.png) · [正常态投影](menu-normal.png) · [开始按钮高亮投影](menu-hover.png) · [批准原图](../../design/reference-assets/v2.0.0/main-menu-approved-20261119.png)

投影使用正式构建生成的原生布局和 Noto Sans CJK，对照位置、组合、颜色和按钮轮廓。官方客户端的原生字体、导入和 PC／手机画面仍待发版时复验。

```sh
node scripts/build-ui.mjs .artifacts/v2-menu --official-assets --native-page-lifecycle
python docs/evidence/v2-ui-20261119/render-menu.py .artifacts/v2-menu/game-ui.json .artifacts/v2-menu/visual
```
