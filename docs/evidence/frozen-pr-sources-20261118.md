# Frozen PR sources · 2026-11-18

恢复时先打开对应 PR 的关闭记录，再从下列固定提交建立新的短分支。

| PR | 原分支 | 固定源 | 恢复条件 |
| --- | --- | --- | --- |
| [#665](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/665) | `docs/v2-release-roadmap-20261114` | `7239295bfba13f73f27fe8bfcce1a93d7f436afe` | 版本元数据仍缺对应发版产物，旧 Hosted run 43724198142 在版本来源和 JS 测试库存鉴权失败。复工时先复核实际 Tag、版本与产物，再分离独立说明。 |
| [#667](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/667) | `feat/agent-repository-navigation-20261114` | `1d7b7627b385ab7adc4af17ab9c324a095520e61` | 草稿测试迁移可漏跑 Lua 用例。已有评审复现和未推送的隔离修补。按实时 develop 重放隔离修补，并检查实际 Lua 测试发现后恢复。 |
| [#678](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/678) | `fix/mobile-cottage-v2-1115` | `3eb212bd18e3af038f65ac67ed93049af70cc78e` | 小屋恢复的独立代码仍在。现有 Release 有 11 处冲突，先接续已固定的后继 6eb366c7 和关联药水准备，再在现行 Release 重跑小屋首领奖励用例。 |
| [#685](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/685) | `fix/mobile-forethought-v2-1115` | `c20c4148cfdf39492d99973943674db091c29941` | 确切 Release 上 9 项远虑与确认布局回归通过。卡组 Lua 和主题两项当前来源认证仍失败。使用已固定的准备头 dc96e66f 重绑两处来源后恢复。 |
| [#691](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/691) | `fix/mobile-lua-serialization-v2-1116` | `f85f4e4435e8b128c16713ed23bcbb2559f4fd1e` | 生成器与当前 Release 有冲突，需同一候选验证序列化、叙述和静态卡图完整读回。后继准备头 7bf42fc5 已固定；待实际正式候选再恢复。 |
| [#678](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/678) | `fix/mobile-cottage-after-regression-v2-1116` | `7eac3d3131e12dfceae09356464433b83485e397` | 保持确切准备提交，见对应 PR 的原交接记录。 |
| [#685](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/685) | `fix/mobile-forethought-after-potion-v2-1116` | `dc96e66f0df9640cf3a52bf2e3afe281f1a5dad9` | 保持确切准备提交，见对应 PR 的原交接记录。 |
| [#691](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/691) | `fix/mobile-lua-serialization-after-potion-v2-1116` | `7bf42fc54d919a92db753ca07cb30547487304b8` | 保持确切准备提交，见对应 PR 的原交接记录。 |
