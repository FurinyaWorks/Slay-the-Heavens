# PC13：现有加载修复的限定离线路径核验

本附件只补证既有PR684，不新增产品代码、delay、任务或PR。完整逐字稿/时间码由intake与PR676源blob核验；没有访问私人图像。

可控初始化后通过真实GameUI命令自然末击，normal/fast各自逐帧采样：旧Release时序等价树03beb在死亡前和reward挂载帧各有一个单帧全幕脉冲，4次开关；PR684产品等价8a44/冻结5bd同路径没有全幕脉冲。728连续帧中，reward可见均在notbusy且全部dying清空后，actor逻辑退场先于reward。独立复核为[PASS_SCOPED_EVIDENCE](independent-review.json)，没有额外时序bug或新增delay依据。

`pc13-independent-evidence.json.gz`保存12份原始文件的base64字节、逐件SHA256与大小，包括真实初次harness错误、两份最终trace、作者intake及独审初/末报告；[保存收据](pc13-independent-evidence-receipt.json)只证明无损归档，不是重跑。零cover是两日志比较oracle，不是trace本身assert0，不能泛称产品测试先RED后GREEN。

platform presentationReady固定为true，战斗是可控初始化，native控件/alpha/visible为mock。历史隔离generated目录随机后缀与Theme/Layout/Templates字节未保存，无法补取过去SHA；现读入口/Node/Fengari身份明确标current-readback，不能冒充运行前后身份采样。未显式采集的TMP/TEMP也保持unknown。实际入口、cwd、stdin、加载顺序与已知源blob在intake补记，不能因此升级为独立重放或官方ready。

PC13和TASK-16.1仍In Progress：多敌、多段、死亡触发/连锁、领奖与返回地图、原版节奏对照、同正式候选视频/action/ready、PC和受影响手机、官方容量仍未验。没有新GIL或发布许可。
