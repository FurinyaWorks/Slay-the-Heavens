# PR694：实际 Release 合流与 R694-1 来源授权修复

状态：本地准备头，交独立复审；没有推送、改 PR、准入、正式 Full 或设备执行。

## 原切片完整保全

独立树 `F:\New folder\.worktrees\goal-v2-hand-values-final-1116`，分支 `fix/goal-v2-hand-values-final-1116`。原 #694 `12f0981ca55017ade6f7be24f50889373b7996f7` 正常合入实际 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，得到真实双父 merge `a0bcfdfb9b1bfe1934da1ba5e46f861e90af1821`。

已核 b672 为原12f祖先，且完整 `tree(b672)=tree(1cc)=b5ec29f2b7718b0d4b6564afea03144a3f14a81e`。三个冲突是 calibration、integrated helper 和 cases：逐项保留原12f在完整 b672 之上已审的 hand 来源、bootstrap历史库存及 raw当前合同；合流结果完整 `tree(a0bc)=tree(12f)=e5d17b2d7585f2e2e39daa32bb938bb1d22d8357`。没有盲选一侧或仅因 base 名称变化再造来源层。

原产品完整 `src/lua` tree 为 `e4cf256558cef39f749058c5b856a8f1e3734592`，同原 da455；包括 runtime、JS、隔离helper、三份 Lua、原 HAND 文档与原 TASK-4.21 的 **8 个原产品文件逐 blob 保持**。本轮不改这些文件，任务仍 continue、Owner/AC 不变；只新增本附件和证据。原数值243组、Host/计数2/2、cache/失败/重入及独审链保留原检查点身份，不重复未变产品矩阵，不把旧结果说成本头 fresh 产品执行。

## 实际发现并修复的边界

在已健康绑定的当前场景，Reader、公共 Source、current→prior 库存和 integrated reader/source 四项都对声明内 `abyss_battle_card_view.lua` 缺失取得真实 **RED4**。

- `mobileHandCiSource` 只末尾新增可选 raw reader，不改前三参数；只有精确 current 实际转换为不同 prior 字节前，才经同一 reader 认证完整当前 binding/archive。
- `mobileHandCiRead` 委托同口 Source；保留 null/undefined 原值、unknown、已历史和 raw production 边界，不缓存暖授权。
- `mobileHandPriorInventory` 仅 actual-current 分支增加同一完整 fresh 前置；旧 prior 与更旧历史仍保持原语义。
- `integratedSource`、`integratedRead` 仅追加/转发同一个可选 raw reader，不能以默认磁盘替代 injected reader。
- `mobileHandCiCheckedSource` 仍为显式完整 validator 的纯比较器。全仓仅一处实际调用：`assertIntegratedCurrent` 先 `assertMobileHandCiCurrent(read)`，再用相同 `read(path,'utf8')` 比较；审计逐点确认，没有将它当作公开已授权历史入口。

本片实际 owner 为 **116→116，新增[]**。两个既有 current-live 116-owner 用例直接 PASS，因此文件保持原 blob，未照搬其它切片的117-owner改动。唯一实际失败的消费者是 StS 原始库存入口：**RED1→GREEN1** 后先认证完整 raw **877 JS /1425 Lua**，再经 fresh 库存入口恢复原 **876/1423** 历史合同。完整新增路径、缺失/漂移负控和旧库存断言保留；本轮没有新测试发现入口。

## 当前绑定与本轮证据

只最小更新现有 active `mobile-hand-ci-source.json.gz`，不新增 packet 层：原13项的真实 before 保留，更新 integrated helper/cases 两项当前绑定，为实际修改的 StS 消费者追加真实 b672 before/current，最终 **14 bindings /94 archives**。当前包137900字节、SHA256 `0402b7840b6b020b3b7e015a7569bfcac8e914f3db5364526f8ec2f7028fa8db`。

原93前驱归档、第94个生产包、生产helper和复制闭包均不改。旧 active CI 包 SHA256 `5ec529b66d3a1e9411e84145080b44bf05b26305882e82890db0a5a03a0f874b` 完整留在 a0bc Git 对象；辅助快照继续明确 `currentTreeCommitted=false`，未把旧 releaseBase/b672 身份改名为实际 squash。实际1cc的准入血缘由完整树与真实合流证明接续。

Node24.18.0 本轮有界验证和原始失败均在 [证据目录](../evidence/hand-values-actual-release-20261116)：

| 验证 | 本轮实际结果 |
| --- | --- |
| 四公开历史入口 | 健康当前 corpus 下 RED4→GREEN4；Read15728ms、Source15208ms、Inventory15638ms、同raw integrated338ms。全部14声明binding/94 archive 的暖 missing/null/drift 与恢复、历史/raw/null/Buffer边界保留 |
| live owner/库存 | 原116-owner两用例直接2/2 PASS、不改；StS原raw入口RED后仅该项GREEN1943ms，raw877/1425与旧876/1423独立 |
| 最终精准来源 | 352当前生产绑定、原8文件、真实producer/parents、active before/current、94归档与唯一 Checked 调用边界读回 PASS |
| 语法与字节 | 改动模块定向 Node语法检查、diff空白检查；完整记录见归档 |

四历史入口与 StS 五个实际受影响名称一次 GREEN 为 **5/5，总49399ms**。这是本地合同成本，不是完整正式 wrapper/job 或 Hosted 速度；没有提高预算、默认成本或45/30分钟物理guard，没有降低超时、删断言、共享暖授权或重新触发 Full。

两个既有 helper gzip 仅从已有本地 LFS 对象按 OID/size 材料化供读取，输入身份保持，不进入新提交。无 GIL、官方导入/ready、容量、iPhone14Pro、GUI、master、版本、Tag 或发布；TASK-4.21 手机AC3不勾、不Done。原PR更新、独立复审与正常 Release Required/合流由协调者接续。
