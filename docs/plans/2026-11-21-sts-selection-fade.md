# STS1 选角与普通切页修正（TASK-111）

本轮用户规格即设计依据。后续版本 P2/non-blocking，仅 develop，不指定日期，不进入当前发布门禁。

采用最小改动：复用 page_reveal 的 epoch、ready、局部框与失败恢复；可选 Alpha 阶段在旧页面稳定时淡出，完全黑后允许 refresh，目标真正 ready 后淡入。开局通过同一门禁延后原 beginRun，不另造转场系统。保持无原生颜色适配的规则测试宿主即时行为。

正式路径是 characterSelectionComposition，保留当前批准角色背景及文字布局，恢复未选中标题、可点击旅行者槽和三个无交互锁槽；选中只改变已有控件可见性。命座图形深色，金边只随选中可见。未批准角色继续隐藏。

- [ ] 回归：连续 Alpha、遮盖前不切页、迟到 ready、重复确认、失败恢复、同页不淡出。
- [ ] 实施：现有 gate / refresh / opening 接线；选角初态、槽位和图标。
- [ ] 验证：定向与相关回归、前后离线画面；官方导入/PC/手机另记待验。
- [ ] 独立评审、Required Checks 和 Merge Queue；未合入不标 Done。
