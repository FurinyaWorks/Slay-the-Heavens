# 独立只读复审

结论：**PASS，仅适用于独立任务分支保全本轮固定字节。** 不表示历史卡牌三片已修、#738 可以更新/合并，或 Release 可以发布。评审者没有编辑代码、推送、重跑 Full 或操作 GUI。

## 独立发现与纠正

1. 初稿 `namedOnly` 提前返回绕过了匿名 Click 清除屏障。真实药水 UI 复现：目标 Down/Up 8 → 外来 Click 9 → busy 时匿名 Click → 恢复 → 迟到 Click 8 造成消耗。只在内存换回原 Git 模块即不消耗，确认是本轮初稿退化。最终先摘除 release，再依原端口 ready、无歧义和控制器规则决定是否仅保留原 ID；busy、turn、controller gate 三组及正常 idle 9→nil→8 均独立通过。新增 fixture 保留原用例并追加迟到拒绝和新 Down 恢复。
2. 初稿 CI 继续层没有将 repair 独占的 HUD/dynamic 叶识别为当前重放入口。损坏新档仍可取得旧文。最终所有真实重放叶均触发完整新鉴权。独立实测 7 个重放叶 × 4 项真实输入漂移 × 文本/Buffer 两入口，56 例均拒绝且实际读取注入。第 8 叶为新增药水安全 fixture，始终保留 live，不认证也不返回旧文。

## 来源和副本

- 8 个 before 文本逐一等于远端 `36b96` 的已取得 Git 对象，after 逐一实读 SHA 匹配。远端与本地原合成的 tree 相同。
- 352 个当前来源实读；129 个原 owner；86 个旧目标完全不变，新增第 87 个完整远端 before；7 个旧证明档逐字节不变。
- 通过真实 copy 实现的只读探针，只把目标写入映射内存，不代替源读取。当前 helper、新生产档与旧档正确拷贝；两个新依赖的 drift/missing 及旧父 helper 冒充当前均拒绝，恢复真实输入后通过。
- HUD 映射仅作用于 `scripts/official-battle-hud.mjs`，不将历史 reader 扩散到当前 Lua owner；关联 `official-run-chrome` 漂移被拒绝。
- `git diff --check` 通过。没有减原断言、改时间预算、改 CI 门槛或启用未验证内容。

## 固定 Git blob

| 文件 | blob |
| --- | --- |
| src/lua/abyss_battle_action_bindings.lua | 31e017dc04fe7db179fd4aed4d79f56de451e560 |
| src/lua/abyss_battle_input_state.lua | 88efac986b67f0e4846a49316640eecf4a8fad40 |
| tests/helpers/closeout-source-epoch.mjs | f8c76b0d7a0741b4df9285b0818b6a6750517bc7 |
| tests/helpers/copy-integration-source-closure.mjs | c05befafb67fc2e09edf3e7a3b99cb1ce301b336 |
| tests/helpers/release-potion-enemy-source.mjs | 99b92685b093dfbe3cfd6d2ea2fa8311a38af7e7 |
| tests/helpers/release-full-repair-source.json.gz | 2eb4cd1be5a5af7ccc50ed1119d23b4af9ef47f2 |
| tests/helpers/release-full-repair-ci.json.gz | 0be97e0e2b967ae2dbad21d8364a934ad8591f42 |
| tests/integrated-ci-source.cases.mjs | 3ef9d932f3b19581b53f514b6879416ea145ebd5 |
| tests/encounter-formation-source-epoch.test.mjs | bc01d34ed135ce3ceed8e17a96099c55c39ad548 |
| tests/native-startup-contract.test.mjs | 0c9c2816e77c16ce2d5f56151cbfa8c299237c65 |
| tests/release-card-contact-integration.test.mjs | 2ed1d04de29d737cb74c9348dfa6444911e49b40 |
| tests/lua/dynamic_monster_input_bindings.lua | d6e86cad47e262bb90886030a5b20ad9faeff62a |
| tests/lua/support/potion_tap_anonymous_safety.lua | 32f1353140694e910c5e84e0f14632e9d6f8a302 |

新 production 档 SHA-256：`14cb921f7672a9356efb35b3eabcb5f9f5b33a6b710e9a45580579ef8dfbd819`。

新 CI 档 SHA-256：`cf434a2292bff848e49157dda1305656e507e260b0f5be785a9862ca06d51bbc`。
