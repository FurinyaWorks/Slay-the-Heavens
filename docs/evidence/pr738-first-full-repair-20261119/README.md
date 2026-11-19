# PR738 首次 Full：独立修复保全，仍非合并候选

**不更新 #738，不新建 PR，不启动重复 Full，不合并或发布。** 原历史牌输入三片仍有未关闭的同代配对问题；这不是全绿交付。

## 固定输入与失败

- [#738](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/738) HEAD `36b96baa93d07cb8a357cb793ea4e8806a5aca87`，Release BASE `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`。
- 远端 HEAD 与本地原集成提交 `94867e18e524dd15e18fb567eca57fc3e67b5cf2` 的 tree 同为 `66ce29ce698e3d1aed86f2bffeb104cd00a5e9a8`。本轮保全分支 `fix/release-full-repair-20261119`，不覆盖原指针/BGM/PR 分支。
- [首次 Quality 44439245970](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970) 的真实 checkout 为合流 `a4f910ac8a1dad0a0ed378a684e1b3bbc60e8057`。取证时 Windows 4/5/9/16/17/18 和 POSIX 4 已失败，其他分片部分仍运行；未据此宣布最终全部失败项。Licenses inventory 已成功。
- 七份原 job 日志分别保留；固定 Luacheck 已正确安装，本轮不是工具缺失。没有执行工作流输出中的命令。

## 产品修复与继承问题分开

| 原失败 | 本轮结果与边界 |
| --- | --- |
| 两条 official-assets runtime：显式帮助关闭后的尾点击未退休 swallow，后续选择异常 | 修 `abyss_battle_action_bindings.lua`：仅消费精确匹配关闭触点，不让无资格 Click 关闭新弹层或发牌。原两条断言 RED→GREEN。 |
| 药水：外来命名 Click 后的匿名 Click 误用已释放凭证 | 修 `abyss_battle_input_state.lua`：只给仍满足原端口门禁的凭证保留原 ID，匿名不提交。原分片 RED→GREEN。 |
| 独审发现本轮初稿越过 busy 匿名清除屏障 | 已拒绝初稿；新增 busy / turn / controller gate 三条完整迟到原 ID 拒绝与 fresh Down 恢复负控，先红后绿。最终重新复审，不沿用初稿通过结论。 |
| 动态敌人生命周期 fixture 缺新 `pointerBegin` 等依赖，导致同一故障在多个 job 重复出现 | fixture 实接真实 InputState 六个指针端口，保留原宽松业务 readiness、16 个注册失败位置与全部生命周期/变异断言；不改怪物内容或规则。 |
| BGM 来源测试 Windows 输入本已 CRLF，再替换 LF 生成 CRCRLF | 仅在构造合法 CRLF 对照前归一 LF。源码校验继续拒绝真正 CRCRLF；真实 CRLF reader 定向通过。 |
| HUD 旧来源测试期待 #629，实际读较新的 settings HUD | Release 基线已有，生产 HUD 未改。仅此叶复用既有精确 settings 投影；原完整文件断言及新增缺失/漂移/换行负控通过。 |
| `card-input-slices`：旧 gestures 不导出 Intent、新 binding 却使用 Intent | **基线继承，仍 BLOCKED。** 单补 binding 或 binding+view 仍破坏原 docking/hover；完整 archive 与 pr372 base 又存在模块集合不一致。原体、断言、30 秒预算与历史档均未修改。无历史 helper/runner 修复混入本候选。 |

## 来源与独审

只新增 `release-full-repair-source.json.gz` 与 `release-full-repair-ci.json.gz`，不改任何旧证明档。生产层固定两个实际修复文件，保留 352 文件全集、129 owner、86 个完整旧目标，另加远端 `36b96` 的完整第 87 个 before 目标。CI 层将本轮真实叶精确绑定到已发布 before，不以保存的历史文本冒充当前读取。

独审另发现修复独占 CI 叶未经过 freshness 判定，已修：所有实际重放叶先认证真实生产、CI/production 档及全部当前叶；文本和 Buffer 路径都不能靠损坏档或旧源码授权。新增药水安全 fixture 保持 live，不隐藏成旧测试。独审结果和精确 blob 见 `independent-review.md`。

## 验证与失败记录

本轮日志清单、公开日志摘要与解压 SHA-256 见 `logs.json`。日志只把本机临时绝对前缀替换为占位符，完整原始 SHA-256 另记；没有删失败行。

- 原 official 两条 2/2；原药水分片 3/3；新增安全 fixture 3/3；最终相关移动指针两项 2/2。初稿完整移动文件曾 13/13，但不能替代独审后的最终负控。
- 动态生命周期原四项与三种指定变异均通过；BGM 合法 LF 与真实 CRLF reader 均通过。
- HUD 原失败单项及所有新增正负控 1/1。
- 最终源码静态 Quality：351 模块、6224 测量通过；syntax、guidance、Backlog、test-strength 通过。
- 来源外层的修后两项正负控通过。两次先启动的全来源测试遭遇并行独审纠正导致真实源/档变化，按原鉴权明确失败；记录保留，不当作固定树结果。
- 独审后固定树的全部 28 项来源回归通过（506.8 秒，0 skip）；native/BGM 与动态生命周期两个原文件合计 7/7、0 skip。此为定向来源/输入回归，不是托管 Full，也未关闭另一路历史卡牌阻塞。
- 固定树联合来源文件 7/7、0 skip；全来源/原始发现、关联 owner、两侧旧包与新副本闭包负控均保持。
- 历史三片的所有失败实验保留，没有将部分通过、源码推断或改一个依赖的试验冒充完整闭包通过。

本轮未验证官方客户端、真实 ready、PC/实体手机、官方同候选容量，也未修 #703/TASK-111 的原生 reference/GetChild 启动问题。该线仍由原 owner 承接，不能把本分支或 Host 结果当作启动/发布放行。
