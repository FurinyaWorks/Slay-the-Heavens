# #706 Defect 2 GiB 局部修复，Formation 仍阻塞

准备基线 9035ef7803eb7f33cf7b9208025bac47b1807551（原 PR dc74ab23 的独立诊断后继），未合流当前 Release af77fb，不移动原 PR。

只让 DefectFinal builder 使用已经存在的深冻结 proof 复用入口，避免整份历史 JSON 再复制；copy 闭包先认证原808800…，再绑定最终4433f8…。没有改 shared runtime、生产功能、测试、断言、归档、Full、预算、超时。正常 predecessor 来自现有冻结 projector。独审发现初版递归冻结会影响synthetic mutable caller，最终改为只冻结新容器：mutable根保持原clone，浅冻结伪造根由runtime完整深冻结验证拒绝且不修改其子图。每次 owner fresh read 不变。

## 实测

云 Linux Node v24.19.0，显式 --max-old-space-size=2048。与此前9035ef诊断原案例2次OOM对照，不使用本机更大的默认堆。

- 首次单点修改被旧 authenticated copy identity 正确拦截；保留失败日志，不算产品回归。
- 加精确copy接续后，原 isolated Defect 案例1/1 PASS，19.845秒，完整proof deepEqual、历史投影、漂移拒绝均原样。
- 初版原 Defect 完整文件13/13 PASS，25.050秒，0 skipped，所有原正负控保留。
- 原 Formation完整文件仍OOM，22.824秒；20ms整个进程树RSS峰值2,502,856,704 B。
- 试验额外给Formation同型freeze并接copy仍OOM，23.067秒，RSS峰值2,618,540,032 B。无充分收益，已撤掉该额外修改，最终只保留Defect两文件修复。两次是不同源码，不作性能A/B结论。

RSS采样沿用基线measure-tree.py.txt；包含runner/子进程，共享页可能重复计数，不等于old-space实际存活量。只使用sampledTreeRssBytes和wallSeconds；其他rusage可能包含继承累计，不作比较。未重复Full。

最终修正版原 Defect 完整13/13 PASS，0 skipped，TAP22.934秒、测量墙钟23.009秒；整个进程树RSS峰值2,538,315,776 B（不是old-space预算）。mutable predecessor 三项独立负控PASS。最终Formation未重新运行，不把初版Formation失败精确归于最终字节，但其阻塞没有修复证据。

## 独审与剩余

独立审查 /root/release1615/review706 静态检查最小两文件、旧copy前驱、所有者认证、深冻结与fresh reader语义；未重复重测试，diff --check通过。精确独审见review.md。

本交付仅解决现有Defect文件在2GiB下的OOM。Formation、当前Release来源/CI合同接续、托管CI、设备/官方容量均未通过或未验；不是合并/发版许可。缺Backlog CLI，未修改任务或假称认领。沿既有#706交接，不另建重复PR。
