# 导航切片证据

`raw-index.json` 列出本轮真实命令输出的无损 gzip、原始长度和 SHA256；gzip 解压结果必须与原始 hash 相等。`red.log.gz` 来自产品未改的 Release；`green.log.gz` 保留缺生成文件失败；`related.log.gz` 为补齐生成后的完整 20 项结果，16 PASS / 4 来源合同 FAIL。`route-both-pages.log.gz` 是扩展到两类调用页后的 2/2；`engineering.log.gz` 保留初次缺工具失败，`engineering-with-tool.log.gz` 为复用本地工具后的通过。

产品、来源及设备验证的边界见 [技术附件](../../backlog-details/RELEASE-PC-NAVIGATION-20261115.md)。本目录没有官方画面、私人截图或手机证据。

独立产品评审在 `independent-review.json` / `.md`，原始8份审查/探针材料的无损归档由 `independent-artifacts.json` 列出摘要。探针初次夹具位置与正dt推进时钟的实验失败保留，最终zero-tick只隔离命令效果，不证明帧率或延迟。CODE_PASS_SCOPED 不覆盖4项来源失败、Full和设备验收。
