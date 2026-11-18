# TASK-38.4 药水与未合 bootstrap 的组合准备

本片以实际 Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210` 建独立树，ff 已提交但未合的 #692 `b67226945c2be47c8fff31f1362412b973f68875`，再逐个 `cherry-pick -x` #679 的七个提交（4f4cea95、f8e6a7ee、29b10877、b6a58165、551677b7、85f1cd4a、402cdb49）。组合 checkpoint 为 `52cac3e7ee4215e20cfb0b31dca5c8fa25d7f0be`。这不是新的 Release 已合基线，也不创建未来 squash 身份；#679 原树/PR 头与根 Backlog 未改。

两个旧 CI 包各自冻结 Release36，不能直接把它们串接。新增 `potion-bootstrap-ci-source` 是稀疏明确 continuation：19 个确有当前/历史差异的文本路径、95 份原 gzip 的 SHA 清单；before 为已提交 b672，potion 历史 target 为402，产品来源仍551。组合源码的 raw validator 先验全部 fresh 字节，再分别调用两旧 validator 的明确历史读取视图；用于旧完整 source receipts 的线性路径为组合→b672→36/c240。叶与其 gzip 自排除，辅助 after 捕获 `currentTreeCommitted:false`，没有把辅助源码伪称在 checkpoint 里。

原包保持字节：bootstrap CI `868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6`、potion CI `16f2e5dc4c4b1e530fdb6b3b5a2059642d3e8c9b3a03bfef177f59e1341ac002`、potion production `2af4fb9d547eb50d7dc75fd54fc4b505ecaf8b5f343330e31ac91054d75c2a06`。新组合 gzip SHA256 `6f30c23631e3f405df1fbfc43a22c48267a893289ed8953991955a7d98280b08`。旧预算、断言、负控及实际成本保留；新 forecast 只作诊断，不增加准入门槛，物理 guard 仍45/30分钟。

产品 `src/lua` tree 完整等于原551的 `98383f07e54653a3aa081831d05643356b03e049`；三处药水 runtime blob：gestures `7d5bb5b92b10356eaf24a98c185d9776ffc52e77`、popup `f30106bd67da368ea40a6ba3f8f1a2d57874f4d6`、UI `529e51758b4e245a9088ce4ea79a52f789d4ee90`。原产品矩阵/63序列/独审保留其原身份，本轮没有重跑整套或修改产品。

Node24.18.0 本轮最小验证（串行，原预算未改）：

- `node --test tests/integrated-ci-source.cases.mjs`：7/7，覆盖新 raw union、两旧包完整历史合同、缺失/漂移/外来字节/错误前驱、原归档、gzip 截断与库存负例。
- `node --test --test-name-pattern 'potion bootstrap|mobile potion (execution|raw)|Release bootstrap raw' tests/ci-complete-calibration.test.mjs`：4/4。当前组合877JS/1424Lua，Win forecast1756907ms、POSIX1190295ms，仅诊断；原 b672 历史库存876JS/1423Lua另记，不能转记为当前库存。
- `node --test tests/potion-popup-click-payload.test.mjs`：1/1，23.65秒。首次在新树缺 `build/lua/abyss_theme.lua` 时启动失败，未进入产品断言；保留失败日志，补既有 `scripts/build-lua-data.mjs` / `scripts/build-ui.mjs` 生成夹具后仅重试该目标。没有改测试/超时来消除失败。
- `git diff --check` 通过；所有原 helper gzip hashes 保持。

本地原始日志/捕获脚本在本树 `.artifacts/potion-bootstrap/`：`source-tests.log`、`inventory-guards.log`、`potion-target-prerequisite-failure.log`、`build-data.log`、`build-ui.log`、`potion-target.log`、`capture.log`、`generate-packet.mjs`。未执行整套 Full/check、外部SDK、GIL、MCP、GUI/设备、官方容量/ready或发版。物理 iPhone14Pro 未验，TASK-38.4 不 Done。

交给独立复审的只是这个稳定组合源码。实际 Release 准入须等 #692 落地后核对真实 base SHA及相关 blobs；若 squash 仅改变父身份且相关树字节一致，可保留 b672 为来源 provenance，复审绑定真实 base，不能假定任何未来 SHA。没有新PR或自动合并授权操作，不轮询CI。
