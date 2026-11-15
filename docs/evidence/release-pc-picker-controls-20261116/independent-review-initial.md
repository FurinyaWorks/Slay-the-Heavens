# PC26 / PC30 分页与按钮独立初审

结论 **REQUEST_CHANGES / CODE_SCOPE**，有 1 个 P2。基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`；产品 `a925ce43bda10030d7dfd7fe7b96c450c17f8702`（tree `0a2286d1cae8938588c978b64f99a88baa6af590`）；证据 HEAD `14363e83a93fcc668deddce9fe38f6f4d05f1926`（tree `a58f6eadc2aed970f3084f19e149035a0b8cb75e`）。作者与评审者独立，目标仅 Release。

- **P2-1 — 新宽分页按钮与真实悬停卡片交叠。** `scripts/official-picker-controls.mjs:22` 沿用旧 footer y=-236，却将宽度从56增至200。14张牌的锻造第一页，card11 真实 CursorEnter 后 scale=1.08，卡范围 x[189,351]、y[-217.4,9.4]；forgeNext 范围 x[330,530]、y[-260,-212]，交叠21×5.4。card12交叠161×5.4，左侧对称。旧窄侧钮仅有外卡3.4高窄交叠，未覆盖内卡card11/8，本片扩大了冲突。新增测试只用未缩放卡片矩形，漏掉当前真实 hover。应保持卡面、hoverScale、材质、动作和预算，调整 footer 安全间距并补真实 hover 回归。

全部7产品/测试路径已完整读diff与上下文。独立生成树检查6个原容器/hit/现有label身份、focusable cursorArea、现成Deck/最终低控件选角材质逐节点完全一致、零新增输入与默认profile完全不变，均通过。真实生成Host确认card12的hover1.08/退出1和原点击下一页可用。证据见 `picker-independent-probes.json`、`picker-independent-host.log`、`picker-independent-probe.mjs`。几何冲突不冒称官方鼠标命中顺序或截图结果。

当前official断言修改限定在六控件及其hit/label；采纳组件允许变化的几何/材质仍按共享来源精确比较，原身份和其他字段未放宽。旧44×208/56×44默认profile保护和旧hit/错材质负控均保留。原冻结integration SHA失败仍保留，须由严格来源专片处理，不能判为CI通过。

作者只读/末页/长文/取消/一次交易/C档等定向证据已查阅；独立评审未重复Fast或全套。没有新增动作、规则、RNG或Deck所有权变化。未来PR685的Deck112×48多选保留/确认与失效session处理未组合，本评审不外推组合通过。

私图07/09未访问；Source冻结合同、Hosted Full、正式candidate导入/ready、官方20MB/3MB、PC与实体手机均未验。PC26闪烁属于PR684，本评审不判完整反馈关闭。未改产品、Backlog、PR、分支、Tag或发布，也未使用GUI/MCP。
