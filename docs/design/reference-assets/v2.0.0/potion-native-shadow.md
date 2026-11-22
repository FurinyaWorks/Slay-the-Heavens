# 药水空槽：直接沿用原生药剂瓶影

2026-11-21 Owner 修正：不修改原神药水素材，不坚持《杀戮尖塔》的长试管形状；空槽跟随现有药水瓶形、位置与尺寸，有药水时原图正好填入。此前 #793 的矩形拼接宽口瓶，以及随后未提交的长试管探索均不采用。

已目视核对[原生图库照片](https://raw.githubusercontent.com/8itlab/genshin-miliastra-mcp/e51fa684e62d053f69a4133da76f115f2a6115a0/src/scene/image-library/item_00.jpg)：111046、111047、111048 为同款带木塞的倾斜药剂瓶，分别盛红、黄、蓝液体。图库照片仅作参照，不导入游戏资源。

空槽直接复用现有 bottle 的 image、position、size，以黑色半透明显示原图 alpha 瓶影；持有药水继续显示原来的原生药剂图片及既有颜色。删除八段自绘矩形轮廓；空槽由八图元降为一张已存在的图库图片。原生 alpha 是否含玻璃深浅细节仍以官方客户端为准，不声称生成了新的空瓶贴图。

不改管理布局、药水数量、使用/丢弃/选择/取消、3/5容量、触摸命中区域或弹窗遮挡。修改的是共用显示构建器，顶栏、战外入口和管理槽共同复用。

可复验：`node --test tests/potion-sts-structure.test.mjs tests/potion-discard-layout.test.mjs tests/official-run-hud-reuse.test.mjs`。覆盖原生瓶影同图同位同尺寸、四态共享及真实Lua 3/5槽、选中、丢弃空洞、关闭重开。

实际Lua状态的离线投影使用图库照片估计透明边缘，只用于瓶形/位置比较，不等于官方纹理、ready或手机实测。记录与截图保留在本轮云端证据目录 `/workspace/cloud-reports/potion-reference-correction/`。
