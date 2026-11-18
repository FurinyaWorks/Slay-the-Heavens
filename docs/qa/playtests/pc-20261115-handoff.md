# 2026-11-15 PC QA：下一 Session 最小接续入口

第一手依据：[约58分钟逐字记录](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt)；[38项覆盖矩阵/版本及任务状态](../../backlog-details/PC-QA-20261115.md)；[12张截图的名称与SHA](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-image-manifest.json)。用户在本次交谈明确要求**先把工作管理起来，不重复报数、不丢任务；当前不用在此文档PR再修改游戏**。

## 源码交接

- #661 已合并到 develop；#663 是导航/容量/Neow退出链路且已于2026-11-15合入develop（c2409ad），#672 'feat/pc-closeout-integration-1115' 是先前半途后已经存在的PC修复候选。本文创建时 #672 **open/unmerged**；其原Depends-on #663已满足，须按新基线复审，曾报告产品冻结 '9b7794e9'、PR HEAD '1f7ce04c53189db8c39b59c797a45d57a2c7bac1' 与对应构建 'e1d18bca-a2d9-4599-9786-3b831ac89bff'；这些都只是当时快照，实际执行必须重新从GitHub读PR状态与最新HEAD。
- #663已合入不等于#672自动合并。#672 声称已经处理：同页全屏准备、商店压盖、分裂重叠、取消提示、药水与遗物图标、菜单重复地图、金线、四角加号、接地阴影等；但**PR未合、设备官方容量/ready/PC手机验证未完成**。不能仅依据PR正文声称已修好。
- #670/TASK-109、TASK-110 是明确“发版后”的数字键、预输入和精修动效范围；#673 是独立手机两轮实测任务；不要混写为本PC PR完成内容。
- TASK-42已进入In Progress，是因为用户实机录制已开始，并非同候选两幕验收全部完成。新六个子任务中：TASK-42.1为To Do，剩余五个因#672已有部分代码候选处于In Progress；**六项AC全未勾**。
- 图片原件含UID/可能的账号信息，**不要直接上传公开GitHub**。私人ChatGPT文件库路径：'/Slay-the-Heavens/PC-QA-2026-11-15/'；12张PNG原字节、单独检索、manifest、逐字文本和ZIP都在里面。外部Codex无法自动访问该私有目录；若要让Codex脱离本聊天取图，须由Owner提供一次安全转交或先脱敏公开上传。此限制必须明示，不可造虚假图链。

## 操作顺序

1. 读仓库最新 'AGENTS.md'、'docs/TASK_EXECUTION.md' 和 'backlog instructions overview'。本记录PR因当前连接只有GitHub文件接口、无法执行本地 Backlog CLI，**尚未验证 CLI 规范化、'verify:backlog'、项目CI**；请先在完整工作树运行CLI审计任务身份/编号/状态/AC/M8索引，必要时用CLI无损规范化再进入合并队列。
2. 检查本PR与 #672/#663/#670/#673 的最新精确HEAD和owner；已有In Progress任务继续交原实现者，禁止竞争工作树/覆盖未提交成果。优先复验已存在的P0代码候选，缺口再做。
3. 对所有P0使用同候选真实PC帧/事件/日志/官方容量/ready建立证据；针对PC系统卡顿必须排除其他程序负载影响；小修不能当作通关及正式发布许可。
4. 逐条在[覆盖矩阵](../../backlog-details/PC-QA-20261115.md)更新当前证据、PR、状态（To Do/In Progress/Blocked/Done），该状态管理使用Backlog CLI且保持未勾AC，直到真正验收。
5. 最终由正式发布集成负责人确认2.0.0所有高严重度阻塞、同候选PC/手机验证、官方容量限值、CI与出版手续，未满足不得宣称发布完成。
