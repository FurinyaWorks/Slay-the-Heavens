# PC22 Source 与 CI 独立接续

从冻结产品 `1b272ab7f57f2a8bde67fe8796d3a894445ae052` 独立接续，Release before 固定 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。只推进既有 `abyss_card_flow.lua` 的一行产品变更绑定，不改两个产品blob。352源码路径、旧116个owner及64个历史目标全部保留；CardFlow此前不在变更owner并集中，真实新union为117，目标65，未强制保116。生产producer精确为1b272、parent36b9。

当前raw Full库存877 JS /1424顶层Lua，新增一个Source父JS和已冻结的 `card_flow_contact_continuity.lua`，rawLua元数据明确归唯一CardFlow owner。原92份档案逐项保全：90份Git物理gzip相同、2份LFS按原oid/size与真实payload哈希匹配；新生产packet独立固定。CI packet绑定15个来源；三个bootstrap workflow before取c240，当前workflow不改，未重复#692修复。

固定Node24有界结果：Source6/6、原owner/copy44/44、原及当前raw2/2、历史seam4/4、integrated-CI2/2。原新增Lua导致的完整发现失败全文保存于 `raw-before.log.gz`，保留原receipt断言后由独立raw合同覆盖所有当前库存。117owner每次fresh读取及改/缺/Buffer/异常负控，新helper/packet隔离副本warm后改/删负控均通过。原始日志摘要与SHA256见 `source-validation.json`。

当前预测Windows1,756,907ms、POSIX1,190,295ms仅作诊断；未知JS仍10s。硬执行限值45/30、可信local75分钟及原调度/超时/功能断言均不改，缺失/重复/step-only/wrong-job/路由负控继续有效。没有重跑产品、Host、Fast、Full或官方客户端，没有npm、安装或桌面操作。Source通过不代表PC22实机或发布验收；共享#692及未来组合仍由root按实际基线接续。
