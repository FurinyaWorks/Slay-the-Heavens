# CI 按影响选测

TASK-81。快速反馈、完整受影响回归、集成验收分层报告；性能验收仍须真实当前版本的样本，不沿用旧 PR 或取消运行的资格。

当前 v2.0.0 在 develop 重建，旧 `release/v2.0.0` 冻结。下文 Release 门禁适用于后续批准的发布分支。见 [重建交接](versions/V2-RELEASE-HANDOFF.md)。

普通 develop PR 使用完整受影响集合。Windows和POSIX均执行选中的完整JS文件和Lua夹具，保留原断言、子进程预算及失败语义。`exceedsFastTarget` 报告超过180秒反馈目标。对于任一平台，若仅已测文件的串行估算在扣除最长一项之后仍超过该平台 Fast 作业现有上限（Windows 45分钟、POSIX 30分钟），本轮直接使用既有 Full 分片。计划记录原选集数量、估算和分流原因。其余已证明选集继续完整执行 Fast，包括只有单项较慢或缺少计时的选集。只有明确列出的纯文字文件可免业务回归，仍执行治理、许可和presentation门禁。

develop 按 `config/architecture.json` 分类，核心模块仍保守 Full。`release/*` 日常修复（含核心 Lua）默认使用已证明完整的受影响 Fast；未知范围、数据/配置/依赖/工作流与 CI 准入基础设施仍保守 Full，显式 `ci:full` 仍有效。Release 合入后的 push 不再触发 Quality，PR 的双平台回归、治理、presentation 和 inventory 必须通过才可 Auto-merge；Release 不使用 Merge Queue。develop/master push、develop 队列组合及手动 Quality 仍 Full，现有矩阵、断言和失败阻断保留。

Release 完成集成后才冻结准确 HEAD，由人显式执行 `node scripts/release-ci.mjs freeze <本轮批准的发布分支> <40位HEAD>` 请求一次现有 hosted Full；该命令不等待、不发布。完成后执行同入口 `verify <本轮批准的发布分支> <同一HEAD>`，核对最新手动运行、实际完整分片和最新执行结果，并再次读取分支与 attempt；Fast、local-special、失败、取消、漏片或 SHA 变化均不能放行。Release→master PR 的现有 impact 作业强制执行此校验，缺证据直接失败。代码变化须重新冻结验收，不自动批量重跑 Full。提测、打回和重新冻结按[候选版本流程](#候选提测与打回重测)执行。

草稿 PR 的正式 Quality 延后到 Ready；Fork 预检沿现有 Quick feedback 手动运行，不再为 Draft 或 Ready PR 重复触发 Quick。转回 Draft 会通过原 concurrency 取消过时 Quality，不额外建立调度器。草稿跳过不构成准入证据：Ready、精确 HEAD/BASE/attempt、双平台成功及独审仍须满足。Merge Queue、push、发布和手动验证不受草稿条件影响。

Required Checks保留check、engineering-posix、presentation、inventory及independent-review。TASK-81.2将额外PR准入改为Actions来源的`pr-quality`：安全PR须双平台Fast、实际不可变checkout/完整选测计划收据及当前独审；高风险仍须PR Full。`full-quality`保留原义，Fast永不发布Full成功。Ruleset切换必须等实现经原门禁合入后读回，源码合入本身不代表远端配置已生效。

原生Merge Queue对真实组合SHA强制原完整Full，同时发布`pr-quality`、`full-quality`和队列准入状态，全部必要检查通过才squash；develop push继续Full。失败、取消、漏片、旧HEAD/BASE/run/attempt、过期artifact及规则指纹漂移均拒绝。Fast不支持借用旧attempt的收据。`merge:auto`仅在原生队列已受保护时接受Fast，仍使用pending独审握手、精确HEAD及暂停读回。schema6授权和schema7 Fast证据与原schema3/4 Full证据分开；合后另外核验schema8真实队列Full、inventory及独立push Full。纯文字白名单也必须经过双平台治理和独审。

Quick feedback 仅手动运行，作为 Fork 完整受影响预检；操作见 [Fork 预检](CI-PREFLIGHT.md)。原本地 advisory CLI 保留裁剪语义，它是 advisory，不进入 Required Checks。`npm run test:fast -- --base <commit>` 与 `--ci-fast` 共用选集：纯 JS 和按测量权重在 90 秒估算内安排的完整 Lua 夹具，优先直接修改的夹具；执行时先跑选中的直接修改 Lua，再跑 JS，最后跑其余 Lua，任一步失败立即停止，不重复夹具。估算不是超时，不更改夹具原断言和期限。`--plan` 的 `feedback` 可查看两入口的实际选集。`test:related` 仍运行完整受影响集合，未知输入回退 `check`。

fast/advisory 对未知输入只提供可独立映射部分的反馈，并明确要求完整 Quality；零测试显示未执行及非回归验收，不启动重复全量，也不声明覆盖。集成 JS 和未排入的 Lua 由完整 Quality 兜底。PR 使用精确 merge SHA 和事件 base SHA，在隔离托管 runner 上运行，只读权限且不持久化凭据；新提交取消同 PR 的旧 advisory。Node 固定 24.18.0。Full路径当前实测主耗时为测试本身，不能为了初始化优化破坏完整测试依赖。

混合未知输入的 advisory 在一次图分析中求全部静态映射，不按每个变更文件重复解析全库；未映射输入不会触发额外动态扩集。只复用本次调用的内存闭包，不缓存跨调用源码或报告。CLI 的 `planDurationMs` 和 plan/build/tests 阶段耗时用于区分规划、初始化与真实执行，失败也保留阶段耗时。

基准：真实GitHub run40708754842，SHA53fa164a，创建14:43:27至完成15:04:40 UTC，21分13秒（含排队）。原始jobs和ruleset保存在docs/evidence/ci-fast/。

验收口径：按固定工作流版本采集自然PR运行，分别报告Fast/Full样本数、SHA、attempt、结论、创建到最后Required Check完成的耗时，以及各job排队/执行时间。P50/P90用nearest-rank；失败和取消单列，不从样本中静默删除，不用重跑历史SHA刷样本。Fast至少20个真实PR样本且覆盖源码、测试和纯文档后判断P50≤300秒、P90≤600秒；未达样本量只报告观测值，不宣布总体达标。M7本轮只验真实安全Fast入队和Full组合/合后阻断链路，不把Full总耗时≤1800秒作为收口目标，也不为此追加调优；Full 作业与所有子进程预算、完整回归和门禁保持。

美术输入分两组：原六张审阅 PNG 仍仅由审阅测试/许可审计准备，预算 5983528 字节；运行时只准备固定三张卡牌预览和一张背景预览，独立上限 181870 字节。JS 测试会通过辅助模块/子进程开启美术，因此 Full 分片与 Fast 对非空 JS 集合保守准备这四项；纯文字、空集合、仅 Lua 和默认关闭美术的 presentation 构建不新增下载。两组共用本地 LFS 对象缓存，重叠三张预览不重复传输；读取前核对索引指针，读取后核对 PNG、长度及 SHA。这里的字节数是逻辑输入上限，不是实际计费读数。

## 候选提测与打回重测

工程版本 `1.2.0` 的首轮提测用 `v1.2.0-rc.1`，再次提测依次用 `v1.2.0-rc.2`、`v1.2.0-rc.3`。`rc.N` 从 1 起按整数递增，无前导零。候选记录或 Tag 注释可附 SemVer 构建元数据，例如 `v1.2.0-rc.2+build.42`。`+build.42` 不参与优先级比较，Git ref 统一为 `v1.2.0-rc.2`，每轮只有一个序号和一个候选。`package.json`、lockfile、Release Please manifest 及玩家文案使用计划中的稳定版号。

1. **开发与版本协调者冻结提测。** 常规发布从已通过准入的 `develop` 切出 `release/v1.2.0`。紧急线上修复从 `master` 切出下一个 PATCH 的 `hotfix/vX.Y.Z`，沿用同一提测规则和现有 Hotfix 门禁。版本协调者记录主仓发布分支的完整 40 位 HEAD SHA，执行 `node scripts/release-ci.mjs freeze "$branch" "$source"`。同一 SHA 的 Full 和 Licenses 通过后，从 [GIL build 构建摘要](GIL-CANDIDATE.md)取得正式有声工件的链接、数字 ID 和 SHA-256。按[发布操作单](PUBLISHING.md)为该工件执行正式性能。向测试交付前，读回分支 HEAD、工作流和构建回执，核对实际 `.gil` 的 SHA-256 与批准的发布配置。
2. **版本协调者登记并打注释 Tag。** 在已有版本规划或验收任务登记 Tag、分支、源码 SHA、Full run/attempt、候选构建归档和回执、GIL SHA-256、buildId、配置标识及摘要（如美术、UI、启用范围），附修复 PR、上一轮 RC 和证据入口。Tag 注释保存源码、GIL、配置及候选记录的定位信息。只向主仓 `origin` 推该 Tag。内部 RC 的成果与状态登记在原任务，GitHub Release 用于正式版本归档。需要长期追溯的候选在 Actions 工件过期前保存获准留存的副本和回执。
3. **测试签收同一候选，记录通过或打回。** 独立测试验收人读回 Tag 指向的提交，下载已登记的有声 GIL，校验实际文件摘要（`sha256sum <文件>` 或 PowerShell `Get-FileHash <文件> -Algorithm SHA256`）、buildId 和配置。使用这个候选完成缺陷复测、受影响回归及正式所需的 Simulator、PC、实体手机、官方导入与启动、容量/负载等验收。把结果、设备/客户端、日志和报告链接记在该 RC 名下。打回时保留复现步骤、预期与实际、严重性和阻塞项，保留原 Tag、工件与证据。已打回的 RC 不得晋级。尚未判定失败的候选仅因测试中断而补测时，沿用原 RC 和同一工件，核对新证据仍满足当前门禁。
4. **开发修复后重新提测。** 只把阻断发布的必要修复经受保护 PR 合入同一 `release/v1.2.0`（紧急修复沿用该 Hotfix 分支），先按受影响验证规则做 Fast 等必要检查。新增功能继续在 `develop` 集成。合入后读取新 HEAD，重新冻结并验证本轮产物，按下一序号创建注释 Tag。即使源码 SHA 相同，替换 GIL（包括同提交重打包导致摘要改变）、构建身份或发布配置也要开新 RC，并用新工件重验，不能沿用上轮的通过结论。
5. **通过后晋级并回流。** 版本协调者核对已通过的 RC、当前冻结 HEAD 和正式发布门禁，确认最终 GIL、配置与 SHA-256 都与通过记录相同。用同仓 `release/*` 或 `hotfix/*` → `master` 发布 PR 走现有检查。正式版本显示为 `v1.2.0`，唯一正式 Tag 为 `engine-v1.2.0`。创建后核对它与获准 RC 解引用到同一个构建提交。按[版本提案、候选与平台确认](PUBLISHING.md#版本提案候选与平台确认)，在 Owner 官方发布并取得回执后，用原工件归档一条 GitHub Release 并复核附件。正式元数据只接受 `engine-vX.Y.Z`，新正式版本不加 `vX.Y.Z` 兼容别名。以后若需别名，先统一发布及校验约定，仍只保留一条正式 Release。发布分支合入 `master` 后，按[分支收口规则](BRANCH_LIFECYCLE.md#自动化范围与执行)把修复和生产历史回流 `develop`，核对线上修复确实继承并保留回流证据。

### 注释 Tag 的创建与读回

先查询主仓 `git ls-remote --tags --refs origin 'refs/tags/v1.2.0-rc.*'`，结合版本记录取最大已占用序号加一。将已核对的发布分支、冻结 SHA、候选 Tag 填入以下示例，用 `candidate-note.txt` 保存本轮注释。`origin` 须指向 `FurinyaWorks/Slay-the-Heavens`。

```sh
set -eu
branch=release/v1.2.0
source='<构建回执中的完整冻结源码 SHA>'
tag=v1.2.0-rc.1
ref="refs/tags/$tag"

git fetch --no-tags origin "refs/heads/$branch"
test "$(git rev-parse 'FETCH_HEAD^{commit}')" = "$source"
remote_tag=$(git ls-remote --refs origin "$ref")
if [ -z "$remote_tag" ]; then
  git tag -a "$tag" "$source" -F candidate-note.txt
  git push --no-follow-tags origin "$ref:$ref"
fi
git fetch --no-tags origin "$ref"
test "$(git cat-file -t FETCH_HEAD)" = tag
test "$(git cat-file -p FETCH_HEAD | sed -n '2p')" = 'type commit'
test "$(git rev-parse 'FETCH_HEAD^{commit}')" = "$source"
git cat-file -p FETCH_HEAD
```

读回注释并核对 GIL、配置及候选记录。重复执行时，已有 Tag 只有在提交和整套候选身份一致时才复用。若此前仅创建了本地 Tag，先逐项核对本地对象再推送这个 ref。遇到并发拒绝，重新查询远端和候选记录。另一候选已占用该序号时保留其记录。标签写错或类型不符时，在原记录标记该 RC 无效。为本轮候选重新核对身份后，使用下一可用序号。所有已推送的 RC、正式 Tag 和历史 Tag 均保留原对象，禁止强推、移动、删除或重打。

正式 Tag 使用相同的 `git tag -a` 和单 ref 推送，`source` 取已获准 RC 的构建提交，注释引用该 RC 及验收记录。例如以 `v1.2.0-rc.3` 晋级时，运行 `git ls-remote --tags origin 'refs/tags/v1.2.0-rc.3^{}' 'refs/tags/engine-v1.2.0^{}'`，两条解引用 SHA 必须都等于回执的 `source`。正式 Tag 已存在时同样复核注释及 GitHub Release 的产物摘要与记录，匹配才复用。指向或身份不符时停止晋级，由 Owner 对账。
