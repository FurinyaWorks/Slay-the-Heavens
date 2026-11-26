# 完整有声 GIL 按需构建

主仓 **Actions → GIL candidate → Run workflow**。工作流运行分支选受保护的 `develop`。在 `source_ref` 填 `develop`、本次正式 `release/vX.Y.Z` 或 `hotfix/vX.Y.Z`，在 `source_sha` 填对应已验收的完整小写源码 SHA。默认选 `build_origin=hosted` 由 Runner 构建。获批本地正式构建选择 `build_origin=local`，使用相同的审计、归档与下载读回。

- `develop` 接受已合入且对应 Quality 和 Licenses push 均成功的提交，构建开发候选。
- `release/vX.Y.Z` 与 `hotfix/vX.Y.Z` 接受冻结的当前分支 HEAD。先运行 `node scripts/release-ci.mjs freeze <分支> <HEAD>`，等待对应的 Hosted Quality Full 成功。用现有 **Licenses** 工作流在同一冻结分支手动运行默认审计并确认精确 HEAD、`inventory` 成功。工作流复核 Full 的实际 checkout 回执并在归档前重新读取冻结分支 HEAD。分支、源码版号、发布说明与批准记录均须对应本次工程版本。

成功后从 **Artifacts** 下载。每个新构建会从 GitHub 重新下载归档并和上传前的 GIL、回执与清单核对 SHA-256。若同一控制源码和构建请求已有仍在保留期内的成功制品，运行摘要给出原下载入口。冻结候选的 Artifact 名含工程版本和完整源码 SHA。解压后在制品目录运行 `sha256sum -c SHA256SUMS`，或用 PowerShell `Get-FileHash candidate.gil -Algorithm SHA256` 核对清单。Artifact 保留 14 天。

## 首次配置

GitHub 要求手动工作流先在默认分支注册。主仓首次安装沿用 [#917](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/917) 的现有集成门禁。维护者在主仓 **Settings → Environments** 配置 `gil-candidate`，将部署分支限制为受保护的 `develop`。冻结分支源码由此工作流按独立的精确 SHA 检出。私有输入 Secret 仅传给从 `develop` 检出的下载控制步骤。

- 环境 Secret `GIL_BASE_URL` 指向经批准、去除个人及测试数据的 Production 底图。使用 Runner 可访问的直连 HTTPS 下载，可用短期签名 URL。底图及下载凭据留在授权存储。
- 环境变量 `GIL_CANDIDATE_APPROVAL` 记录本次批准的分支、源码、底图原始字节 SHA-256、实际生产作品键、底图云端处理及最终包公开分发许可。由维护者审查底图、平台资源和音频授权后填写真值。每次换分支、源码或底图都更新批准记录。`reference` 填可追溯的审批编号。项目授权范围见 [LICENSE-SCOPE.md](../LICENSE-SCOPE.md)。

```json
{
  "sourceBranch": "develop",
  "version": null,
  "sourceSha": "<40 位经过 CI 验证的提交>",
  "baseSha256": "<64 位基础 GIL SHA-256>",
  "workKey": "<经核实的实际生产作品键>",
  "baseProcessingApproved": true,
  "publicArtifactApproved": true,
  "reference": "approval/123"
}
```

冻结候选的批准记录改用对应 `release/vX.Y.Z` 或 `hotfix/vX.Y.Z`、工程版本及冻结 HEAD。

Windows Job 使用 Node 24.18.0、锁定的 MCP 提交和 v3 生产预设。冻结候选调用 `npm run build:native -- <base.gil> build/hosted-gil --release-candidate --work-key=<作品键>`，复核源码、BGM 图和信号读回、产物大小及 SHA-256，再对下载版 GIL 独立审计脚本、原生 UI、模板与节点图。制品包含最终音频 GIL、可移植回执、清单和校验和。

## 本地正式构建

1. 在独立、干净的工作树检出已经冻结的 `release/vX.Y.Z` 或 `hotfix/vX.Y.Z` 源码 SHA。使用同一获授权的底图副本、已核验的审核素材、Node 24.18.0、Python 3.12.10 和 [构建工具固定的 MCP 提交](../scripts/gil-candidate-preflight.mjs)。项目和 MCP 均按各自锁文件执行 `npm ci --ignore-scripts`，在 MCP 目录运行 `npm run build:core`。设置 `MILIASTRA_MCP_ROOT` 为该 MCP 检出路径，`MILIASTRA_PYTHON` 为对应 Python，`MILIASTRA_ALLOW_LIVE_WRITE=0`，`MILIASTRA_SAVE_ROOTS=[]`。
2. 从冻结工作树使用正式 v3 生产预设构建。构建结束后由当前受保护 `develop` 的控制脚本打包底图、中间 GIL、最终 GIL 和两份构建原始回执。保留输出的冻结源码、作品键、构建命令、运行时版本及三项 SHA-256。

   ```sh
   npm run build:native -- <base.gil> build/local-gil --release-candidate --work-key=<作品键>
   node <develop检出>/scripts/gil-candidate.mjs export-local <冻结分支> <作品键> <base.gil> build/local-gil <私有传输包.json>
   ```

3. 独立评审依据构建现场记录复核实际构建命令、Node 和 Python 版本、清洁源码、授权底图、两份回执及最终产物。维护者确认许可后在 `gil-candidate` Environment 的 `GIL_CANDIDATE_APPROVAL` 填冻结记录，并将 `localBundleSha256`、`localCandidateSha256` 分别设为输出的 `bundleSha256`、`candidateSha256`。在 `reference` 关联批准记录。将私有传输包保留在授权存储，Environment Secret `GIL_LOCAL_BUILD_URL` 填 Runner 可访问的直连 HTTPS。公开发布制品只有经审计的最终 GIL、可移植回执、清单及校验和。
4. 从受保护 `develop` 运行 **GIL candidate**，选择 `build_origin=local` 与对应冻结源码。工作流重新校验 Full、Licenses、传输包、底图、两阶段回执、发布说明和最终 GIL，再用相同的正式来源审计、归档和 SHA-256 下载读回。清单保留本地来源、审批引用、可复现配方及原始构建输入摘要。公开回执使用固定路径标签核验同一组源码输入。用所得 Artifact ID 执行 [正式性能及平台流程](PUBLISHING.md)。每个受限档测量从实际归档 GIL 读取的 Lua、UI 和模板。

保留 `candidate.json` 和 `candidate.gil` 在同一解压目录。使用精确源码、已水合的审核素材和清单指定的 MCP 提交，从项目根目录执行 `npm run verify:platform-load -- <解压目录>/candidate.json <official-load.json>`。将 `MILIASTRA_MCP_ROOT` 指向本机 MCP 检出。原生复审可运行 `node scripts/audit-native-candidate.mjs --source <SHA> --candidate <解压目录>/candidate.gil --receipt <解压目录>/candidate.json --output <新证据目录> --bgm`。

清单将平台版本记为 `null`，由 Owner 实机验收及人工发布后依据平台回执确认映射。官方导入、平台负载、ready、PC 和手机验收使用同一候选，见 [v2 交接](versions/V2-RELEASE-HANDOFF.md)。
