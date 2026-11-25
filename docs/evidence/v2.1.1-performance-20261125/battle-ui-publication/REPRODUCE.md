# 复现战斗页离线对照

以 README 的 BASE 和实测代码 SHA 为独立 worktree，使用同一 Node、TexLua 和锁文件。两个目录都应完成依赖安装、默认 Lua 构建及精绘 Profile 构建。精绘 Profile 使用原[运行时复现合同](../runtime/RUNTIME-PROFILE.md)里的 `--official-assets --native-page-lifecycle --refined-release-monsters` 与 `bind-fixtures.mjs`。从 Git LFS 核验并取回头像构建输入。

归档的 `release-host` 包含原始四臂测量。每个阶段 `PHASE` 记录进程 CPU、墙钟、更新数、最慢更新 CPU。`TRACE` 和 `METHOD` 记录累计计数。`release-host` 中额外的 `METHOD_BEGIN` 可直接按阶段相减，含 RNG 快照。诊断档案含早期候选的 `final-cpu-repeat` 与 `deliver-AA`，两个 BASE 标签加载同一树作为 A/A。`final-gc` 与 `deliver-GC` 在同名阶段计时前执行一次完整 GC，所有对照臂使用同一预处理并保留自动 GC。

在 BASE 目录运行归档中的 `run-runtime-profile.py`。将当前候选的粒子视图复制到粒子覆盖目录，将本切片其余三个投影与导航文件复制到隐藏页覆盖目录。归档内的 `release-overlays` 保存当轮文件及目录结构。其余文件继续读 BASE。示例参数中的 `../probe` 对应归档内带脚本及 `runtime-probe.lua` 的目录。

```sh
python ../probe/run-runtime-profile.py --out ../result --rounds 6 --modes bare trace \
  --observer scripts/runtime-baseline/observer.lua \
  --arm base:. --arm particle:.:../particle --arm hidden:.:../hidden --arm combined:.:../candidate/src/lua
```

在候选目录复用仓库现有 Docker suite。该运行固定种子 1 和默认生成 UI，每个样本使用独立无网络容器，六档各三对，记录实际 cgroup CPU/内存/swap、限流次数、RSS、分阶段时间及替身调用。旧 Grid 与精绘浏览器的计时口径分别保留。

```sh
npm ci --ignore-scripts
npm run build:data
npm run build:ui
node scripts/runtime-baseline/resource-suite.mjs --mode full --samples 3 --baseline ../base --output ../resource-pressure.json
```

选角后的补充压力复跑从 `post-toggle.tar.xz` 提取 `release-toggle`。两个独立 worktree 分别命名为 `aa` 与 `release-proof`，与 `release-toggle` 同层并完成默认构建。运行 `python release-toggle/run.py`。该脚本在锁定镜像上依次执行六个无网络容器，保留阶段进程 CPU、墙钟及全部阶段计数。
