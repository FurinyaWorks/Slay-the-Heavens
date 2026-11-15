# 2.0.0 发版阻塞交接：PR #663
本分支是发布交接记录，不是发版分支，不提合并 PR。补丁由正在处理 #663 的执行者按实际状态接续；不要把此文档目录合进主干。

适用范围：PR HEAD `d3783cd17be21dedcffd22f391cecc6455ce9a50`、base `e65d9b98fbec69442047650254238cd9244df805`。任何一边变更，先由原执行者核对差异；不强推，不从这个包自动合并或发版。

[红灯：Windows 18/18](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43665762352/job/132664887560) 的唯一失败是源码身份验证子进程 30 秒超时。补丁只改测试辅助代码与回归，保持 30 秒、逐条摘要比较、旧见证、真实 owner 读及完整 CI 门槛。没有游戏源码变更，不能当作候选包或实机通过。

## 原执行者：在干净、权限正常的现有 #663 工作树执行
先核对 HEAD/BASE，确保已取到库中登记的 LFS 对象。从 git show 核对 pointer 的 OID，再核验工作树实际文件，不要用 132 字节 pointer 生成见证（实测生成器接受了 pointer 并输出错误闭包摘要，取回实物才复现正确见证）。
- `tests/helpers/release-source-epoch.json.gz`：SHA-256 `5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780`，2,587,324 字节。
- 其余已迁 LFS 对象按当前仓库流程正常读回。已有对象不重下。
- 补丁 `pr663-source-only.patch` SHA-256 `f3d5630d1c073ad60c878e30df64176fa19c7d9536ee18e2ed01ee11bfce0063`。

可先用本目录的只读预检核对两个已迁移的源码见证对象。将脚本置于目标工作树外，再在干净的 #663 工作树中运行 `node /path/to/check-witness-inputs.mjs .`。它验证 HEAD 中两条 LFS 指针及实际文件字节，不下载、不写入，也不代替完整 HEAD/BASE 审查。实测 pointer、同长度篡改、文件软链和指针变更均拒绝，完整对象通过。

```sh
git apply --check /path/to/pr663-source-only.patch
git apply --index /path/to/pr663-source-only.patch
node tests/helpers/generate-integrated-ci-source.mjs --write
node tests/helpers/generate-integrated-ci-source.mjs --check
git add tests/helpers/integrated-ci-source.json.gz tests/helpers/integrated-ci-binding.mjs
# 使用本仓库已安装的锁定依赖；干净工作树先生成测试输入。
npm run build:data
npm run build:ui
node scripts/map-ui-layout.mjs
node --test tests/epoch-binding-cache.test.mjs tests/integration-source-epoch.test.mjs tests/session-menu-navigation.test.mjs
```

补丁四个文本文件；两份生成物只在有权的原仓库本地生成和按仓库流程审查，本包未附任何压缩见证、原始素材或许可清单。仅在已审核的 6 文件变更无额外内容且定向测试通过时，由原执行者提交；对新 HEAD/BASE 签署独立评审、用 `npm run merge:auto` 接回完整门禁。相同旧提交不重跑。排队及 Full 均不能跳过；合后按原授权收据 `verify:delivery --merged`。

## 版本准备

附备选 `version-2.0.0-minimal-on-663.patch`，仅对现有 #663 的旧格式有效，修改 4 个文件的版本字段和待核对玩家文案；现有解析器以真实发布模式接受该格式，无需为此等待 #665 的 1.2.0 分支。若 #665 先合入，不能硬套此补丁。必须等实际落地内容和版本冻结后重新核对、生成见证与构建；这是发版准备，不是供直接粘贴上线的最终公告。

## 发版不等于代码合并
冻结真正 2.0.0 的源码、版本说明和关卡字节；本地副本的 candidate.gil / candidate.json / startup-evidence.json 及同版官方负载证据须互相绑定。旧 311c4c96 成功不代表新包。预先用同一候选验证官方导入与 ready、PC 开局/退出/恢复及手机的设置、退出、选技能牌和奖励边界；关卡 ≤20 MB / 服务器 ≤3 MB 及同候选动态证据按原门禁。本人在官方客户端确认发布并保留凭证，不把旧测试包或 latest.gil 别名当版本身份。
