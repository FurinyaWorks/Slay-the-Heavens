# 固定 Host 资源压力回归

v2.1.2 沿用 TASK-100 的离线运行时基准。工作负载使用种子 `1`，每个样本启动新容器及 Lua VM，断言冷、暖 Host 初始化、游戏开局进入地图、首战、回合推进、300 帧更新、卡组打开关闭、奖励返回地图及停用。奖励路径通过设置战斗终态进入。十张手牌、手机启动成功率、真实触控延迟、真机帧时与长时间内存释放单独验证。

## 使用方法

在 Linux、cgroup v2 及可访问 Docker 守护进程的 Codex、Dot 或 GitHub Actions 宿主上运行。准备独立干净工作树，生成正式源码对应的离线 Lua 数据和 UI。默认 Fast 采集 Baseline 和 Medium 各一次。Full 采集六档各三次。

```sh
npm ci --ignore-scripts
npm run build:data
npm run build:ui
node scripts/runtime-baseline/resource-suite.mjs --mode fast
```

同样准备精确参考提交的独立工作树后，可进行同机配对。每轮交替执行顺序。`--profile` 可重复指定档位，`--samples` 可提高每档样本数量，`--output` 可指定 JSON 输出路径。

```sh
node scripts/runtime-baseline/resource-suite.mjs --mode full --baseline ../reference-worktree
```

| 档位 | CPU 核等效 | 内存上限 |
| --- | ---: | ---: |
| `baseline` | 宿主可用额度 | 宿主可用额度 |
| `cpu-only` | 0.5 | 宿主可用额度 |
| `memory-only` | 宿主可用额度 | 1 GiB |
| `light` | 2 | 4 GiB |
| `medium` | 1 | 2 GiB |
| `stress` | 0.5 | 1 GiB |

测量容器禁用网络。限制内存的档位禁用新增 swap。报告记录 Git 提交与树、工作负载和生成 Lua 散列、锁文件和依赖图散列、镜像、各样本内核配额、限流计数、CPU 用量、容器内存峰值和 OOM 事件、Node 峰值 RSS、阶段耗时和控件调用。基线的 `max` 表示容器未追加限制，仍受父宿主环境约束。

同负载配对至少三轮且每一轮阶段耗时超出可配置阈值时，报告给出观察信号，默认阈值为 20%。确定性调用计数增长也会标记。少量样本下 P95、P99 会落到最大观测值。报告保留原始样本以便检查共享宿主波动及顺序效应。

`Performance regression` 工作流与 Quality 使用同一个影响面规划器。Fast 路径采集两档，Full 路径采集六档。工作流生成 `performance-regression-<run>-<attempt>` 报告产物。耗时信号为观察项，现有 Quality 准入规则保持原样。

## 已有证据及校准

- TASK-100 已具备同种子 Host 基准和 SDK 调用观察。TASK-100.1 已沉淀控件生命周期。TASK-100.2 保留差分及 Tween 的历史 NO-GO 证据。原运行时脚本标为 opt-in，未接入 Fast 或 Full。[历史基准](../backlog-details/TASK-100.md) · [生命周期](../backlog-details/TASK-100.1.md)
- PR #666 复用 TASK-4.21、TASK-38 的实体设备验收并延期流畅模式。PR #813 的卡组调用计数来自离线 Host，低端手机输入到首屏与帧率待验。现有记录包含局部渲染和组件实验，未见可复用的 CPU 与内存限制矩阵。[PR #666](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/666) · [PR #813](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/813)
- Codex Docker 28.4.0 使用 cgroup v2。0.5 核 CPU 单变量忙循环在 16 个配额周期中被限流 16 次，无额外内存上限。96 MiB 内存单变量对照无额外 CPU 限制，触碰 128 MiB 分配时 Docker 报 `OOMKilled=true`、退出 137。组合探针读取 `50000 100000`、`1073741824`、`0`，16 个 CPU 周期全部限流。
- Codex 进程为 UID 1000，根 cgroup 归 root 且无可写委派，`systemd-run --user` 缺少用户总线。`taskset -c 0` 能改变 CPU 亲和性，单独使用只改变可调度核心集合。GitHub `ubuntu-slim` 为共享 VM 的 1 核、5 GB 容器。可重复的容器配额验证部署在 `ubuntu-24.04`，宿主低规格可另作对照。[GitHub 托管运行器规格](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- Linux CPU 配额模拟可用计算预算，内存硬上限用于观察容量压力。GPU、原生 Lua SDK、客户端网络与资源加载、DVFS 和热状态仍需同一 GIL 的官方客户端与实体手机证据。Apple Xcode Thermal Conditioner 可用于实体 iPhone 热状态对照。Android 的热状态、系统轨迹及帧时工具用于验证实体设备上的变化。[Apple 游戏分析](https://developer.apple.com/videos/play/meet-with-apple/242/) · [Android 热性能实践](https://developer.android.com/games/optimize/adpf/best-practices-adpf)
