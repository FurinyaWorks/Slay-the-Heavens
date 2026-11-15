# TASK-100：Release 无损 Lua 序列化首片

## 授权与来源

Owner 明确批准将既有容量优化首片移植到 `release/v2.0.0`，独立树/分支 `mobile-lua-serialization-v2-1116` / `fix/mobile-lua-serialization-v2-1116`，基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。已在主工作区通过 Backlog CLI 追加 TASK-100 的计划、范围、来源及本轮证据；保持 Furinya / In Progress、0/4 AC 和他人 notes。`task:pick` 为已在进行/已交付 HOLD；这是现有工作的明确授权接续，不假重新认领或另立任务。

最新 Release 与 PC Release #684 `d396abb252b4dcfe4d825dccc6c850daf81086c9` 均没有 UTF8 helper 及四个 producer 接线。因此仅搬 d009 会缺前置。按原提交顺序 `cherry-pick -x`：

1. `94e3c5ef83e5d98bf86614c25f2dedd049d0bf9a` → `6a7a7ef1c1d2cf0407b82098ed57435844431ae9`：已有 UTF8 字符串编码器，接入 data、Original V4、theme、narrative/presentation producer；保留 legacy 导出的 `toLua` / `originalV4ToLua`。
2. `d009c8d504d8c8769cb7efc3e2ffc5ff97b85240` → `d48bb642fb45fedfeb3b55417d0e120e0e69e8e9`：安全 ASCII 非保留键使用 Lua 的 `name=value` 语法；保留排序、数字/特殊/非 ASCII/保留字键的引号编码。helper blob `22b94ce8d3319ed9093355e9b1b7650cbf35bc9e`、原测试 blob `a2e55572dc0ab045549e5b19732d4fb151a37963` 与原 d009 精确相同。

执行变更仅原六文件：四个 producer、`scripts/lua-utf8-literal.mjs`、原 `tests/lua-utf8-literal.test.mjs`。不包含 b4 fractional literal/portrait、be41 runtime 几何、fc999 来源 WIP、#672 手机布局或素材链。整个 `src/lua` 树与 Release 基线相同。无运行时 decoder、数据重排、规则、图片或 UI 几何改变。

## 本轮验证

先列定向范围，确认其它执行者无测试/生成进程后，仅运行一次批准的成对生成。使用实际 Node `v24.18.0`，不改原预算或断言：

- 原 serializer 两项测试 2/2 通过：真实 Lua parser、全部字符串字节、控制字符/注入文本、键类型/异常键/null 处理及 legacy serializer 负控。首次仅系统 Temp 的 `mkdtemp` EPERM，保留失败日志后将本次进程临时目录指向本树；没有改工具策略、产品或测试代码。
- [新 Release 配对证据](../evidence/release-lua-serialization-20261116/proof.json) 绑定 BASE `36b9`、代码 HEAD `d48bb642`。从基线干净审计树与本树各实际生成一次，使用相同 `officialAssets:true/nativePageLifecycle:true`。后续仅说明附件提交，六个执行文件保持该代码 HEAD。
- 五个模块 `abyss_data`、`abyss_original_v4_data`、`abyss_theme`、`abyss_narrative`、`abyss_presentation` 在真实 Lua C API 中解析/执行后深比：11388 表、35542 标量、10883 字符串、46925 键。字符串与字符串键按原始 byte hex 比较，保留键原始类型；数值比较 integer/float subtype 及 IEEE754 双精度位，不做 JS Unicode 反解。
- 另外 20 个实际生成文件逐字节一致，包括主 UI、战斗 UI、模板等原生导入源 JSON，未修改的 Lua layout/portrait/binding。未调用外部 SDK 投影、GIL 构建或官方客户端，不把导入源 JSON 字节相等写成官方导入通过。
- 六文件 Node24 语法、指引、Backlog 和 `git diff --check` 通过。无核心 Lua 改动，不为形式重复整仓工程/性能样本；没有运行 Full 或增加 `ci:full`。

本地可重放脚本与 before/after 生成文件位于本树 `.artifacts/lua-serialization/paired-release-proof.mjs`、`paired/`；原始日志包括 `unit-temp-permission-failure.log`、`unit.log`、`paired.log`、`syntax.log`、`guidance.log`、`backlog.log`。这是新 Release 的一次等价验证，不复用旧候选数据作为新证据。

## 收益与未验边界

本轮相对 Release 基线的五模块源码合计减 **640086 字节**：95876 + 348549 + 142301 + 5295 + 48065。该基线尚未包含原 UTF8 接线；数字不能与原 d009 相对 `1f/9b` 的 178176 源字节或 b4 两片累计 222490 源字节混用。旧六模块值/字节码和旧候选 GIL 减量继续作为各自来源的历史证据。

源码字节不等于官方容量、网络流量、启动耗时或手机性能。旧 9b 的官方 20.1781>20 FAIL 仍保留；本片未生成/覆盖 GIL、修改候选、工具签名/执行策略、master 或 Tag。当前候选的官方容量、导入/ready、PC/iPhone 14 Pro 和发布状态均未验，不宣称容量 GO 或 TASK-100 完成。独立复审由协调者绑定最终 HEAD/BASE，本文件不预填成功。
