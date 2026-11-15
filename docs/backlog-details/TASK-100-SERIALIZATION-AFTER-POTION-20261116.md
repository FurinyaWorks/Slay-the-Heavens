# TASK-100 无损序列化后继准备

实际Release S=`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`；显式未合前置f564。独立树ff `f564aea6a3c517b71a85534a81be5e2e36278baf` 后按 `-x` 接原691三提交6a7a7ef1、d48bb642、f85f4e44，无冲突；真实builder checkpoint=`7f1192bcba7dab14527456eeeb37f274ca6abb95`。四producer、UTF8 helper与原parser逐blob=f85，整个src/lua=f564；不含b4/portrait/fc999。

本片不是Lua owner改动：P0 Lua/config epoch和生产copy闭包原样保留，builder checkpoint与它分别标识。现有current CLI夹具递归复制完整scripts，已含新UTF8依赖；历史builder保留各自完整旧源，不向旧归档注入helper。新接线只有三个CI文件+稀疏CI叶/包，before=f564，after辅助capture=false，9路径/96旧gz；raw先验再明确before-f564历史reader，原四leaf/所有旧gz/hash、成本、预算与断言不动。

[逐blob发射输入证明](../evidence/release-lua-serialization-after-potion-20261116/input-identity.json)：scripts/tools/data/config/art与package/lock/manifest/CHANGELOG九组对象，在原36→新f564、原f85→新checkpoint对应同源；74个静态脚本依赖未读取三份P0 Lua，Python呈现器也不读它们。loadReleaseNotes虽读取Git身份，buildUI仅发射build.version；源commit/dirty不进入这25文件。原candidateScriptFiles另收 authored Lua sourceFile，不在配对生成器调用链。

因此保留原证明的 **36→d48** 身份：五模块值/键型/string bytes/numeric subtype+bits及20其它输出相等，640086源码B也是该原比较的结果。提交proof按LF绑定Git blob `c8ddcd69626550886c04dff73beffe83bd0cb432`，实际读回SHA256 `23bc366c12d9b12f368d3107cb4612b88c0032bf3aaa5e444648dd70c66f305d`；旧CRLF工作树SHA `9843cda9…`另保留为captured字段，不充当提交身份。**本轮不新配对/双构建，不称当前fresh输出或官方MB**；全仓与5120输入指纹明确不等/不复用，P0三源有变化，不能推出候选/GIL/设备等价。

本轮Node24.18.0串行仅：newdelta及必要current/P0-copy命名合同 **8/8 PASS**（41.52秒）；原 `tests/lua-utf8-literal.test.mjs` **2/2 PASS**（0.22秒），原测试blob和30秒预算不改。实际完整发现 **878JS/1424Lua**；Win/POSIX forecast1757179/1190964ms仅诊断，物理45/30分钟guard不改。0失败/跳过/取消；`git diff --check`通过。

CI包SHA256 `76e032cd11495503abaa5820fc77d67892a85137d8e074fccb737e4ba40a7198`。原始metadata脚本/收据、source-contracts.log、parser.log在本树 `.artifacts/serialization-prep/`。不改根Backlog、原691头，不建PR/推送或预写未来squash；无Full/check、旧73、GIL、外部SDK、MCP、GUI/手机/官方容量验收，TASK-100仍未完成。交Root独审及真实base绑定。
