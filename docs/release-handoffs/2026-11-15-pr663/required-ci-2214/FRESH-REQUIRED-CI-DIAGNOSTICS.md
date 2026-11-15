# 2.0.0 发版：两项最新 Required 失败的窄定位

本轮只读既有 Required job，不额外启动 Full。原 workflow run 汇总仍可能显示 queued；不能据此判断无失败。已读取作业中 #679/#684/#690/#695/#696 有红，#697–699 的已读作业部分尚未红不代表整轮通过。真实 Release push 仍在既有 run 上处理，不能拿 #692 PR 绿灯代替。

## #690：先验当代完整库存，再投影历史

[Windows 9](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43762292320/job/132959834427) 实际 merge `672aadeb5c66e713e5474e5ab71f3eb35dc698d4` 同树 `acc529c1ac8fdc5f7d736ede86026241cad15d01`。在该真实 Git/LFS 输入验证现有 Release source/archive 合同通过后，复现把实际 879 JS 路径与旧 876 列表直接比较的失败。只在**真实当前严格检查之后**使用已有 prior mapper，得到历史 876 JS / 1423 Lua（真实当前 879/1424）。缺失、重复、篡改新增文件的对照均拒绝。

不能只替换成 prior mapper：单删唯一新增 Lua 会使它识别成真历史输入，必须保留当代 raw inventory 校验。[探针](pr690-inventory-probe.mjs) · [已验证日志](pr690-inventory.log)。另两条 mutate test 被其它旧源读取提前拦截，原 test 或整文件未宣称绿色。探针沿用原 Git 树上的 helpers 和两代 gzip，目录路径只是本地再现实验，不要将旧包重新上传或覆盖。

## #695：PC06 独立来源包没坏，外层未适配

新 [POSIX5](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43760647040/job/132957182176) 的 502 项有四条校准失败。精确 PC06 当前/前驱 Git 源和清单四条都正确；原外层校准直接读新版 HUD/Bootstrap，未串接 PC06 历史适配。现 PC06 对该产品路径 `project=false` 有意保留，不可把全局切换成旧源来掩盖真实；仅为旧合同投影已认证的精确 predecessor，当前实际图标和库存仍核真。外层还须续接自己的物理来源，不改冻结档案。[详情](PR695-POSIX5.md) · [四路径证据](pr695-packet-proof.json) · [作业摘录](pr695-hosted-excerpt.log)。

这两份是诊断与受控探针，而非可合并补丁。各 PR 独审/Required、正式同候选产品验证仍照旧；已由其它 Agent 处理的 #684 浅检出/历史 gesture 及 #679 可读性不重复跑。
