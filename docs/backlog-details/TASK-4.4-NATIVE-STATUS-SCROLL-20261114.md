# 单位状态详情原生连续滚动

基线 `origin/develop@9f2f44e4`，独立分支 `feat/status-detail-scroll`。仅本地开发，不推送、不创建PR、不集成或修改发布候选。Backlog由主控统一写入。

## 真实缺口与实现

原实现只有 `paginate(card)` 和点击 `page` 循环翻页，未包含原生滚动控件。新增真实GameUI回归在原源码失败于 `unit details have no native continuous scroller`，证明AC7不是仅缺设备证据。

从人物头像打开完整单位详情时，使用标准 Native Grid 的 `RefreshItems`、`scrollProgress` 和 `itemTemplate`。标题、生命/格挡保持固定；增益、减益、名称层数、持续回合、效果和条件按阅读顺序投影成固定48高行，Native Grid负责裁切、滚动和回收。固定页脚列出真实增益/减益项数并提示滑动；看不到的易伤不再只能靠发现第二页。

模式切换是独立48高触控区，用户可明确切回原有C档点按分页。缺少原生Grid接口时自动保留旧分页；卡牌、意图、单状态、悬停等详情继续沿原路径，不扩成本任务之外的新界面。

不改变战斗数值、状态排序来源、AI或命令。专项在打开、滚动和同详情刷新前后校验完整战斗对象图的字段与引用不变。

## 生命周期与输入边界

- 首次只刷新1项，读取真实0/1基索引，在后续update完整刷新；不在原生回调中重入刷新。底部内容变化复用已校准base，避免在不可见的单项列表等待回调。
- 刷新回调绑定详情对象、当前Run/Combat、单位对象和代际；关闭、重开、同槽替换、战斗进入奖励阶段及销毁后的迟到回调均拒绝，先检查存活再取子控件。
- 内容未变时不重建列表或重置原生滚动位置；可见项回收后按当前数据重新填写，没有脚本模拟拖动滚动。
- 模式按钮在观察到Down/Up协议后只接受匹配released令牌，绑定详情、Run、Combat、回合、actor和touch。旧面板手势、缺Up、EndDrag、重复Click及拒绝drag后重放均不切换；无Down/Up的C档点击与Controller确认/返回分别保留。
- 普通页面关闭继续使用原输入屏障，不透传为出牌或消耗资源。

## 正式构建接线

`scripts/ui-layout.mjs` 声明真正的 `kind: grid`，引用 `AbyssStatusDetailLine`。行模板加入 `build-ui` 的既有模板数组，同时进入 `game-ui-templates.json`、`abyss_ui_templates.lua` 与正式候选共用模板通路。official根白名单显式注册新模板，未知根仍拒绝。新增普通源码 `abyss_battle_info_scroll` 在架构配置中归ui，并纳入候选嵌入/独立读回测试；没有新增generated binding或绕过打包集合。

原生控件增量为详情面板上的1个Grid与1个模式热区，每个原生行实例有容器、图标、文本3个控件；运行时可见/回收实例数由原生引擎决定，本记录不将源码计数冒充官方负载或安全上限。

## 本轮验证

| 验证 | 结果 |
| --- | --- |
| `npm run build:data` / `npm run build:ui` | 通过 |
| `node --test tests/status-detail-scroll.test.mjs` | 2/2；涵盖9种状态、易伤可达、完整战斗图只读、底部更新、0/1基、延迟刷新、销毁回收、旧回调、C档与Controller |
| `node scripts/test-lua.mjs tests/lua/status_help.lua` | 原8组全部通过；单状态、悬停、长按与旧释放不回退 |
| `node --test --test-concurrency=1 tests/ui-layout.test.mjs tests/native-ui-theme.test.mjs tests/status-detail-scroll.test.mjs` | 16/16，原44触控门槛及完整行高保持 |
| `node --test --test-concurrency=1 tests/status-detail-scroll.test.mjs tests/battle-info-readability.test.mjs` | 3/3 |
| `node --test --test-concurrency=1 tests/native-candidate.test.mjs` | 23/23，新增模块随入口嵌入并读回 |
| `node scripts/build-ui.mjs build/status-scroll-official --official-assets` | official布局与模板构建通过 |
| `npm run check:architecture` | 347模块/1957边通过 |
| `npm run check:lua-static` | 固定Luacheck1.2.0，无新增诊断；14历史告警，原CC15门槛通过 |
| 修改的JS脚本 `node --check`、`git diff --check`、独立树 `verify:backlog` | 通过 |

首次相邻布局回归抓住模式热区36高不足44，以及旧“page必须最后”的叠放断言。实现改为48高独立页脚并为C分页预留其空间；合同改为明确验证page覆盖旧行、native Grid高于page、模式目标在最上方，未放宽触控门槛或删旧控件。另一真实负例发现奖励相位到来、UI未重绘时旧回调仍写入，已在首个所有权检查拒绝。

official构建首次发现未注册模板并修复。随后本树跳过LFS检出留下的两张头像PNG指针导致 `Invalid selection budget avatar96`；仅从已有integration-next工作树复制SHA256与冻结清单完全一致的两份输入到本树后构建通过，无下载、无修改原图和发布树。

本轮没有官方GIL写入/读回、导入、新ready、PC或实体手机操作，也没有完整远端CI。以上为生产Lua在原生API严格夹具上的执行、模板构建及静态证据，不能勾选混有设备要求的AC7为整条完成；AC5/6及实机部分保持未验。最终独立审查由主控另绑定本地精确提交。
