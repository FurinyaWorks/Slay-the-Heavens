# TASK-111 默认装配减容证据

见[报告](../../research/2026-11-16-default-release-reduction.md)。这是实际默认生产链的离线编码测量，不是正式RC或官方容量。所有官方MB/客户端导入/ready/设备/引擎行为与性能为 **UNVERIFIED**。

## 最新Release主交付

交付前已纳入最新Release33d（#697）。`latest-release-audio-comparison.json`比较有相同真实sidecar的F4合成控制/b4bfb55e与F3优化/7b6：15,953,517→10,950,266 GIL字节，减少5,003,251。F2是原始33，无sidecar，因此直接比较被拒绝；不猜填其profile。`latest-control-equivalence.json`交叉证明F2/F4的UI、模板、366模块（仅fresh UUID不同）及其他内容边界。服务器图原payload hash不同；`graph-control-differences.json`保留逐字段差异，`graph-control-validation.json`以完整protobuf只剔除节点编辑器x/y，确认每对各210个布局坐标差异，其余全字段相同。编译器抖动位置/hash已定位；并非玩法RNG修改。

`latest-statistics-control.bundle`为F4 source-only控制提交（五个owner回退，helper仍在但惰性），依赖本PR历史7b6；可用 `git bundle verify`，再将bundle的HEAD fetch到独立控制ref恢复检查。它不含GIL、不含游戏窗口数据，也不是正式RC。F2/F3/F4收据/严格audit均独立保留，不借旧D2/F1身份。

## 文件与复现

- `latest-delivery-comparison.json`：旧Release1cc的D0/D2原生入口；`audio-delivery-comparison.json`：同基线F0/F1完整音乐入口。两组分别同配置，不跨入口相减。
- `identities.json` 与各 `*.receipt.json.gz`：冻结真实来源/构建/候选hash；D1显式superseded，D2/F1只绑定bf74，文档或后续合流不改写旧身份。
- `ui-share-spike.json`、`data-experiments.json`：同一D0的真实GIL单因素与组合，官方值为null。
- `logical-input-inventories.json.gz`：原始逻辑输入账单，61宿主/8892控件并未消失。measuring sourceCommit与generatedProducer身份分开；实际存储共享另见comparison.packing与wire分区。
- `rebuild-regression.json`：旧展开基底→共享→再次共享，无增长；不同源码阶段分别记录，不用作同源收益相减。
- `audit-status.json`、四份 `*.audit.json.gz`：严格审计保留两项FAIL，不隐藏、不降低断言。
- `validation-status.json`、`*.log.gz`、`full-interruption.json`：分阶段验证和未完成Full的真实状态，不把跳过/中止记为通过。
- `shallow-source-pack.json`：Git单提交树压缩体积，仅网络门禁上下文；不是GIL、官方存储或托管CI通过证据。
- `compare-default.mjs.txt`：实际使用的核对脚本，改扩展名为.mjs后在本目录运行。依赖已安装工具链及对应GIL、原始generated和父收据，本仓库不嵌入诊断GIL。可用CAPACITY_CANDIDATE_FILE_0/1定位已保全的原始GIL，脚本会校验hash；父收据/generated路径须按保全环境恢复，不接受任意配置替代。

```bash
MILIASTRA_ALLOW_LIVE_WRITE=0 MILIASTRA_MCP_ROOT=/absolute/toolchain \
  node scripts/build-native-audio-game.mjs /absolute/same-clean-base.gil work/new-output
MILIASTRA_ALLOW_LIVE_WRITE=0 MILIASTRA_MCP_ROOT=/absolute/toolchain \
  node docs/evidence/task111-default-reduction-20261116/compare-default.mjs \
  /baseline/audio/candidate.json /optimized/audio/candidate.json work/new-comparison.json F1 F0
```

分别在明确的baseline/optimized干净checkout运行第一条，再用第二条核验。工具链与fixture定位/hash见报告及原调查；不把此命令用于用户原档覆盖。Raw GIL与generated保留在云端work，未作为下载附件或RC交付。`manifest.json`覆盖本目录所有其他文件的原始字节与SHA256；gzip固定mtime=0。旧两组证据与历史来源packet原样保留。

独审：产品与证据由`/root/capacity_review`审查008920df / BASE33d，PASS、unresolved=[]，见review.json。该reviewer编写了CI合流补丁，因此CI三文件另由fresh `/root/capacity_review/ci_integration_review`独立审查APPROVE，见ci-integration-independent-review.json；不将作者自审充作独审。F3全部643项生产输入与交付代码字节一致，见delivery-source-binding.json。
