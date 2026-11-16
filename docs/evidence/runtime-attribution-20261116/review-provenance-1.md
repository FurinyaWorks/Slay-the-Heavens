# Release runtime 来源/CI 独立复审 1

- 独立审查者：`/root/review_provenance`，由主实现代理 `/root` 委派；未实现/修改生产或测试代码，未运行 Node、构建、Lua、基准或测试。
- 审查时间：2026-11-16T02:59:45.739975+00:00。
- Release base：`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`；实际运行时 producer / 审查 HEAD：`befd480817b0f7c875de189863d37e803704ad3a`。
- 范围：指定来源机制 diff、Git 对象、gzip packet、历史合同入口以及已有日志。AGENTS.md 要求独立复审；本次禁止干扰最终定时采样，未调用可能运行 Node 的 Backlog CLI。
- 当前意见：**有 Important findings，修复前不能认为来源/CI 切片可交付**。这是对未提交工作树的初次审查，最终 commit 仍需复核。

## Important findings

### I1：新 raw Full guard 读入旧 JS 库存，旧 bootstrap guard 读入新 Lua 库存

`tests/ci-complete-calibration.test.mjs:63` 将 `liveDiscoverJs` 定义为 `runtimeParticlePriorInventory(actualParticleDiscoverJs(),...)`，879 个真实测试转换为历史876。新增测试第2037行仍用 `liveDiscoverJs()`，下一行 `assertRuntimeParticleRawInventory(js,'js')` 要求879，必然不相等。新测试因此尚未覆盖真实 Full 分片与成本。

旧 bootstrap 测试第2001行则 JS 已经是876，但 Lua仍通过真实 `readdirSync` 得到1424；第2002行 `assertReleaseBootstrapRawInventory(lua,'lua')` 要求历史1423，也必然不相等。

复现依据（只读，不需执行测试）：检查第63、170、1999–2003、2035–2039行；解压 `runtime-particle-ci-source.json.gz`，读取 `priorInventory`=876/1423 和 `currentInventory`=879/1424；解压 `release-bootstrap-ci-source.json.gz`，读取其 `currentInventory`=876/1423。新 raw guard 应用真正 raw JS/Lua；旧合同应完整使用其精确历史 JS/Lua 视图。

### I2：StS 旧完整库存断言尚未接入粒子 continuation

`tests/sts-style-source-epoch.test.mjs:28–29` 直接把真实 `discoverJs()`/Lua目录列表与 `integratedCiProof.inventory`/`luaInventory` 比较。后者仍为旧876/1423，真实目录为879/1424，所以直接断言必然失败。修改 `integratedPriorInventory` 不影响这一直接断言。此处必须保留旧完整断言并让其执行于精确历史视图；真实新库存由新增 raw guard 验证。

复现依据：`sed -n '24,43p' tests/sts-style-source-epoch.test.mjs`，并对比上述两个packet和 `integrated-ci-source.json.gz` 的库存。后续缺失/漂移回归也必须保留，不能只删除该直接断言。

### I3：集成合同 cases 仍读取当前原始源码，却要求旧来源/旧库存

`tests/integrated-ci-source.cases.mjs` 由 `tests/native-candidate-preview-mask.test.mjs:66` 直接导入；第13行真实 `discoverJs()` 对比旧 `proof.inventory` 已不相等。第35–39行以旧 `proof.closure` hash 校验当前 helper，当前 `closeout-source-epoch.mjs` 已有本次扩展，尚未通过粒子历史reader转换。第43行 `assertReleaseBootstrapCiCurrent()` 使用原始默认reader读取已经改变的旧注册文件；第63–65行原始879/1424也仍交给bootstrap旧库存断言。

复现依据：阅读该文件第3–9、11–14、32–44、61–66行；其reader仅包了 `releaseBootstrapCiRead(rawReadFileSync)`，没有粒子历史视图。`runtime-particle-ci-source.json.gz` 已记录closeout/helper/calibration等的before/current精确源码，但该case路径没有使用它。

## 已核实且未发现阻断的部分

1. 生产来源沿用既有 `createSourceEpochProjector`。`runtime-particle-source` 只新增一个真实生产owner：`src/lua/abyss_monster_intent_particle_view.lua`；原完整target保留，新增 `runtimeParticlePrior` 完整保留之前的352项 current。
2. 使用 Python 只读重建既有closeout→shop/deck→StS→feedback→menu→presentation→release→session/retirement 的 current corpus：base 的352/352项 LF SHA256 与真实 Git source相符；叠加粒子packet后 producer的352/352项相符，0项缺失/漂移。因此当前 `currentTreeCommitted:true` 对本次真实生产源码 corpus 有实际Git依据；它不代表辅助CI文件或整仓库均由该producer提交。
3. packet中的before/current源文本、Git blob和raw commit分别与真实 `git show`/`git cat-file` 读出的base和producer一致。packet附带commit与root/src/lua tree原始对象，校验commit→tree→blob，不需要浅CI额外fetch。`verifyParticleGitProof` 验证实际对象SHA1；伪造commit负例仍在测试中。
4. 生产source helper的本地静态依赖图共10个mjs，未发现CI leaf导入；copy新增表仅更新closeout-source-epoch并增加runtime-particle-source mjs/gzip，没有加入runtime-particle-ci leaf。copy每次重新读取、校验hash并保留路径/隔离保护；新测试覆盖新增依赖逐项warm后漂移、删除、恢复。
5. `runtimeParticleCiSource` 拒绝转换 `src/` 和 `config/architecture.json`；只对精确current hash返回精确before文本。外来/漂移字节返回原值。`assertRuntimeParticleCiCurrent` 每次原始读取全部15个绑定及archive，没有授权缓存。`integratedSource` 也先拒绝生产源码投影；生产epoch不经该CI路径。
6. CI packet注册3个新增JS及1个新增Lua，库存准确为879/1424；旧视图876/1423完整保留。真实调度脚本 `scripts/ci-shards.mjs`、timings、workflow、capacity/config本次无修改。保守unknown成本仍10000ms；Windows18 / POSIX15 shard、45/30分钟物理guard和forecast仅diagnostic的断言保留，但I1使新增guard尚未执行到这些断言。
7. 93个旧gzip均与既有原始hash一致。两个在`git status`显示修改的大gzip是本地展开的Git LFS payload；其字节hash/size精确匹配base中LFS pointer的oid/size（closeout-ci为`cfc72306af30d0d4b0b61398e3ed0eea36767d6e005c146eb215897fc431a8f8`；release-source为`5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780`），不是改写旧archive。
8. `work/logs/source-current-first.log` 为4个测试通过；`work/logs/final-mechanism-green.log` 为11个runtime/source测试通过。它们不包含calibration、StS原始库存合同或上述集成cases，不能反证I1–I3。

原生SDK、真实ready和手机验收保持UNVERIFIED；此离线来源复审不要求冒充实机验收，也不授权合并或发布。#688/#694去重与#703容量边界由主代理统筹，本审查没有更改其范围。

## 精确审查文件 SHA256

| 文件 | SHA256 |
| --- | --- |
| `tests/helpers/runtime-particle-source.mjs` | `00a50e3835bcfd6d4cfab153a9e92fdba666cd8de02c7a67539598a75dc054ab` |
| `tests/helpers/runtime-particle-source.json.gz` | `2cef28e3bd47c3638c421c9f152453b7e446501f69e32bdaac39417a3731ad6a` |
| `tests/helpers/runtime-particle-ci-source.mjs` | `15b8ef568cbf5e4c3398dd685a51cd474b499757b67147373a2d03ff8713a1c3` |
| `tests/helpers/runtime-particle-ci-source.json.gz` | `807f08d1c588e236ce3040e21cb5e37d270ffb6dec33324956421627dccbe7e7` |
| `tests/helpers/closeout-source-epoch.mjs` | `c57ef7bc66a4c4e98a781ce32752718316266da41435b6ac9ed47c263f6d192c` |
| `tests/helpers/copy-integration-source-closure.mjs` | `c8f4534c37175a6ba3bf25927897e96e8c28c9cbedb64124d737603731960c4a` |
| `tests/helpers/integrated-ci-source.mjs` | `63f0518c040c49527ed5a28a91237a5f4e3feb983790d1d9830fca63e7ce3f26` |
| `tests/runtime-particle-source.test.mjs` | `7da5203bb75e184cc29a460ad50f0b6c5f597b73dfa7dc80f4e241b36a3cd156` |
| `tests/ci-complete-calibration.test.mjs` | `47f715bca393f9a14d02cd6d9a3a7ed48b25e3f545f8cafbd9f7acb9576603a4` |
| `tests/integration-source-epoch.test.mjs` | `cd3c7d258bd7236125cf76f41bcb104652f4a48ed20e26bcbf97da9b7cb6947d` |
| `tests/sts-style-source-epoch.test.mjs` | `e07efc666c0fc2c2d956b621d7e770ee47a4a900256fdf891360534f8b7b36be` |
| `tests/integrated-ci-source.cases.mjs` | `a2b0c603a5a1ea3ac45f6cdd003024d86180c0f25a5456822fa8402fdf64b733` |
| `tests/helpers/closeout-ci-source.json.gz` | `cfc72306af30d0d4b0b61398e3ed0eea36767d6e005c146eb215897fc431a8f8` |
| `tests/helpers/release-source-epoch.json.gz` | `5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780` |

以上hash界定本轮静态发现的版本。任何修复后应重读其diff、更新CI packet绑定，并对最终commit及相应源码测试证据做复核；本审查未自行PR、merge或改动实现。
