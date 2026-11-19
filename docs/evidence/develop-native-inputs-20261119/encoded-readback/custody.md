# 含音频候选：三件交接的只读核对

拿到同一构建交付的最终 GIL、最终音频收据及全量装配原收据后，从正式流程另取已选源码 SHA 和代码版本（不能直接照抄待验收据）：

```sh
node check-custody.mjs FINAL.gil audio/candidate.json full/candidate.json APPROVED_SOURCE_SHA 2.0.0 > custody.json
```

核对最终 GIL 大小和 SHA-256、完整上游收据的原始字节身份、两阶段 clean 源码、buildId、版本/玩家更新日志、工具链、UI 与模块清单；从完整上游收据的 `inputs` 复算当前构建器定义的 payloadDigest；确认音频阶段的输入正是上游声明的候选 GIL SHA-256，且音频构建没有改写输入。同时要求收据中的 BGM 图编译/写入与客户端静态检查成功记录；不重新审计图或调用工具。只按命令行指定路径读文件，不会访问收据内写入的文件路径。

边界：这不是数字签名或独立核验本地仓库每个输入文件；不验证上游 GIL 的实际字节（未作为输入提供）、BGM 图、原生交互路径、官方导入、容量与设备结果。同一批次文件应从原打包维护线取得，完成本项后另跑 [GIL 实体路径检查](README.md) 和正式客户端验收。当前未收到真实候选，测试均用合成收据与字节。

定向测试：`node --test check-custody.test.mjs`。
