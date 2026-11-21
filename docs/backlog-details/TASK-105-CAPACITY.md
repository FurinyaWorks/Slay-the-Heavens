# TASK-105：角色容量与长期量产准入

本任务是20MB官方存储下角色与章节的长期扩展性验证。近期发行与单角色隔离试验可继续；TASK-97批量生产仍须本任务取得真实GO。官方容量、同候选PC与实体手机均为 **UNVERIFIED**，六项AC保持未完成。

`TASK-105.md` 是历史编号碰撞留下的[璃月转场附件](TASK-105.md)，其当前任务为TASK-108。本文件提供容量任务的准确入口，保留旧附件与转场证据原文。

## 已有成果与本轮接续

- 原工作树 `F:/New folder/.worktrees/task-105-offline`、基线`903bf2a31e91f10fb24763ab4cea23d586d0bb83`，已有未提交离线实验、39份原始证据和B0静态候选审计；原PR641工作树已通过Backlog CLI认领In Progress。本轮是接续与对账，不是重新立项。
- [原研究报告](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/research/TASK-105-OFFLINE-20261113.md)按原字节保留。报告中的旧相对证据链接对应原树；[逐文件身份及恢复位置](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/evidence/capacity-105-replay-20261115/legacy-source.json)保存39文件hash，不重复把34.57MB生成证据加入Git。
- [重放入口](../../experiments/capacity-105/run.mjs)继续复用正式buildLuaData/buildUI、packageInventory、candidateScriptFiles与verifyPlatformRelease。只在独占生成目录进行合成数据/美术压力装配，不注册可玩角色、不生成或导入本轮GIL、不改正式皮肤/开放配置。
- [本轮验证与结果](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/evidence/capacity-105-replay-20261115/README.md)。旧与新测量属于不同源码，不能直接把数字变化称作容量优化。
- `2026-11-15` 在 `origin/develop@c2409ad7` 的[最小集成交接](../evidence/capacity-105-integration-20261115/README.md)：仅接续三个离线脚本及证据，定向验证合同并保全历史 g，不重跑历史矩阵、不产生当前容量数字。恢复大档只在本地忽略目录，清理工作树前须先转存；三张来源 LFS 还原文件没有修改。

## 重放

在独立工作树根目录，按锁文件准备依赖与现有Python/Pillow后：

```powershell
node experiments/capacity-105/replay.test.mjs
node experiments/capacity-105/run.mjs --out build/capacity-105/<新的运行名称>
```

输出目录必须是`build/capacity-105`下全新目录。已有目录、源码/历史证据目录与链接父目录拒绝。历史候选的本地交付副本可用`--delivery-copy <path>`显式提供；未提供时记录未核对，不猜测机器路径。

结果包含生产构建器的完整输入并集及实验脚本、源码HEAD与输入摘要、明确profile参数、三种装配清单、28档0/1/2/10/20/30/100新增角色数据、逐档压缩原始模块及hash、回读核验与耗时。运行前后输入不同即拒绝，不产生成功结果；源脏状态如实记录。压缩字节只用于证据保存，不是平台编码或官方MB。

## 尚未取得

原报告的B0 sourceDirty=true、旧构建ID与静态读回不等于当前正式RC。仍需冻结干净当前B0，取得官方20MB/3MB面板身份；同一基线B1/B2分离玩法、独特肖像、待机与共享UI边际，补真实章节/规模点和手机加载、切换、释放证据。重复一份角色图稿的可压缩压力档不证明未来30套独特美术可行。

保持16MB内部预警、20MB/3MB硬限及现有平台验收入口；没有用GIL、Lua、gzip或网络字节替代官方读数。本轮不提供长期容量GO，不启用TASK-97量产，不影响当前发布候选。
