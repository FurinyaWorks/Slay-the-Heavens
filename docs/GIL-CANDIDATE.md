# 正式有声 GIL 的构建与交付

**GIL build** 是正式有声候选的唯一构建入口。每轮以主仓 `release/vX.Y.Z` 或 `hotfix/vX.Y.Z` 的冻结 HEAD 为源码。先运行 `node scripts/release-ci.mjs freeze <分支> <完整HEAD>`，等待 Hosted Quality Full 成功。用 **Licenses** 在同一分支手动运行默认审计，确认 `inventory` 与实际 checkout 都对应同一 SHA。

在主仓 Actions 的 **GIL build** 运行摘要核对冻结分支和完整源码 SHA，取得正式 Artifact 链接和 GIL SHA-256。自动构建尚未运行时，在同一工作流点 **Run workflow**，选择已冻结的 `release/vX.Y.Z` 或 `hotfix/vX.Y.Z` 分支。工作流从该 ref 复核完整 SHA，无额外输入。复跑前先查同一源码的已有成功归档，沿用该次构建的工件 ID 和摘要。

构建使用[已发布的 v2.1.1 GIL](https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/v2.1.1) 作为固定运行时起点，核对归档来源和实际字节。Windows Hosted Runner 使用锁定的 MCP 提交、v3 生产精绘和原生音频预设，重建 Lua、原生 UI 和结算/BGM 图，审计脚本、模板、节点图及其余继承容器段。构建回执默认使用 `offline-candidate` 标识。维护者可以设置仓库变量 `GIL_PRODUCTION_WORK_KEY` 指定回执标识。实际作品身份由 Owner 根据平台回执确认，底图和音频/资源授权范围见 [LICENSE-SCOPE.md](../LICENSE-SCOPE.md)。

正式工件包含 `candidate.gil`、`candidate.json`、来源及审计清单和校验和。工作流上传后重新下载校验。解压时保留 `candidate.gil` 和 `candidate.json` 在同一目录，用 `sha256sum -c SHA256SUMS` 或 PowerShell `Get-FileHash candidate.gil -Algorithm SHA256` 复核。记录完整源码 SHA、Artifact 链接末尾的数字 ID、GIL SHA-256、`buildId`、`payloadDigest` 和工件到期时间。正式工件保留 90 天。

## 在后续门禁沿用同一工件

1. 从构建摘要取数字 ID，运行冻结分支的 **Performance regression** `formal`，将数字填入 `gil_artifact_id`。验证通过后保存 `release-ci verify` 的 `performance.gil` 及对应的 Full 和 formal 证据。
2. 用该工件的同一份 GIL 完成 Simulator、官方编辑器导入/负载、PC 和实体手机验收。按[平台负载门禁](PLATFORM_LOAD.md)制作并校验 `official-load.json`，按 [P0 冒烟](P0-SMOKE.md)记录启动、真实游玩及设备结果。
3. Owner 按[发布操作单](PUBLISHING.md)使用同一 GIL 执行官方发布并提供成功回执，随后用原工件完成 GitHub Release 归档。

原生独立复审可从冻结源码、已水合的审核素材和清单中的 MCP 检出运行下列命令。将 `MILIASTRA_MCP_ROOT` 指向该检出。

```sh
node scripts/audit-native-candidate.mjs --source <SHA> --candidate <解压目录>/candidate.gil --receipt <解压目录>/candidate.json --output <新证据目录> --bgm
```

旧工作流制品、旧平台回执和本地诊断按原身份留存。开发和 Fork 的诊断只上传摘要，保留 14 天。它们可用于复核当时的结论。正式提测从本轮冻结源码和唯一正式工件开始。
