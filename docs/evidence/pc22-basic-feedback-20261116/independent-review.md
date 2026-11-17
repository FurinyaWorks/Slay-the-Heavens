# PC22 基础坐标衔接独立复审

结论：**PASS（仅源码切片）**。没有发现阻塞该两文件改动的产品或测试问题；不代表 PC22 整项、Full 或实机完成。

- 独立身份：/root/pc22_independent_review；reviewId：pc22-basic-feedback-independent-20261116-1b272ab7。
- Base：36b9b157ee6f05b65eb9f1da7e2978647d36c210
- Head：1b272ab7f57f2a8bde67fe8796d3a894445ae052
- 审查时工作树干净，精确变更仅下列两文件。

| 路径 | Git blob | Git canonical SHA256 |
|---|---|---|
| src/lua/abyss_card_flow.lua | 486b63e804f138ee7a1ba1dc8241bdf9d3b99731 | abeb85aab55a9d4cf1c8c8b9f434aaf8ffff1e77e0b027160099a4e939e21c13 |
| tests/lua/card_flow_contact_continuity.lua | 6a69df8ba7a9c2906ffd3377f1bc09325c793f08 | c675ede841d4508af5b1494a9f40721aa4b70766f9dc851e52e8742d8442d363 |

## 关键判断

- CardFlow.playing stored flight.ty while Feedback cardFlight sets spatial stop=(target or area) and Theme.space.xxl*1.5 or 0. Both rendered flight endpoint and enterFrame landing use flight.ty-(flight.stop or 0). The single changed expression copies this existing visible contact centre into the committed UID pile-departure origin.

- playedCard and all ten cardTrail controls are direct feedback children with equal container size and identical anchor/pivot/rotation/scale/position specifications. The candidate-preview transform defaults absent anchors and pivots to [0.5,0.5]. Runtime parent identity and zero rotation are asserted. Positive own scale around their shared centre leaves their anchored origins unchanged, including shared ancestor transformations; this proves centre continuity, not full shape or pixel identity.

- Natural seeded Host strike reaches discard, natural defend has stop=0 and reaches discard, and separately marked legal controlled shockwave reaches exhaust. Tests assert same UID, one Run.play call/committed play, visible contact/departure/end observed, busy release, consumed events and one player_action cue.

- The post-command mutable Run snapshot covers combat and RNG, excluding immutable data/catalog references and deliberately consumed combat.events plus elapsedSeconds. elapsedSeconds is checked separately against every actual update delta, so it is not frozen or silently reset. Full source diff does not alter Run commands, action duration, sound dispatch, source epoch or busy gates.

- Exact Git baseline CardFlow with the final test fails the native departure anchor assertion by 48 logic units. Original probe includes hand-discard and discard-draw UID paths; the fix does not reimplement these. Original card-flow fixtures pass. Formal-profile old polish cases 1 and 11 fail on both changed and exact baseline CardFlow, while default-profile original polish passes 17; these are retained failures, not a formal-profile all-green claim.

## 独立验证与复用证据

固定 Node24 v24.18.0：Fast mode、20ms 帧步长三条 Host 场景全部通过；缺省、零、48、-12 stop 四个边界通过且输入 flight 不变。独立执行使用现存默认 build（presentationProfile=nil）；正式 profile 的3/3仅复核作者原始证据。系统 TEMP 短名与完整路径均 EPERM，改用证据目录的独立 tmp，不改产品工作树或 sandbox 代理。未重复 Fast/Full/整套 Host。

作者 intake SHA256 6aa8da7527c21b92ac6fe697a919a42b45437e11deee863938e808e4e65ebcf8，全部列入文件已重新校验 hash；baseline-card-flow.lua 与 base Git 原始字节完全一致。Fast 10 JS+37 Lua exit0，625 integration JS+556 Lua deferred；包装器调用 npm build:data/build:ui，不能描述为全程纯 Node24。默认 polish 17pass，正式 profile 的旧1/11两条失败在基线同样失败，保留原失败。生产文件 Luacheck 0告警/0错误。

## 未验边界

- No Full/hosted CI, source-epoch binding, GIL build/readback, official import, ready, native LuaHost, GPU/device, audio listening, official client or mobile evidence was produced by this review.

- Private reference image 12 was unavailable. No decorative polish or overall PC22 fidelity judgment is made.

- Existing dissolve contact scale and initial trail scale differ (author 10ms sample 0.4201389 vs 0.5; independent 20ms sample 0.3472222 vs 0.5); equality of centre does not prove identical geometry or seamless full silhouette.

- The independent Host probe uses the existing default build. Formal official profile 3/3 is audited author evidence, not independently rebuilt or rerun.

- Source binding is separate unfinished work. This pass permits only the reviewed source slice to proceed through normal delivery checks; PC22 overall and official/device acceptance remain unverified. No Backlog state or acceptance checkbox was changed.

## 证据 SHA256

| 文件 | SHA256 |
|---|---|
| pc22-source-intake.json | 6aa8da7527c21b92ac6fe697a919a42b45437e11deee863938e808e4e65ebcf8 |
| pc22-source-intake.md | 31ff34fd9790219c32291875b234408e1fcede34d3b85f687a00a1ccb9ae2429 |
| pc22-basic-feedback/contact-final-exact-red.log | 5b4c58b81c9d99a2b5af3f68b9a32fb2d7751da6c6ccc670e258344b64f71d8d |
| pc22-basic-feedback/contact-final-exact-red.lua | 56c9c740a90a43647b29f359293f7e1457e70d6ed68ef78dd6c5807226a5c4e6 |
| pc22-basic-feedback/contact-final-green.log | 11a8071255769eba926de0b65b9b5f646b7cc1b31b3750789f991ba41e144325 |
| pc22-basic-feedback/probe-baseline-r2.log | c16f1d545483f2bd5f88351b4cceaa2af253e793536284c27eda76544e808628 |
| pc22-basic-feedback/original-card-flow.log | 58af31b14202a8ad03779eba4b9abb82ef548c7bb020850a8023b8fe2615a292 |
| pc22-basic-feedback/original-flow-default.log | 8f82b36218c44e0573c1cb54d3f871c3741f0ea3d98ecb41c4084d3518782e86 |
| pc22-basic-feedback/original-feedback-polish.log | 9a39b23697f791882c27cc5e0dc0a5d318eecae4f3823374dd2b4a593acfad0b |
| pc22-basic-feedback/official-polish-baseline.log | eac2df263cf836a7fa842622f3acf23ffedcaba6dce1da45790cc860095a6d44 |
| pc22-basic-feedback/official-polish-baseline.lua | 8caf7a4b4e09f7eb8f94a7000fced977951a46a2ae1ed5f53528f674f1b0ee5f |
| pc22-basic-feedback/original-feedback-polish-default.log | 2e8f4638aad161a0e21d586d59123c07f0cafecfeba537bdb525ac59b677eddd |
| pc22-basic-feedback/fast-run.log | 0a0c5a0516e917031660a90ad046a0501262aa5c28627fe571d84ac0c4971872 |
| pc22-basic-feedback/luacheck.log | 540ec9185f57e4411d408f2c8012c8650df78cf5f0608eb2e6496f72a850f28c |
| pc22-basic-feedback/baseline-card-flow.lua | 65dcdf5306c4a4a3665d934843f10974224b4b876189b0c0b0fa387458bec5fb |
| pc22-basic-feedback/review-independent-probe.mjs | e743511b0300008800b03b69ee5028a3b70fe9c007e1704fe2ebcd91b5ea9425 |
| pc22-basic-feedback/review-independent-probe.lua | f5a849bb64f237c793b319249a4f4aa5f6b525acb659a359401c814b65859cd8 |
| pc22-basic-feedback/review-independent-probe.log | 762bbe3c29c58320a0153a1fdb1c90115304013eb71e152bf096478e7a5510a5 |
| pc22-basic-feedback/write-independent-review.mjs | 75046491b6764fdc118b0790f4a96911919f98c9077434ffa8fda8e4832a36c6 |
