# v2.1.1 分支收口

千星平台 `2.02` 对应工程 SemVer `2.1.1`。正式 GIL、校验文件和构建回执来自原归档提交 `3f79269e90a8f2507f6782135563ecf573b357d7`。生产提交为 `d96c9f0d7958148ec1bb027f14a3214da81d06b4`，Tag 为 `v2.1.1`。[发布记录](https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/v2.1.1)

Owner 已授权使用管理员 PR 通道。地图、战斗和牌组回流至 `77b7e87ac5abc9ef5c4953cfd47b5d77408e55d2`，精绘启动回流至 `31107daac7f5a6a44189bf93bcd0caedc5c4ae6d`，版本记录回流至 `dbc7eca4d9944cc6abf392b95860d347611c11b6`，两处构建修复回流至 `27e2f8304bcbaedffa0efbc02d739bd4aeab38b6`。[#962](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/962) · [#957](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/957) · [#960](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/960) · [#963](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/963)

以下三个临时分支的源提交是本次归档提交的父项，原始文件可以按固定提交读回。接续工作由 Furinya 评估。

| 原分支 | 固定源提交 | 接续 |
| --- | --- | --- |
| `test/v211-intent-host-replay` | `4380919a9a7cd68b0cf4ace29c8684706ae6bb51` | #962 已回流意图写入计数与运行时修复。旧 Host 观察器夹具留待 TASK-100 的后续回归对账。 |
| `test/v211-rebuild-deck-fixture` | `1b045075df9efbe217401b32e7e4b824776b435e` | 已归档未合的原生重建测试夹具，后续由 #917 根据最新构建路径复核。 |
| `test/v211-strict-package-preflight` | `fb5e5bf1cd60cff0b18929f135af316ed894c053` | 已归档离线有声包预检原文，后续严格读回复用此记录。 |

官方上传回执和同包官方设备证据待补录。冻结源码的 Hosted Full 已记录已完成分片的失败。[Hosted Full](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45630976779)
