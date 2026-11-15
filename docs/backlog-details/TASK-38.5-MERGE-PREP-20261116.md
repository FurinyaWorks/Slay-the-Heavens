# 小屋独立合并准备（不等于Release已准入）

实际起点为本轮一次fetch读回的 Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。显式FF到已提交但尚未确认落地的 #692 前置 `b67226945c2be47c8fff31f1362412b973f68875`，再依原序 `cherry-pick -x` #678 的 `c6f0e2fc`、`0c0f8586`。本树真实产品提交为 `d5b3ad50e4abcecf7761e8fbd5810f2b94c3d415`、`272f51bedf51a1e3ad4cc703034d0435b7451da5`；没有构造未来squash SHA，也未动原PR/工作树。

两runtime最终blob分别为 node_ui_events=`25c9e6a6a6cdf25cf8f6921267e5e1c637023cbd`、relic_pending_ui=`f34cc7afd10903cd6727ad4716d82a1c69f3603c`，与原冻结值相同。实际本树last producer是d5b3ad50/parent b672，另记原c6f0e2fc/parent36来源；0c和272f是文档checkpoint，不冒充生产owner修改者。TASK-38.5在baseline CLI不存在，仅读PR673合同，不伪claim、改AC或根Backlog。

只加本片稀疏来源层，未新建框架或复制PC/P0药水分支。生产小包绑定已提交272f产品checkpoint及2owner，currentTreeCommitted=true；CI辅助after在工作树捕获，明确false，before逐path绑定真实b672。旧b672包、leaf、93份旧gzip及全部workflow、成本/分片/预算不改。新增prod helper/gzip按精确hash加入已有copy闭包，CI leaf不进入生产闭包。sourceEpoch使用原projector保完整旧targets和fresh linked-owner验证。

先核验小屋完整after，再进入认证的b672输入，之后由原bootstrap层进入36/c240；不把旧合同的库存/源码期待改成当前。原b672合同明确保留876JS/1423Lua的完整前驱，新增live raw完整发现实际877JS/1424Lua（tiny-house新增各1），没有过滤原生Full发现或伪造测量。新live只核真实75/45、30分钟硬guard与完整唯一覆盖，forecast/target/overrun仅诊断。

本次必要命名来源/库存/partial/fresh drift/copy及受影响旧bootstrap入口9/9通过，46.53秒。原小屋JS一次default+official两档真实Host 2/2通过，12.89秒；未重复旧产品矩阵或工程全套。之后只将新增库存负控读入器显式改为保Buffer/string、只变目标，CI包仅该cases.current重绑并更新leaf digest；两受影响名2/2通过，1.48秒，未重复Host。初次CI包与9项通过身份保留，不把增量2项写成重新执行9项。

最终生产包SHA256 `8d1c91696d796fd8b1027c9e37c6d451420ad5be52df916356731d593c972138` /11569字节；CI包 `89293ad0df7b204524b76f57e667787acfae1172a8a41188a8f96ac90c72bb76` /134363字节，12源绑定、94个archive身份（93旧+新生产包）。没有整库来源重打包。原始日志、checkpoint/producer/blob/OID与精确测试名位于本树 `.artifacts/cottage-prep-1116/verification.json`、`source-first.log`、`cottage-host-once.log`、`negative-reader-final.log`、`negative-reader-refresh.json`。

本成果仅准备组合，未跑Full/check/ci:full、未改保护/发布、未生成GIL/官方ready或iPhone14Pro实测。实际Release准入须前置落地后真实base绑定和精确SHA复审；若只是squash父提交改变，先核对应源码/闭包blobs并保留真实原provenance，不能盲目重做旧包或冒借旧PASS。
