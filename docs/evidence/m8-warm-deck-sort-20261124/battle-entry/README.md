# 战斗 HUD 冷开／暖开补测

不是地图排序。从实际地图入口进入战斗，点战斗 HUD 的抽牌堆、弃牌堆和永久牌组，依次测试初次打开、关闭并立即重开。每个入口每组合 6 个新 Host，各测冷暖两次，共 72 次。固定种子 42，真实 75 个旅行者牌 ID；测试夹具将洗好的抽牌堆移 12 张到弃牌堆，得到抽牌 58、弃牌 12、永久 75。入口与详情使用生产 Host 的点击回调，非官方客户端触屏/像素。

| 冷开 | 第一张完整牌：基线 → 投影 | 详情首次接受点击、整页就绪：基线 → 投影 |
|---|---|---|
| 抽牌堆 | 3–6 → 2 | 3–6 → 3–4 |
| 弃牌堆 | 4 → 2 | 4 → 4 |
| 永久牌组 | 3–5 → 2 | 3–5 → 3 |

单位为模拟更新轮次。所有框架第 0 轮提交。暖开两组在三入口均为第 2 轮见到完整牌、能点开详情及整页就绪（36/36）；投影没有可见遮罩（36/36 冷暖打开），冷开提前显示的牌仍正确拒绝未就绪点击。已有卡槽暖开零新建；冷开各 10 个根、50 个分段。两次返回恢复战斗，三组牌 UID/顺序未改。这个结果支持「更早看到」，不支持「暖开更早能点」，也不等同玩家设备时延或 P95。

## 复跑

Develop `7348ab8598c8607712d525bd732239f89bb52830`；候选是 #932 `00dc14e0b263572a47ddb5e855167ceeb3190ee7` 相对原 BASE `364f43e8d7e0c03835676f2867ab9be0db496d29` 的六个生产文件分别三方合到该 Develop。构建与[地图排序补证](../README.md)同样配置，重新生成两侧官方布局；369 个恢复的 LFS 内容均按 OID 与大小校验。Linux LuaTeX 1.18、Node 24.22.3。候选为本地生产路径投影，不是 PR 正式合并树，也不承诺 CI 或真机结果。

取 [原探针](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/00dc14e0b263572a47ddb5e855167ceeb3190ee7/docs/evidence/deck-cold-start-20261124/probe.lua)（SHA-256 `6b82a5d7941dd905d8408053e79b8cf6599eb1f0851147a777a8d49844fe2cde`）为 original-probe.lua，运行 `patch -o battle-probe.lua original-probe.lua < probe.patch`（结果 SHA-256 `9d1d4ce66d971c646b3a27893ed4c6be93c315def456ffdd342900b95681f896`）。各源码根中构建布局后运行：

```sh
DECK_SAMPLES=6 DECK_ROSTER=/absolute/roster.lua DECK_GENERATED="$PWD/generated" \
  luatex --luaonly /absolute/battle-probe.lua
```
