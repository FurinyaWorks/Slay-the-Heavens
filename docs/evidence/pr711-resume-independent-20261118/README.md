# #711 恢复候选独立核验及校准修复

恢复输入 `0e2e81853da5a7ab7aef5a1a5b1e4cb0f5358cd8`，Release 基线 `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`，输入树 `c79250f342bb254bd2a5dbe6b29ba9831daed6ee`。核验与本次修复执行者 `/root/check_quality`；修复后仍需另一独立评审者，不能自批。

## 原结果与根因

- `build:data`、`build:ui` 成功。原 `mobile-card-release.test.mjs` 13/13 PASS，包含26混合ID、37旧匿名所有权场景、PC35。生产源码未在本修复中更改。
- 初次源码测试因跳过LFS只读到pointer而拒绝，补回原OID后再测；不是删除断言。首轮完整源认证两入口32项29 PASS/3 FAIL，461秒。
- 两个真实失败为 `integrated-ci-source.cases.mjs` 中 mobile production 和 potion regression production 校准。helper对不同历史阶段统一使用 `potionBeforeSelection`，新pointer owners加入后该目标不再等于对应旧阶段。按完整源码SHA匹配，两个阶段分别唯一匹配 `potionRegressionPrior` 和 `potionClickPrior`。
- 第三个失败是官方布局原PNG未准备，导致 `Invalid selection budget avatar96`。取回原LFS内容后通过，不改预算、图像或校验。

## 最小修复与复验

helper target参数化，仅为上述两调用指定正确原阶段，其他调用仍保留旧默认值。所有既有断言、历史before源和负控保留。`release-pointer-identity-ci.json.gz` JSON深比较证实仅修改该cases文件的afterSha256；同步固定包摘要，不改任何before字节、原hash、inventory或replayInputs。

- `node --test --test-name-pattern='mobile potion production packet|potion regression composition production sources|historical potion production|pointer history authenticates' tests/integrated-ci-source.cases.mjs`：4/4 PASS，3.1秒，见 targeted.log。
- `node --test tests/release-card-contact-integration.test.mjs`：7/7 PASS，53.1秒，包含默认/官方布局和完整当前源、owner缺失/漂移、历史合同与原始inventory，见 integration.log。
- 原始32项未整体重复执行；不声称修复后全32项或Full通过。旧29 PASS仅对应输入候选。原失败完整记录见 before-source-tests.log.gz。初始产品测试及LFS准备失败记录见 runtime-and-lfs-preparation.log.gz。
- 独立解包直接匹配8个当前生产全文/SHA256、15个CI源和replayInputs；7个产品blob保持旧独审 `1a6dfc30`，唯一gestures差异精确等于已合PC35的清空notice语句。

不新增输入玩法、不改变runtime、RNG或任何断言/超时。托管必需CI、最终独审、正式导入、Ready、实体PC/手机、官方容量均未由本报告认证；未合并或发版。
