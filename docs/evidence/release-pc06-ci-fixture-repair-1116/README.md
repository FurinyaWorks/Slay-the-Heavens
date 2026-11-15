# PR695 PC06 历史 fixture 修复证据

基线 `350c447c96dc65c1b48c48c3e0e24a3b627e4b2f`。本轮只修历史测试读取边界和最外 CI 绑定；设置图标产品 `21d48c4e41d0f2879acd4824a60e251c739433e8` 的六行改动与基线完全一致。独立复审 PASS，无未解决发现。

- RED：原五项合同 0/5，通过数为零，五项均失败。
- GREEN 13 项来自三轮 `5 + 6 + 2`，不是一次完整运行。第一轮命令曾列入不存在的 `integrated-ci-source.test.mjs`；实际只执行两个存在的 fixture 文件中的五项，其余合同随后以正确的 `cases.mjs` 路径运行，原记录保留。
- 复审发现新增 provenance case 依赖浅克隆可能缺失的历史 Git 对象。改为固定真实 Release blob 并重算完整前像后，仅重验受影响 case 和 fresh 六输入合同，末版 `2/2` 通过，无 skip；未重跑先前三轮。
- 原 `cef63cfa…` 四输入包原字节保留，原四个 before 和 93 个 archive pin 均不变；新增两个 before 完整绑定真实 Release `1cc5479…`。最终包 `cebeefff8b88e89c3763879dfb56140d44f5a86b6e93f641088657293cca44df` 含六输入和 94 个档案。捕获身份保持未提交。

`receipt.json` 保存原 RED/GREEN 分轮记录；`final-freeze.json` 保存末版身份与两项复验；`independent-review.json` 保存最终独审、原函数体保全、真实 Git 前像、产品 blob 和 stale-owner 反例检查。

五份 `*.log.json` 用 `dataBase64` 保存原日志字节，内部 `sha256`、`byteLength` 对解码后的原始字节计算。原日志没有单独的 stderr 文件，本目录不补造空 stderr；`originalArtifact` 对应两个 receipt 中的原日志名。`manifest.json` 对本目录实际 LF 文本字节计算哈希，并列出各日志解码后的原哈希。

原 `e35c93da60c4f74c06b0ba3923a8de1cfdfa261b9bf1dac5c7877594330d1109` 中间包只留本机 `.artifacts/release-pc-qa-20261115/ci-owner-repair-1116/pc695/intermediate-e35c93da-ci-source.json.gz`，未加入本次证据副本。

这些是离线 Source/CI 合同与独立代码复审证据，不代表 Full、Hosted CI、Host、官方候选导入、ready、PC/手机实测或官方容量验收。TASK-4.16 继续 In Progress，原 AC 保持。
