---
name: release-maintenance
description: 为已冻结的Release修复缺陷、性能或发版工程阻塞时读取；新功能走develop。
---
# Release 功能冻结

- Release把已承诺功能修好；Develop开发下一版本。先核对远端基线及在途PR，独立分支，禁止把develop整支反向合入。
- `release/v2.0.0`只接Bugfix、必要性能修复、回归与发版必需工程修正。新交互/快捷键不是Bugfix；TASK-42.1 / PR #670的数字键、快捷键、预输入留在后续版本。
- 修复PR以最新Release为base；Feature以最新Develop为base。发版必要性须写具体缺陷/阻塞及验证，不能以调试方便、顺便或原版已有为由扩范围。
- Release PR正文必须各有一行（建议直接填写模板；门禁按整行字面字段读取，不解析Markdown）：
  `Change-Type: bugfix`（可逗号组合performance、regression、release-engineering）
  `Target-Version: 2.0.0`
  `Release-Necessity: 具体发版阻塞与本次修正`
- 门禁复用Quality的PR metadata步骤；缺字段、错版本、重复/未知类型、feature或feat标题拒绝。声明不替代人工diff审查；不得把Feature谎报Bugfix。
- 当前门禁不授予Feature例外；PR自填Owner-approved无效。Owner明确改变范围后，先通过可评审PR更新冻结规则及门禁，再接入例外；Agent不得自批。
- 混合PR拆开：必需修复留Release，Feature移回Develop，保留任务/提交/证据，不重复实现。合入Release的修复另经PR回流Develop。
- 出牌P0对照STS1源码和既有输入，先复现，再以同条件轨迹修拖牌/等待/反馈/输入丢失；保留busy、归属、多指、旧回调和RNG保护，不新增预输入或键盘玩法。
- 编译/离线回归不等于官方/手机流畅。未测明确UNVERIFIED，不合并或发版，窗口授权按根指引。

候选与当前门禁状态按需查[发版交接](../../../docs/versions/V2-RELEASE-HANDOFF.md)；任务与质量流程沿用根AGENTS及CI，不在此复制。
