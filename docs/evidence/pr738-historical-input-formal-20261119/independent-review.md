# 正式接续独立复审

结论：固定五文件 PASS，无新增阻断；只认可正式历史入口与来源身份，不代表 Hosted Full、合并或实机通过。

| 文件 | Git blob |
| --- | --- |
| tests/helpers/historical-card-input.mjs | ca9fde49f25f161b476da6e7269f7a3020851b20 |
| tests/card-input-slices.test.mjs | 25a6a8a13cb3adf95849c7b1de4e7f267a5da894 |
| tests/helpers/release-potion-enemy-source.mjs | b0759f6b1339390bc92f7137b8133f0f4e2f7433 |
| tests/helpers/release-historical-input-ci.json.gz | 41dc2647d39ea977171d219675023b9244c821b4 |
| tests/integrated-ci-source.cases.mjs | a5162b7ffc9d5f9a9c818a5d9a15855263c767f6 |

CI档 SHA-256：`7a3dbcce1c581f810c837faca4a6a1ce74db40bf1f62de79105527eb812bfc2e`。
精确双 preload SHA-256：`5a0ace5ebc817da95d0de565ccd583753b56c8c683320f678bc69ecf76285b35`。

1. 从原档及原 inverse 独立重建 gestures/base3750e191、bindings/base0c370951，生成精确 preload。三route各8个真正触达的 host/linked missing/drift 热后负控共24项，包含只在第二阶段破坏 linked；严格消息/类型拒绝、恢复 fresh 读取。原runner/三stub/支持体/后三前缀逐字不改，四个非目标与foreign cwd不读。
2. 新CI三前像和Git blob精确等于676508d2（本地47a28789同tree），三after等于当前实读。352/129/88、copy、runner、原Lua及旧11档等19文件逐字不变。
3. 三真实重放叶 × 新档/既有生产档/当前owner × missing/drift × text/Buffer，共36项实际命中并拒绝；另三叶各missing/drift/旧前像共9项拒绝，恢复通过。原 card 与 potion safety 当前fixture保持live/no-read。
4. 原12正文/30秒/分组断言与旧重复auth控制保留，新增matcher精确类型/代码/首行。模拟Windows CRT quoting全argv为16,707/16,715/16,715 UTF-16单位，均低于18k；这是字符串形状核验，不是Windows执行结果。

原始独审 helper 脚本 SHA `5eacedfb7384148a3801a109ee74bca1fd6f9b3d6dba3293ee10433fde1def23`，日志 SHA `1a90014424030379fb2f6e39117fd7e2d45e949e6fa1241aa3584d7eb10d1a7c`。
原始独审CI脚本 SHA `4aee2ab746ab82ea38656e897e6505d2b6b549040c3a68c26f94a28533f44991`，日志 SHA `1b1406e5437b653a596fa85ccab225ddbaff366d114021281f355f7a53df02e2`。

独审未修改仓库、未推送、未重跑整12或Full、未操作GUI。
