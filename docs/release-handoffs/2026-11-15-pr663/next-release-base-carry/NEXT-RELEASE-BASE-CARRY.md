# 2.0.0：药水进入下一基线时，保留输入修复和正式打包支持

真实 Release 仍 `1cc5479`。#679 **Draft / 未合入**，其正文中旧的自动合并表述不是当前状态。精确 `89dfc774b1c6bb146b91e6064039f4d648db0d33` 的无 Down/Up 能力回退仍有已复现阻塞，已有 owner 执行线；本轮未重复该红例、未尝试恢复 Ready 或手动合并。[先前负例与退回 Draft](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/679#issuecomment-6903425566)。

## 临时组合：三块输入改动确实可共存

以[九切片产品组合](../current-product-composition/CURRENT-PRODUCT-COMPOSITION.md)（已包括精确 #684 `6c45778c` 与旧 #679 `f564aea6`）为底，只按 Git 字节应用 `f564aea6 → b04e686`、`f564aea6 → 89dfc774` 的 `src/lua` 增量，均干净应用。不搬动 CI/原 PR，不重生成相同默认布局。组合的 gesture 同时保留 #684 的取消提示清空、#686 的 active enemy pointer 重置、#679 的过期药水瞄准 Down 退休及 Battle UI 的 `aimReady` 端口。

直接执行未改用例：#679 背包/弹层/resize 取消上下文 **4/4**、不同槽位与同 ID 补充 **4/4**；#686 无归属释放、多指、卡牌/敌人触点及 terminal 归属 **4/4**。原始三个用例、源码和组合文件 hash 见[定向日志](gesture-carry.log)。这是窄产品组合，不证明仍阻塞的 click-only 直接选敌恢复，也不以此替代独审/Required、历史来源、真实设备或最终产物。

#678 的准备头 `df1ed19de84b9858275b3cd0a1ac421a0b5b27b7` 和 #686 的准备头 `b04e68681ddf0779d421580863a06cd30caffb42` 都基于旧 `f564aea6`。前者 gesture 完整等于旧版，后者只是加了 enemy active reset，整文件覆盖会擦掉新退休块。在药水修好并真实合入后，选取各自增量，对**实际新 Release**统一认证，不把旧准备头当合后基线。#686 的 bcfbc037 terminal 隔离补丁仍是另一个交接，本轮不重跑。

## #691 两个必须随实际新基线带走的补丁

准备头 `7bf42fc54d919a92db753ca07cb30547487304b8` 也基于未合入的旧药水，两个已有支持补丁依次可 apply，七个文件改前与旧 #691 逐字相等，两个修后产品文件与已验证的 19:49 集成逐字相等且语法通过。**准备头尚未吸收**版本键（正式 compact Lua 的裸键）和显式静态卡图的格式兼容，不重复跑一致的构建。[文件级证据](serializer-prepared-proof.json) · [精确说明](SERIALIZER-PREPARED-COMPATIBILITY.md)。

整个交接未改变 release/develop、版本、标签、保护或任何 PR，未使用用户设备、调用 SDK 或重跑 Full。
