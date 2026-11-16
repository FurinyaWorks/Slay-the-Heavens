# PR694：手牌数值与已合697的实际组合

实际 Release 为 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`，原694为 `4ace45fedbce5fb0507f793bca0e7b5c8992e061`。隔离分支 `feat/goal-v2-hand-post697-1116` 正常合流形成 `d956df3e8b429ad4d4042d9489108000fb9b327b`，双父精确为原694及实际Release。7个冲突全是source/test接线，逐域保留，生产Lua没有冲突；未用ours/theirs，未带未合679/680/687/684。

原8产品输入（含原TASK-4.21/HAND文档）逐blob保留4ace/da455，手牌唯一runtime与实际Map两个GameUI runtime按各自真实Git守恒。独立历史source域仍各有352份完整输入；当前352份、116 owners，两侧所有65/65 targets合并后68项均保留，专属hand及Map共3个真实producer/parents也分别保留。

仅增加薄production/CI union，通用projector、原99份gzip及两侧active旧包不改。当前产品身份只指真实d956 checkpoint；辅助CI捕获明确`currentTreeCommitted=false`，不把后续测试快照伪称产品提交。28项当前binding按真实Git差集得到，100份archive（99旧+本片production包）；实际raw880JS/1425Lua、Release879/1423、Hand877/1425分别验证。当前→任一历史转换前每次fresh完整认证、同raw reader透传、无暖缓存；unknown/历史/binary边界和原内部Checked仅在完整validator之后使用保持。

本轮证据见[归档](../evidence/hand-post697-20261116/archive-manifest.json)，每项均无损gzip保存真实stdout/脚本/collector/audit，manifest同时记录raw及Git存储SHA/长度，避免Git自动LF改变原日志：

- 真实FS/live/current/raw五名称RED5→GREEN5，0skip。
- 首轮source/copy/union13项11PASS/2FAIL；已绿七项新union授权/production/raw不重复。两失败分别为旧added-inventory错误信息提前由完整认证报出，以及迁移时Map消费者import路径漏改；仅修这两接线并保留目标路径负控后，补验oldinventory+Map历史源/隔离copy+加强StS raw差集9/9通过。
- StS当前差集missing/null/drift直接注入真实FS，随后才进入Hand/Release历史域，原历史库存与负控保留。
- 当前顶层专属producer补显式保留后，只复验受影响完整production单项1/1。最终audit核28双域before/current真实Git/字节、100归档、352生产、全部targets/producer、复制隔离wholeproof一致及完整实际发现通过。
- 唯一generated官方Host组合1/1：战斗打开只读Map再返回、手牌八值几何和origin状态保持，106次计算返回临时表0；完整Run/RNG一致（仅排除Host真实elapsedSeconds）。不是原300帧矩阵重跑，不是设备/GC/FPS证明。

Host首试在两项冻结PNG仍为LFS pointer时未进入产品，材料化真实OID/size后同一组合通过；两个既有helper gzip也仅按原OID材料化。上述现场输入不stage。原hand证据的capture.json历史manifest记CRLF674B而Git为LF650B：旧11项Git字节精确，第12项仅LF→CRLF能恢复旧hash；本片不改旧行或旧身份，新证据全部gzip双身份。

未执行Full/check、未重新执行原数值243/缓存/重入/300帧产品矩阵；预算、未知权重、45/30分钟guard、保护不变。原Task/Owner/手机AC保持；本轮接续计划与证据在新附件，不改原8输入。无GIL、官方导入/ready、容量或设备验收。原PR远端/Ready/auto均由根协调，作者本轮不签独审PASS、不推送或授权。
