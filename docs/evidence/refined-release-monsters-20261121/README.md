# 2.0.0 怪物精绘接线

正式入口使用 `official-assets-battle-v3`。42 个敌人定义各自绑定一份精修稿，不共享替代形象；历史库仍可用于显式旧版构建，不进入新候选输入。

| 模板图元容量 | 适用敌人数 | 原生模板总控件（含血条等） |
| ---: | ---: | ---: |
| 41 | 15 | 79 |
| 96 | 14 | 135 |
| 115 | 13 | 154 |

几何源为 `data/release/refined-monster-art.json`，共 3,385 个绘制图元。来源和逐资产的 127px RGBA 离线投影哈希见 [清单](art-provenance.json)；旧 14 份中有 32 个历史半遮罩图元做一对一几何等价转换，投影没有像素差异。怒焰巨魔使用原稿精确水平镜像，无补绘或改色；深渊守卫与寄生兽使用此前的镜像稿。普通和分身实例复用定义对应的模板，但各自拥有独立控件状态。

定向复验（先按照仓库正式构建流程检出对应 LFS 输入）：

```sh
node scripts/build-ui.mjs build/refined-monsters --official-assets --native-page-lifecycle --refined-release-monsters
node --test tests/refined-release-ui.test.mjs tests/refined-release-monsters.test.mjs tests/refined-monster-tiers.test.mjs tests/native-monster-actor-template.test.mjs tests/native-audio-release-provenance.test.mjs
```

计数是离线原生模板控件数量；不是官方容量或手机帧率。候选 API 测试用模拟宿主验证模板索引和打包来源。另用生产 Lua 绘制路径跑完 42 份实际几何，逐个核对可见图元数等于清单、清理后无剩余怪物控件。相比旧 v2，输出主界面和战斗静态 UI 完全相同，未压缩怪物 Lua 增加约 1.05 MB，模板 JSON 增加约 0.16 MB；这不是 GIL 容量。正式 GIL 导入、同候选出战以及移动端表现需单独验证。
