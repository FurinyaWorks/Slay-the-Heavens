# Release Freeze Implementation Plan

Goal: 让既有冻结规则可发现、可执行，保持出牌P0修复边界。
Architecture: 20行按需技能作为唯一规则入口；现有Quality metadata调用显式声明检查，不做语义分类、不新增job。Develop与原质量预算保持；所有新Feature拒绝，Owner需先评审修改规则才有例外。
Spec: Owner本轮明确指令；TASK-112。

- [x] 查现有技能、模板、分支/CI及在途PR，先失败正反例。
- [x] 三声明检查与live PR身份核验、edited重验；修短入口/模板旧路由。
- [x] 追加精确完整CI来源延续，不改历史包、库存/预算。
- [x] 逐项保全在途PR范围与声明；Feature越界拆分/退回，#670留Develop。
- [x] 对已复现P0按既有TASK30接续，不复制在途指针tracker或以放松归属保护冒充流畅。
- [x] 相关验证、独审、独立PR；不合并、发版或操作窗口。

实施/离线验证已交付；P0的2个RED仍未修，已沿TASK30接续，未放松ID保护。任务/PR保持进行中；托管CI、Release普遍生效、官方与设备仍未验。
