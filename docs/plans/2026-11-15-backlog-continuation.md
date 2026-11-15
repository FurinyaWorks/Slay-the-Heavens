# Backlog 持续执行 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按 Owner 最新指令，只验证、复审与保全本轮已经开始的切片；暂不扩张任务、不继续领取，当前发布候选独立保留。

**Architecture:** 各切片使用独立工作树，任务事实同时核对最新 develop、根目录较新记录及原分支。原先只推送/禁止PR的成果继续保留原限制；新逻辑接续先在隔离树验证，不直接写入发行候选。Backlog 是任务计划与验收唯一来源，本文件只安排跨任务执行。

**Tech Stack:** Backlog CLI、Node.js、Lua/Fengari、现有来源合同与工程门禁、原生千星候选工具。

---

## 本轮纠偏

上一轮只交付 TASK-18 的文字切片便停止，没有完成用户要求的持续队列推进。本轮不能把单个 PR 入队等同全部任务完成；每片交接后继续下一可执行项。源码、离线实验、候选写入、官方导入、ready 与各设备证据分别登记，不因用户要求“都做完”伪造完成项。

**最新指令覆盖上述继续领取安排：** Owner 随后要求暂不扩张，只收尾手上工作。角色方向只确定璃月，技能与玩法设计尚未清晰，撤回首位角色追问，不进行接入。TASK-96 的设计确认与审批未完成，不能从既有代码或实验推导为已批准；关系用 Backlog 原生依赖表达，不新造任务或重复审批问题。

## Task 1：接续 TASK-105 离线容量实验

**Files:**
- 接续：`experiments/capacity-105/run.mjs`
- 保留原记录：`.worktrees/task-105-offline/docs/evidence/capacity-105-20261113/`
- 新容量附件：`docs/backlog-details/TASK-105-CAPACITY.md`
- 任务：用 CLI 修改 TASK-105；不改写现有 `TASK-105.md` 的璃月转场历史。

1. 核对原实验输入/结果和未提交文件身份，原树只读保留。
2. 修复已证实的重放路径或输出覆盖缺陷；若改可执行脚本，先用负例证明缺陷。
3. 用独立本轮输出目录复验实际序列化、生产映射和官方数据缺失时的拒绝。
4. 保存真实数字、命令和输入身份；官方 MB、PC/手机及长期 GO 仍按证据验收。
5. 独立复审后形成可恢复提交；不改正式开关、候选或 TASK-97 量产准入。

## Task 2：适配 TASK-76 已审动作令牌修复

**Files:**
- `src/lua/abyss_battle_details.lua`
- `src/lua/abyss_battle_ui.lua`
- 原 `battle-return-input` 回归及严格来源适配器。

1. 以 `feat/battle-return-input@ffec7c5d` 为来源，核对最新 develop 与 PR663 的相关差异。
2. 原修复只读保留，在独立新树复现旧动作/牌堆尾随 Click。
3. 适配最小生产改动并保留原真实 Host 场景和历史来源负控。
4. 运行相关动作、拖牌、牌堆和来源合同；不重跑无关 Full。
5. 独立复审并保全；不凭 Host 通过宣称手机现场问题已关闭。

## Task 3：适配 TASK-34 永久失败停止音乐

**Files:**
- `src/lua/abyss_ui.lua`
- `tests/fatal-bgm-stop.test.mjs`
- `tests/lua/fatal_bgm_stop.lua`
- 原 `fatal-bgm-stop` 精确来源桥与冻结前后输入。

1. 复用 `feat/fatal-bgm-stop@f4b6a39f`，先核对当前入口及 PR663 同文件变更。
2. 在当前入口证明 MAP/BATTLE → 永久失败缺 STOP 的症状。
3. 移植一次性退休合法音频发送器的原最小修复，保留普通 disable/OnDestroy。
4. 验证重复失败、STOP抛错、不可用发送器及原 bootstrap，保留严格历史源身份。
5. 独立复审并保全，真实含声音的 PC/手机录像继续单独验收。

## Task 4：全队列继续执行

1. TASK-102：核对真实 Fork/v3 工具入口及既有成果，补可恢复身份与 candidate-only 边界，不重启正在用的连接。
2. TASK-100.1、87.1、81.2：按实际合入与现成收据验证剩余交付合同；不重造已交付调度器，不以入队代合后 Full。
3. TASK-25.2.1：保留根记录的最新低多边形 idle 要求；查唯一私有静态基准，使用已有工具做整体运动小样，视觉通过后才交人工审阅。
4. 已审图标、HUD、图鉴、怪物拟合及复杂度成果：保留原分支/推送/禁PR限制，明确缺哪项集成或设备证据，不重复实现。
5. TASK-96 后续方向：璃月方向保留，首位角色问题撤回。设计前置与审批未完成，不继续技能、平衡或正式入口工作。已有胡桃实验仅保全本轮文字缺陷修正，不代表设计采用。TASK-85/97/62/64 不继续展开。
6. 真实客户端与手机项目：本轮没有窗口与设备证据，不开始测试，保持未验证。

## 已开始切片的收尾记录

- 容量实验与工具入口：`feat/backlog-continuation-1115@2e8d5d9559f9f38b2ddc648ea30d3e5a676a5a06` 已推送并独审；TASK-105 官方容量与量产准入仍未完成。
- BGM/输入：`feat/bgm-stop-followup-1115@158c492a3f8a6e8d3bfc85b79634b06d2f4b3056` 已推送并独审；未接发布候选，官方/设备验收待后续。
- 胡桃既有实验文字：`feat/hutao-lab-truthful-copy-1115@060fc2c50e08c0f0d1b7157748b6a652ab3fe3e3` 已推送，29项 Node VM 合同通过；没有采用角色设计或修改冻结数值。
- 待机降本小样：`feat/lowpoly-idle-followup-1115` 保留本地原始证据，主控独立视觉复核 No-Go，停止尝试，保留原7303图元候选，不接生产。
- TASK-75 已开始的单测试优化已独审保全：`feat/source-proof-cost-followup-1115@ef42f018f34f34e12df06364e780ad0c8fe89251` 推送并精确读回。原 named matrix 1/1通过，69条有界断言轨迹一致。实际 hosted Full 仍为74.0/110.4分钟，不能宣称达到30分钟目标。
- 原生依赖已读回：TASK-97 同时依赖 TASK-96（Blocked，设计AC2未验）及 TASK-105（In Progress，容量GO未验）；既有代码不代替设计批准。根目录旧快照缺105，不伪造任务或用旧快照覆盖完整关系。
- TASK-87.1 与 TASK-100.1 的机制交付根据既有 PR661 的精确合后收据完成；不代替设备/发布许可。
- 文案 PR671 已运行 `npm run merge:auto -- 671 --pause` 并读回 `state=paused`，退出原生队列；分支与文案保留，不重新入队。

## 验证与交付

- 每个写入范围只由一个执行者负责；生成目录和报告不跨树互借。
- 默认先看 `test:fast` / `test:related --plan`，执行相关回归及原负控；现有路由要求的 Full 由正常准入承接。
- Backlog 只经 CLI 修改，完整保留原 AC、历史成果与依赖；只勾有本轮客观证据支持的条目。
- 独立复核与精确源码身份绑定。源码切片仅做到保全不等于已集成，设备缺项不等于整个任务 Done。
- 本轮仅收尾上述已开始项，不继续领取、不新建 PR 或重新授权入队，不轮询 CI。
