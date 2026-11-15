# 2.0.0：同一正式候选的 PC／手机采证顺序

**待执行，不是验收记录。** 本页不出包、不放宽门禁。等发版负责人冻结最终源码与资产后执行；不要拿历史包、预音频包或仅通过 CI 的 PR 代替。证据按候选管理，交接仅发仓库链接。

## 1. 一次冻结、一次绑定

- 在干净的正式源码工作树冻结最终含音频的 GIL 和 `candidate.json`。记录 `sourceCommit`、`buildId`、`candidateSha256`、`payloadDigest`、GIL 字节数，以及 PC／手机设备、客户端版本、具名审查者。所有后续素材都用这 **同一** 身份；任何生成字节变化，都另开记录。
- 按 [FINAL-STARTUP.md](FINAL-STARTUP.md) 在获授权的工具链上保留真实导入／启动、ready 与日志；启动成功不等于能玩，也不等于官方容量通过。
- 在编辑器一次截图记录关卡和服务器存储（分别 ≤20 MB、≤3 MB），同时拿齐全局和各区域静态计算／内存记录。别用 Git checkout 大小、GIL 文件字节数或历史读数代替。

## 2. PC：一次主流程覆盖检查面

1. 在千星沙箱开启负载检测，然后启动。记录主菜单的批准稿还原、菜单入口以及切换时有没有异常整屏闪白／准备遮罩。
2. 走开局、选角、地图到高峰战斗：同一段录屏标记高峰时间、敌人与特效并发、合法复杂手牌；顺带验证拖牌／悬停、取消瞄准、打开和关闭牌堆、排序。可到达时验证中型酸叶团分裂后不重叠、死亡后奖励只出现一次，并查商店卡牌／遗物是否重叠。
3. 覆盖切页、重复进出（记录实际次数和时长）、回主菜单后继续／新开。区分暂停退出本局与主菜单真正退出。安排正常结束，让报告自动导入；导出原始报告前不要关检测。保存 PC／服务器四类计算和内存异常、峰值、处置及原始报告，注明检测本身的开销。
4. 未覆盖的场景在相同候选补跑；不要假设一趟必然遇到特定敌人、商店或通关。仍须按 P0 冒烟覆盖真实可操作、两幕及结算等正式要求。

## 3. 手机：只查 PC 无法代验的行为

- 实机记录机型、设置、持续时间、来源身份。重点：设置图标看得见且点得到；地图可看已拥有遗物；选中技能牌无黑块；拖牌／触控和文字可读；死亡与奖励顺序无闪现；退出战局后仍可继续或新开；排序方向标记正确。未覆盖／未解决项原样记录，不能用 PC 替代。
- 多敌战斗必须在实体手机上用手指走完自由瞄准、锁定、改锁、取消，核对箭头方向、终点与箭头尖端可见。目标 iOS 实机记录机型和系统，顺手覆盖计时初值、跨分钟、战斗／选路／奖励推进、跨幕连续、终局停止、新局重置和切后台／恢复，附短录像和对应日志。
- 同一截图或报告可以支撑多个检查，但每个条目注明对应页签、时间和场景。可公开的证据脱敏后再算 SHA-256；原始私有日志按权限留存。没有真实证据则标 `UNVERIFIED`，未解决项不能勾通过。

## 4. 完成前跑现有门禁，不另造流程

先按[当前 UI 清单格式](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/57201aa97d2498c8c3c4deea8af1c23044c0adaf/schemas/ui-acceptance.schema.json)为本候选另建 `final-review.json`。未测屏幕先填 `pending`，不要复制历史成绩。实际启动后，用同一候选的 `buildId`、真实 `runId`、`payloadDigest` 和当前批准稿摘要 `approvedDesignDigest()` 补齐顶层身份；逐屏按现行 verifier 补实测、人工评审和截图哈希。GIL 旁保留 `candidate.json` 与 `startup-evidence.json`；截图按官方启动记录的 `runDir` 相对路径收存，不混用旧候选或旧 run 记录。两行复用同一 UI 截图时，两行都写 `sharedScreenshotReason`（与平台负载笔记不同）。

从候选对应工作树执行。`npm run verify:ui` 固定使用历史清单；追加参数不能切换清单，因此这里直接调用同一个 verifier：

```sh
node scripts/verify-ui-acceptance.mjs "<final-review.json>" "<final.gil>"
npm run verify:platform-load -- "<final-candidate.json>" "<official-load.json>"
```

沿用 [平台负载合同](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/57201aa97d2498c8c3c4deea8af1c23044c0adaf/docs/PLATFORM_LOAD.md#L47-L79) 和 [P0 冒烟说明](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/57201aa97d2498c8c3c4deea8af1c23044c0adaf/docs/P0-SMOKE.md)。四个身份字段不匹配、缺报告／未验收、官方存储超限或有未解决问题时不得放行。代码合入、CI 绿、离线测过、实机通过、正式上线分别记录。
