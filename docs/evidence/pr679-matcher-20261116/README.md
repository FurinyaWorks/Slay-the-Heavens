# PR #679：精确首层故障合同接续

基准 `93b94277b26d7ea54399e296bbd6596d345f037f`，Release `33d71575`。原 Rules2 报错不是拒绝缺失，而是故意追加换行已被更早的 post697 owner 拒绝，旧测试仍统一期望 integration 层。

原五个变异输入全部保留，现逐路径核对完整错误首行（层和完整路径），不改为任意异常：`.gitattributes`、`docs/legal/assets.json`、`run-hud-ci-source.mjs` 仍要求 integration；`closeout-source-epoch.mjs`、`integrated-ci-source.mjs` 要求 post697。原生用例、其他历史断言和 raw 输入均不删改。

仅追加 matcher 修复包：before 逐字等 Git 基准及原 packet current；current 等新测试完整字节，SHA256 与 Git blob 双校验。原两个 packet、两种历史 views、42 bindings 和旧107 archives 保留，新增包后108 archives。没有修改产品、workflow、超时或Full路由。

验证：原具名用例复现 RED（94.5秒），见 red.log。五个原树故障输入实测首层顺序为 integration/integration/post697/integration/post697。新增包当前认证、两个历史域及新owner/archive暖缺失和恢复通过；独立审查另验新包缺失/null/漂移拒绝与恢复。check:guidance、verify:backlog、diff-check通过。完整回归和Hosted新头未运行/未认证。

独审 `/root/pool_1215/review679` PASS：cases SHA256 `4531799fe643890025e993659b78d39bcdfa82d79760cba2ff87bde7468a966b`；helper `89129623d95333191504d6d206f42b87097a89fc3d030be84587a23569205c79`；新包 `b93106ecdc798c4b9e266af10886b651ece625cdc477006c22253bb5b6703fcc`。未决源码问题为空，最终提交身份单独记录。

环境准备：首次因稀疏检出缺 workflow 在进入故障断言前失败；恢复原 .github/.cursor/.codebuddy 后执行，不算产品回归。两份历史 gzip 按原 LFS oid/size 材料化，未作为改动提交。Backlog CLI 不可用，未手改任务状态或验收项。

终态原具名用例 GREEN：1/1、0 fail、0 skip，122379ms（整进程123149ms），见 green.log。未改用例预算或跳过任何原断言。

日志提交复审：red.log仅去除两行尾空格；无损原日志含SHA256/长度保存在red-original.json。修正后完整base→HEAD diff-check通过，不重跑测试。
