# 下一组开局敌人：具体原神原型与官方参考

核对本地 exact-release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9` 的 data/enemies.json 与 data/presentation/native-monster-art.json。未改生产绑定。

## 决策

- 三个已有绑定保持：石颚兽→幼岩龙蜥；赤甲虫→伸缩火蕈兽；青甲虫→伸缩岩蕈兽。
- 祈火徒→草丘丘萨满为新设计提案，不冒称旧绑定或主人已确认。
- 均选可交战敌人，不选鬼兜虫、圣金虫等采集/环境生物。不要把“原型参考”称为可操控角色。
- 原作视觉身份与本项目战斗机制分离。此次不改仪式、咬击、蜷缩或攻击数值。
- 官方域名 HoYoWiki 本身可含社区维护内容；这里是其敌人页面 header 图，不宣称下载了开发商源工程或设计设定原文件。

## cultist / 祈火徒 → Dendro Samachurl / 草丘丘萨满
- 映射状态：新提案；原绑定为空。
- 推荐理由：先仪式后持续攻击的施法者身份，比举火棍近战的丘丘暴徒/打手更合适。不要为“祈火”二字把绿色原型改红，也不移植原神草附着机制。
- 绘制锚点：保留面具、巨大木杖、叶冠/绿色法术气质与矮小身体；按官方图重核形体。
- 敌人条目 ID：2213；[HoYoWiki](https://wiki.hoyolab.com/pc/genshin/entry/2213?lang=en-us)。
- 真实 header 图（活 API 字段）：https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2026/03/08/35428890/b8ad56958a7e69b5da9bb8915b06e170_1502814972231730551.png
- 回执：[精简官方索引](verified-reference-responses.json)。

## red_louse / 赤甲虫 → Stretchy Pyro Fungus / 伸缩火蕈兽
- 映射状态：沿用已有绑定。
- 推荐理由：和岩蕈兽组成同一家族的双小怪，明确是原作可交战怪物；名字甲虫不是必须采用昆虫的约束。
- 绘制锚点：保留火色伞帽、浅色柄、眼睛及原作帽缘尖形；不可只把另一只换成红色。
- 敌人条目 ID：2731；[HoYoWiki](https://wiki.hoyolab.com/pc/genshin/entry/2731?lang=en-us)。
- 真实 header 图（活 API 字段）：https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2026/03/09/35428890/6676a7e2c239faef2ab20e3cc7c834e3_524803526322218731.png
- 回执：[精简官方索引](verified-reference-responses.json)。

## green_louse / 青甲虫 → Stretchy Geo Fungus / 伸缩岩蕈兽
- 映射状态：沿用已有绑定。
- 推荐理由：同样小体量、伸缩/翻滚轮廓，与火蕈兽连贯配对。原作岩黄不必改绿；项目ID/名称不是原型色卡。
- 绘制锚点：保留分块岩帽、独有帽缘、浅色柄与眼；用独立原图比较，不由火蕈兽硬换色。
- 敌人条目 ID：2732；[HoYoWiki](https://wiki.hoyolab.com/pc/genshin/entry/2732?lang=en-us)。
- 真实 header 图（活 API 字段）：https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2026/03/09/35428890/d4263c7a6d94dc1e6e9ffb14805a80db_9147417040645087238.png
- 回执：[精简官方索引](verified-reference-responses.json)。

## jaw_worm / 石颚兽 → Geovishap Hatchling / 幼岩龙蜥
- 沿用已有绑定。小型岩甲兽的咬击、蜷曲/翻滚感与石颚兽定位相近；不要误用成年岩龙蜥或深海龙蜥之幼。
- 现有源依据：`art/monster-benchmarks/genshin-v1/geovishap-hatchling/PROVENANCE.json` 与 `generation-provenance.json`。项目 source.png 是衍生稿，不是官方原图。
- 仓库既有参考页：https://www.hoyolab.com/article/30131478 与 https://www.hoyolab.com/article/4274377 。这是社区文章证据，不冒充官方设定稿。
- 活 API 核实敌人条目 **2144 Geovishap Hatchling**：[HoYoWiki](https://wiki.hoyolab.com/pc/genshin/entry/2144?lang=en-us)。不是 2141 成年岩龙蜥，也不是 2177 深海龙蜥之幼。
- 精确敌人 header：https://act-upload.hoyoverse.com/event-ugc-hoyowiki/2025/08/15/35428890/f6cfb60bc11b888e2c772887dc1e4f02_6592641396496602649.png
- 回执：[精简官方索引](verified-reference-responses.json)。重核幼体岩冠、背甲、尾/肢体和眼脸，不沿旧衍生稿放大漂移。

## 可复核的条目发现链
- 原始 TCG 条目 3363：Dendro Samachurl 的卡牌条目明确链接敌人 2213；不能用卡牌 header 代替敌人原图。
- 官方敌人条目 2171（Floating Hydro Fungus）掉落孢子 1546；官方材料条目 1546 的 Dropped By 明确链接 Stretchy Pyro 2731 / Geo 2732，随后已读取两者敌人响应，名称和 header 一致。
- API 端点：`https://sg-wiki-api.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=ID`，请求头 x-rpc-language=en-us。
- 参考 URL 可用于项目内部设计比对；保存引用不等于拥有第三方图像的商业或再分发许可。当前未下载或重新分发 header 像素。

- 幼岩龙蜥发现链：2177 掉落材料1490 → Dropped By 2144/2141 → 分别读取确认为幼岩龙蜥/成年岩龙蜥。
