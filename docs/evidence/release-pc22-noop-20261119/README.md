# PC22 无变化历史投影保留原字节

## 范围与结果

基于父线程指定远端 `6d267ca80abd80efb334f8f7581111166174de2d` 的独立修复。代码提交 `79859e546ea50ab637938937dfda83bc62ba8120`，tree `5fffb2b3a0440dbec5265e760a877a1147f4d883`；未修改共享修复分支或 #738。

[#738 Windows 2 作业](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911542)的 PC22 live-bytes 断言真实失败。沿 [#728 的诊断](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/728#issuecomment-6995304300)准确复现两个输入：`release-pc22-basic-feedback-source.mjs` 与 `card_flow_contact_continuity.lua`。原 helper 已认证 LF/CRLF 等价，却将内容没有变化的输入替换成归档 LF；这与 fatal-BGM 测试合成双 CR 的问题不同。

核心修改只在 `integrationCiSource` 既有完整 hash、路径、类型和非法双 CR 检查之后，若所选历史文本与当前规范化内容相同就返回当前输入。**不把输出整体归一化，不将真实历史投影换回当前源码。** 因上层完整来源合同绑定了 helper 和测试，沿既有 CI continuation 追加这两个输入的完整 before、Git blob 和 after hash；旧 gz、旧 hash、生产源码、发现库存与执行预算全部不变。

## 验证

- 原版 LF 用例：1/1 PASS。16 入口探针（两文件 × LF/CRLF × 底层/direct/text/Buffer）修前 8 PASS / 8 FAIL，修后 16/16 PASS。
- 原 PC22 用例和三项新增回归：4/4 PASS。覆盖 Buffer 对象身份、直接 Buffer 原样返回、真实旧版本文本、缺失/漂移/旧版本及归档污染、暖读后再次校验；非匹配或非法双 CR 字节仍透传给既有拒绝门禁。
- 真实 Git `core.autocrlf=true` 独立检出同一代码提交：两个目标实际分别 37/115 个 CRLF，未改其属性；同四项 4/4 PASS。这里是 Linux 上的真实 CRLF checkout，**不是托管 Windows 复跑**。
- 相邻 `release-card-contact-integration.test.mjs` 首次为 6 PASS / 1 FAIL：五项完整源码/owner/库存/跨输入与归档负控和 default geometry 均通过；official geometry 因稀疏树缺原美术许可证未执行成功。补齐原跟踪文件并按 Git LFS oid/size 水合两个原 PNG 后，**只重跑该失败项，1/1 PASS**，不将此写成单轮 7/7。
- 独立 reviewer `/root/advance_ci_one/diagnose738_sources`：精确代码 HEAD/tree 复审 PASS，unresolved=[]；独立核对新证据的两份完整 before/Git blob/current hash，新增选测 3/3 PASS，无 skip。原始结果见 `independent-targeted.log.gz`。
- `check:guidance`、`verify:backlog`、`git diff --check` PASS。Backlog CLI 不在本机，未手改或伪称认领任务。

## 可复现入口与记录

仓库根运行：

```sh
node docs/evidence/release-pc22-noop-20261119/reproduce.mjs
node --test --test-name-pattern='PC22 authenticated no-op|PC22 real historical|PC22 no-op repair|PC22 inputs without' tests/native-candidate-preview-mask.test.mjs
```

`manifest.json` 固定代码身份、reviewer、日志字节数和 SHA256。本机日志仅将私有工作区前缀替换为 `<repo>/`；失败类型、相对路径、顺序及中间结果保留，未脱敏原件另存。所有中间失败保留：首次稀疏缺 experiments、LFS 未水合，随后修复中抄录新 witness digest 的笔误，以及负控把 anchor 本身的非匹配输入错误要求为抛错。后者已改为在未变化的真实回放入口检查关联输入，并单独验证每个新 CI leaf 的归档拒绝；没有放宽生产或来源断言。`windows2-original.log.gz` 保存连接器返回的完整 UTF-8 decoded job log，含原 CRLF，未作上述本机前缀替换。

本次只做局部 CI 修复。未启动 Full、workflow dispatch、托管重跑、合并或发版，未触碰用户 GUI。官方客户端、设备、容量、正式候选与全部当前 Hosted CI 仍未验；这些离线结果不作为 RC 放行。
