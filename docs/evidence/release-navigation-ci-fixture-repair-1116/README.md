# PR690 导航 CI 回归接续证据

目标仅为 release/v2.0.0。修复前远端 PR 头为 392818d0bcb8fcc7fb9b80f7082218e0b3c9de74，实际 Release 基线为 1cc5479b713edab6fd26db4e20f8eb22b7401cb2；本轮证据绑定尚未提交的已独审文件字节，不冒充新 Commit。产品提交仍为 a9425afa50e2a1dd10e83634a3e5fc0d24633917。根代理负责提交、推送及原 PR 的后续 CI。

## 实际失败与修复范围

[Quality run 43762292320](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43762292320) 的四个失败 job 原字节日志和下载收据完整保留。测试仍要求已按 PC38 移除的 help 控件、旧 JS 库存与内层拒绝位置；负例 reader 对未选中的 gzip 使用 Buffer 加空串，污染了无关二进制。共同 Git 来源证明还依赖浅检出没有的历史对象。

本轮仅改现有测试与最外层 CI 来源叶/包：当前正式入口、字号、Host 菜单按无 help 的既定产品语义验收；历史 Host 全 trace 与旧字号函数体完整保留。StS 先核实际 879 JS / 1424 Lua 库存，再用显式已认证前像运行旧合同；负例仅改选中文件，其他 Buffer 保原字节，拒绝必须对应被注入文件的精确已知边界。src、scripts、data、config、workflow、时限及费用权重未改。

最外包 SHA256 为 363579362238b55eca0913ba39a107008e901ecd38112a4dc412bbc4be56b14c，含 32 个当前绑定、96 个不可变档案。完整原包 1656049e4539b353628590e920a0bbb76fab2a23651caf0037aaf981fcc629a9 原字节保留；原 28 行的前像、除 Source 测试外的 27 个 after、原 95 个档案不变。共同 Release 的 12 个完整 Git 对象（3 commit / 9 tree）保留 352 个生产 blob、10 个 bootstrap 文件及父树证明；在线证明函数未删除，测试显式使用已独审的离线 reader。新增前像用两实际 Git commit 独立取证的 literal blob/SHA256 验完整来源，无运行期 git show 依赖。

## 分轮结果

| 证据 | 实际结果与边界 |
| --- | --- |
| before.log.json | 本地原定向 5 项：0 pass / 5 fail。 |
| after-fixtures.log.json | 首轮修复实验仍失败；历史布局依赖和无 controller 能力等实验错误保留。 |
| after-fixtures-2.log.json | 7 项中 6 pass / 1 fail；formal、历史/当前字号、两个 StS 漂移及来源保全通过，库存负例仍失败。 |
| after-remaining-and-trust.log.json、after-remaining-2.log.json | 保留后续两轮库存拒绝边界的失败；前一轮来源四项通过。 |
| after-remaining-3.log.json | 剩余库存单项最终 1/1 pass。与前述 6/7 属不同轮次，不写成同轮 7/7。 |
| after-current-overlays.log.json | 仅两个当前 Host 窗口 7–12、13–13，各 status 0；保同 Run 全图/alias/RNG、关闭重开、route 返回与无 help 控件/焦点。未重跑未修改的历史双 VM trace。 |
| final-source.log.json | 本地来源文件 7/7，通过时尚未做浅检出适配，作为历史阶段证据。 |
| final-offline-trust.log.json | 最终来源五项 5/5，涵盖 fresh 当前绑定、完整 Git 证明、旧包与前像、changed/missing/mistyped/各 tree 缺失和截断负例。 |

以上均为固定 Node v24.18.0 的定向离线验证，没有重复 Full，也没有触发或重跑 Hosted CI。命令及精确输入见 implementation-receipt.json 与 current-overlays.driver.source.txt。封装后仅运行 verify:backlog、check:guidance 对应的原脚本入口及 git diff --check，均 exit 0；原字节输出分别保留于 verify-backlog.log.json、check-guidance.log.json、metadata-diff-check.log.json，没有再跑产品用例。

## 独立复审与证据字节

independent-review.json 为 /root/ci_release_failed_jobs_inventory 的 CI_FIXTURE_REVIEW_PASS，11/11 独立只读探针通过、findings/unresolved 为空；包含 25 条真实 Git 与离线查询一致、12 个原始对象逐字节一致、352/10 来源、历史保护、实际库存和精确负例。评审未重跑正式 Lua、Host、StS 长循环、Source 或 Full。首次独立探针仅因 CRLF 文本比较失败，修正探针文本边界后通过；两份 probe 日志均保留，Git 对象始终按原字节比较。

评审 reviewedFiles 的 10 行中有 8 个执行/档案输入和 2 个 Backlog 文件。8 个执行/档案原字节冻结；独审后仅用 CLI 为 TASK-4.16 / TASK-4.11 追加本附件引用和独审备注，状态、负责人及全部 AC 行保持原样。implementation-receipt.json 是封装前事实快照，不改写其原记录。

所有 *.log.json 用 base64 封装原始日志，originalBytes / originalSha256 可校验解码所得原字节；外层 JSON 与文字附件统一 LF。manifest.json 对实际将提交的 LF 字节记录 SHA256 和 Git clean blob，未修改 .gitattributes。manifest 不自包含自己的哈希；封装收据留于本轮本地证据目录。

## 未验收要求

新 Commit 的 Hosted 必要 CI、同一正式候选的官方导入/真实 ready、PC、受影响手机路径与官方容量/静动态负载均未验收。两任务保持 In Progress，设备 AC 不勾。本附件不代表合并或发布许可，也没有访问私人原图或生成图像证据。
