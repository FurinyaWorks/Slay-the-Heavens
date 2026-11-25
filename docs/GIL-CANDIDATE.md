# 完整有声 GIL 按需构建

主仓 **Actions → GIL candidate → Run workflow**。工作流运行分支选受保护的 `develop`。在 `source_ref` 填 `develop` 或本次正式 `hotfix/vX.Y.Z`，在 `source_sha` 填对应已验收的完整小写源码 SHA。后续构建、校验和归档由同一个工作流完成。

- `develop` 接受已合入且对应 Quality 和 Licenses push 均成功的提交，构建开发候选。
- `hotfix/v2.1.1` 接受冻结的当前分支 HEAD。先运行 `node scripts/release-ci.mjs freeze hotfix/v2.1.1 <HEAD>`，等待对应的 Hosted Quality Full 成功。用现有 **Licenses** 工作流在同一 hotfix 分支手动运行默认审计并确认精确 HEAD、`inventory` 成功。工作流复核 Full 的实际 checkout 回执并在归档前重新读取 hotfix HEAD。分支、源码版号、发布说明与批准记录均须对应 v2.1.1。

成功后从 **Artifacts** 下载。若同一构建请求已有仍在保留期内的制品，运行摘要给出原下载入口。Hotfix Artifact 名含 v2.1.1 和完整源码 SHA。解压后在制品目录运行 `sha256sum -c SHA256SUMS`，或用 PowerShell `Get-FileHash candidate.gil -Algorithm SHA256` 核对清单。Artifact 保留 14 天。

## 首次配置

GitHub 要求手动工作流先在默认分支注册。主仓首次安装沿用 [#917](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/917) 的现有集成门禁。维护者在主仓 **Settings → Environments** 配置 `gil-candidate`，将部署分支限制为受保护的 `develop`。Hotfix 源码由此工作流按独立的精确 SHA 检出。底图 Secret 仅传给从 `develop` 检出的控制步骤。

- 环境 Secret `GIL_BASE_URL` 指向经批准、去除个人及测试数据的 Production 底图。使用 Runner 可访问的直连 HTTPS 下载，可用短期签名 URL。底图及下载凭据留在授权存储。
- 环境变量 `GIL_CANDIDATE_APPROVAL` 记录本次批准的源码、底图原始字节 SHA-256、实际生产作品键、底图云端处理及最终包公开分发许可。由维护者审查底图、平台资源和音频授权后填写真值。每次换源码或底图都更新批准记录。`reference` 填可追溯的审批编号。项目授权范围见 [LICENSE-SCOPE.md](../LICENSE-SCOPE.md)。

```json
{
  "sourceBranch": "hotfix/v2.1.1",
  "version": "v2.1.1",
  "sourceSha": "<40 位冻结 HEAD>",
  "baseSha256": "<64 位基础 GIL SHA-256>",
  "workKey": "<经核实的实际生产作品键>",
  "baseProcessingApproved": true,
  "publicArtifactApproved": true,
  "reference": "approval/123"
}
```

Windows Job 使用 Node 24.18.0、锁定的 MCP 提交和 v3 生产预设。Hotfix 调用 `npm run build:native -- <base.gil> build/hosted-gil --release-candidate --work-key=<作品键>`，复核源码、BGM 图和信号读回、产物大小及 SHA-256，再对下载版 GIL 独立审计脚本、原生 UI、模板与节点图。制品包含最终音频 GIL、可移植回执、清单和校验和。

保留 `candidate.json` 和 `candidate.gil` 在同一解压目录。使用精确源码、已水合的审核素材和清单指定的 MCP 提交，从项目根目录执行 `npm run verify:platform-load -- <解压目录>/candidate.json <official-load.json>`。将 `MILIASTRA_MCP_ROOT` 指向本机 MCP 检出。原生复审可运行 `node scripts/audit-native-candidate.mjs --source <SHA> --candidate <解压目录>/candidate.gil --receipt <解压目录>/candidate.json --output <新证据目录> --bgm`。

清单将平台版本记为 `null`，由 Owner 实机验收及人工发布后依据平台回执确认映射。官方导入、平台负载、ready、PC 和手机验收使用同一候选，见 [v2 交接](versions/V2-RELEASE-HANDOFF.md)。
