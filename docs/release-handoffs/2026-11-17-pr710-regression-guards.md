# PR #710：旧来源回归最小修复交接

保全用途；本分支不是新 Release 组合，不自动创建 PR、触发 CI 或授权合并。

- 可 cherry-pick 的修复提交：`43aeff55e17d77dfb0da67611025dc04b0e27716`。
- 修复父提交：`d0c82e64e6c0f60aa64d163e398894e6853f318d`，即本轮核对的 #710 公开 HEAD。
- 修复源码树：`2eb35eab244830b0ab195d850d78d04eef516c6d`。
- 本轮远端 Release：`af77fb2461c548f0faf104761d107397f75dca08`（已含 #707）。两者 merge-base 为 `00ab3fe6d386f55aecfb063e59aeca2cf5065807`。

## 补丁范围

仅 5 个测试/来源文件，131 加、9 删：

- StS 注入器保持非目标 raw Buffer；准确目标按类型追加，复用 #707 的 typed Buffer 原理。
- joint CI 合法 CRLF 的完整父文本按 LF 规范化后逐字比较，保留 CRCRLF 拒绝。
- 两个容量原用例继续遍历全部原来源、两类变异与缺失；拒绝同时匹配 ERR_ASSERTION、明确校验类别和准确目标路径，不能用无关异常冒充。
- 在既有 enemy capacity 叶适配器追加四份精确当前测试的可逆来源延续；先认证真实当前字节，再还原到完整 d0 原源码并验证原 SHA256。没有新来源框架。
- 新边界用例覆盖这四份可执行测试自身的漂移、缺失、已知旧版本替换、LF/CRLF、CRCRLF、未知类型与 Buffer。

未修改生产文件、workflow、旧 gzip、旧 pin 或预算。本分支不保存压缩包或 large bundle。

## 已有验证收据（本轮保全不重跑）

Linux / Node v24.19.0，非 Hosted、非 Windows 或官方客户端：

| 验证 | 结果 |
| --- | --- |
| 原四个具名用例：StS、default reduction、capacity、joint CI | 原 0/4 → 单轮 4/4，0 失败/跳过 |
| 最终原四项 + regression repairs 新边界 | 单轮 5/5，0 失败/跳过；70659.803401 ms |
| 独立定向探针 | 最终 475/475；原始包认证、43 个 StS 目标、27 个容量来源变异/缺失、87 份实际 Git 父记录及换行边界 |
| 全新 d0 worktree 应用补丁 | git apply --index 成功，所得树与上述修复树完全一致 |
| 独立只读复审 | /root/review_release710_patch：PASS，unresolved=[]，Critical/Important 无 |
| 独审额外补跑真实 helper 副本闭包 | 1/1 PASS，0 FAIL；约 13.315 秒 |

5/5 和 475/475 在最终工作树提交前运行；探针当时 HEAD 字段仍是 d0。受测代码随后提交为 43aeff55，独审逐一核对五文件 SHA256 与提交一致，四条逆变换与实际 git show d0:<path> 完整原文一致。不能把记录冒称为对新 HEAD 的 Hosted 检查。

中间一次探针 473/475：两条新逆变换 CRLF 未返回 LF 父字节；已修复并新增上述边界后取得最终结果，旧失败不抹除。

最终受测五文件 SHA256：

| 文件 | SHA256 |
| --- | --- |
| tests/helpers/release-enemy-capacity-join.mjs | bd912ee2bcbba55f323ceab0ecd1b5c201d126d2acb0b96fee387055605c49bf |
| tests/native-candidate.test.mjs | 7b4971fe0a5d687c5c3ce4a0a4fbb6253108a1d3b2ac41fed29bc980afac662f |
| tests/platform-load.test.mjs | b921bfbc713f3159f4ae30399b040c13003387f59722b2a667bc74d8deeea28f |
| tests/release-card-contact-integration.test.mjs | fa0061fb8b108beb1befabe3a6cee9a876f350eb9533c65773c87370cd525761 |
| tests/sts-style-source-epoch.test.mjs | edb4b2442afbc83d6d74b3df6a3610708461caa46746a90126cd5c71dc345bec |

复验入口（仅供下一轮准确候选使用，本轮保全不执行）：

```bash
node --test --test-reporter=tap --test-concurrency=1 \
  --test-name-pattern='^feedback real current source|^default reduction CI continuation|^capacity CI continuation|^joint CI binds|^regression repairs' \
  tests/sts-style-source-epoch.test.mjs tests/native-candidate.test.mjs \
  tests/platform-load.test.mjs tests/release-card-contact-integration.test.mjs
```

## 原协调者接续边界

先重新核对实际最新 BASE，再在原协调者独立工作树吸收该修复，不直接从本准备分支更新 #710。

已知 af77 × d0 的四处真实来源冲突：`tests/helpers/integrated-ci-source.mjs`、`tests/helpers/release-capacity-b9-ci-source.mjs`、`tests/helpers/release-card-contact-integration.mjs`、`tests/release-selection-map-source.test.mjs`。必须保留 #707 的 preflight/Fast reader 和 #710 的 enemy/read 贯穿、两侧具名测试与完整库存；按最终字节重新认证并分别投影到精确父输入，不能选择 ours/theirs、改旧 pin 或以无文本冲突代替来源认证。

43aeff55 的 4/4、5/5、475/475 不覆盖该新组合，也不等于 Release 放行。Windows Luacheck 下载 CRYPT_E_REVOCATION_OFFLINE (0x80092013) 仍独立待处理；未关闭 TLS/吊销校验。官方导入/ready、容量、PC/手机继续 UNVERIFIED。
