# #706 两个完整合同文件补充验证

源码候选：32174844e7d679d68bca48e06851aa89f2178c5f。沿原准备分支接续，不改变原 PR HEAD dc74ab236c3df11a3e4cc394356c9b6e53e1b0ae。

本次仅补验证证据，无源码、断言、CI、堆默认值或超时修改。8 个修复源码/配置文件的 Git blob SHA 逐一与远端候选一致。Node v24.22.1，云 Linux；两个命令依次串行执行，NODE_OPTIONS 为空：

```sh
node --max-old-space-size=4096 --test --test-concurrency=1 tests/defect-final-source-epoch.test.mjs
node --max-old-space-size=4096 --test --test-concurrency=1 tests/encounter-formation-source-epoch.test.mjs
```

- Defect 完整文件 13/13 PASS，25.984s，fail/skip/cancel 均0。
- Formation 完整文件 15/15 PASS，78.992s，fail/skip/cancel 均0。
- Formation 的 spawnSync 独立 helper 子进程不继承父命令的堆参数，仍以默认堆运行；该用例实际通过（10.954s）。未改变原30秒超时。

## 独立评审

review_heap706 只读核查两文件 diff 和完整日志，没有重跑完整测试。修复仅新增精确 particle owner、116→117和相应名称，无 skip/only、无断言移除。旧失败日志保留，确为约2032MiB达到堆上限。新增日志均显示完整文件通过。独立复制/模块导入可能增加内存负担，但未做堆profile，不能宣称已精确定位泄漏或具体对象。

结论：显式4GiB父测试进程完成了此前受本地默认堆限制的验证，未证明默认2GiB稳定通过；不据此修改托管CI资源配置。旧报告的OOM记录继续有效。此次未运行全仓Full，未声称Hosted、Windows、官方导入/ready、PC/手机体验或发版准入通过。原PR/自动合并状态未改。
