# Develop 紧凑药水弹窗

回流 Release 已合入的药水弹窗设计。战斗、战后选牌、地图及房间使用同一套面板。面板沿用主题底板和描边，两个等宽操作各自保留正常、悬停、按下和禁用状态。使用采用金色主操作，丢弃沿用暗红确认材质。弹窗打开时，战后选牌及遗物栏保持显示。

正式生成布局的弹窗等价性、长说明和按钮状态由 `tests/official-run-hud-reuse.test.mjs` 与 `tests/potion-popup-readability.test.mjs` 验证。官方设备画面待验。

[Release PR #871 与独立复审](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/871)
