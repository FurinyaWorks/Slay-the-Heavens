# TASK-111 · STS1选角与普通Fade（后续版本P2）

从 develop `345ba08398b6ca8e1361a126f2ce1de85210e634` 接续，分支 `feat/sts-selection-fade`。不进入当前发布门禁，不指定日期，不修改冻结的 release/v2.0.0。

正式构建实际走 `characterSelectionComposition`，并非历史 `applyStsCharacterLayout`。本轮复用其原生输入对象、已批准1600图元背景、已有文字信息和测量参数。取消生产自动预选；旅行者槽恢复真实点击入口，其他角色白名单不变。三个锁槽只作无交互装饰，不编造解锁条件。命座93个现有静态图元转深色，选中才显示独立金边，槽位使用STS测量中心/间距/100px石质斜边；按钮保留 Owner 在 #785 调好的平滑圆角、材质和四态；仅确认标签随本轮要求为启程。

普通全屏转场复用page_reveal的epoch、局部框、真实ready与失败恢复；原有菜单打开恢复入口继续只在失败可用。淡出时不绘制目标或回收旧页卡面，完全黑后绘制，ready跨调度确认后淡入。只更新既有veil Alpha。启程复用相同边界延后beginRun，立即锁定、一次提交；普通页面不再显示璃月印记/元素图。现有无原生转场的规则宿主保留即时测试能力。选角局部慢加载使用透明输入隔离，详情/启程待资源准备好同步出现，避免整屏闪黑。

## 证据等级

- 源码：新增连续Alpha、慢加载选角、单次开局、readiness重入、取消departure重入及历史source drift负控。页面就绪专项、角色白名单/普通玩家入口、旧选角完整历史回放、牌组100次排序/空列表/迟到cell、native启动与fatal BGM回归均有定向通过记录。架构/Luacheck通过，无新增诊断；完整工程、全量及Hosted检查以实际日志为准。
- 离线投影：[修改前](before-selection.png)、[修改后](after-selection.png)、[未选中](empty.png)、[淡出中](fade-half.png)。来自真实Lua Host控件写入及批准的1600图元读回；复用既有Pillow投影工具。图片不是官方客户端或完整SDK截图。专用图集纹理与环形裁剪无法由此渲染器完整重现，命座细线/原生圆角/字体仍以原生设备为准。`receipt.json`记录输入/图片摘要。
- 官方真机：未执行官方候选导入、当前ready、PC/实体手机及设备性能验收，未声称通过。无桌面输入占用。

## 复现

```sh
node --test tests/sts-selection-fade.test.mjs tests/sts-page-reveal.test.mjs
node --test tests/noncombat-v25-layout.test.mjs tests/sts-character-reference.test.mjs tests/competition-character-admission.test.mjs
node --test tests/deck-browser-reveal-reuse.test.mjs tests/native-startup-contract.test.mjs
node docs/evidence/sts-selection-fade-20261121/capture.mjs build/sts-evidence-states --selection
python docs/evidence/v2-ui-20261119/render-runtime.py build/sts-evidence-states
```

历史source回放只对精确完整的新文件投影回原基线；原历史归档及断言不删除，外来字节与关联owner漂移保留可见并失败。新增fixture明确记录base、完整before与当前after SHA。

独立评审：实际独立子会话 `/root/review_fade`（无父历史）发现并复核修正旧页卡面提前回收、readiness重入和被取代departure三项问题。此文不是GitHub可信协调签署或Required Checks证明；精确HEAD/BASE合并树的最终报告按现有流程另行提交。

## 用户纠正后的最新源码核对

本轮最初只核对develop，漏查已在旧发布线合入的 #785（bb3d0d07ebee3592bee4673f1a1378ddbf513698）；曾将平滑按钮换回旧弯旗并在投影保留旧常驻暗层。用户指出后已撤回这部分，按 #785 保留原生圆角、共享材质、隐藏 officialBackdropVeil，并从备用背景删除旧 veil。此处只接续用户已完成的修正，不修改/合并/cherry-pick到冻结发布分支。#800新商店入场与#801能量/状态、#799出牌反馈已查阅，不接管其文件。

最新 preserve785 定向：9/9通过，新增断言覆盖原生圆角及选角常驻veil消失。用户指出的白色句子待按具体控件确认；普通加载的message已隐藏，角色信息不擅自删除。图片已更新为保留 #785 的版本，旧独审不是新源码的合并准入证明。

完整npm test尝试尚未完成，过程中已有 `actual CRLF source and helper checkout retain the frozen LF Git identity`、`Act1 failure boundaries 1/4 preserve all original values and aliases` 失败，未取得完整绿灯；其运行期间发生了用户纠正后的源码更新，不能用于认证最终候选。尚未创建PR、启用Auto-merge或合入。
