# PR682：当前负控与历史 reader 分层修复

授权输入为原 PR682 HEAD `1b60f71c4733ced0c91dc814dc5c7a6644c8fe56`，目标 develop 的受审基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。沿原 TASK-87.2/TASK-34 与 Depends-on:none，不新建任务、不改Backlog/生产/预算。独立树 `goal-v2-dependency-ci-final-1116`，原树保持clean。本执行者未推送、改PR或授权合并；远端若已有并发新头，必须协调保全，不能覆盖。

## 实际失败与最小修复

Quality `43770305401` 两个已结束失败 job `132986880772`（POSIX12/15）、`132986880785`（rules15/18）完全同因：`real style CI admits only full inventory, complete source and freshly verified executable helpers` 的原111行预期拒绝 `scripts/test-affected.mjs` 变异，却先在 `session-menu-navigation` 库存源检查失败。

局部 `readFileSync=integratedRead('sts')` 已返回历史源，再把它传给需要raw current的负控。当前 raw SHA `e4c7e4f50ce8ceb0f638f626fd11004ef3a72412c7c984a631c2443da67b4163` 正确；历史 SHA `61bab87143daed8785be8422ed68e930001625b46ff1a4153d3315f1907176f7` 也正确，但不是同一输入域。

代码点 `cfe8a040` 仅两行：正向历史比对明确使用historicalRead，负控使用原导入raw reader。原path列表、regex、缺失/漂移与所有有效负控保留。原注入器的 `raw+''` 还会把未改gzip转成UTF8；只对目标追加字节、其余Buffer原样返回，避免更早的完整档案拒绝冒充预期变异。

## 精确后继与完整授权

代码冻结点 `ce075f014702b70a2a20456e7dc6ef0f5659be59`。三个真实before/current绑定覆盖 `dependency-bgm-source.test.mjs`（原generator再现的显式历史read接线）、`integrated-ci-source.mjs`、`sts-style-source-epoch.test.mjs`。新增helper与gzip为明确trust leaf/packet边界；audit.json逐Git差分证明所有五个执行变更均被覆盖，没有为保持“两字段”遗漏reproduction。

新包43,565B，SHA256 `193d80b2c6e97f18fdc26229d9e6f82265560a0d308fabb9a7b8d134a917c8f8`；真实捕获时currentTreeCommitted=false，该历史声明不重写，三个current随后逐Git匹配冻结代码点。93旧档案（含两个LFS对象）逐Git/OID/size保留，352生产blob/116 owners不变。旧域876JS/1423Lua；parent与当前均879JS/1424Lua，增量0。

每次新增当前→1b转换前fresh验证三个绑定、全部旧档案、新包自身、生产与完整raw库存，不缓存授权。公开 integratedRead/Source 使用同一个raw read口；current→prior库存转换也fresh认证。unknown/已历史输入保持opaque。暖成功后对另一binding、archive、新包、production的missing/null/drift，公开reader必须实际读到坏输入并拒绝；恢复后重授权。新增未注册JS输入也不能借warm授权。临时负控文件以wx创建、finally删除，实际发现集合没有永久新增。

原generator与旧包均不改。原再现合同先fresh认证新后继，再通过精确1b历史read读取原checkpoint；native/CRLF两视图仍生成原完整字节，不伪装新当前输出。

## 本轮执行与边界

- 精确原失败本地RED，退出1，错误与两平台job一致。reader-only后旧frozen源正确拒绝新字节，中间失败保留。
- 最终原失败与公开warm/库存负控2/2 PASS，7,977ms；包含新的raw库存漂移/恢复。
- 最小scope相关7/7 PASS，63,854ms：原失败、新warm、完整current、copy、raw库存、反馈历史和依赖CI后继。原raw库存多重负控38,108ms，属于本轮真实成本，不降低旧预算或宣称Hosted耗时。
- 原generator再现单项（内部native/CRLF）1/1 PASS，802ms；不重复产品矩阵或Full。
- 早期给所有旧legacy历史转换额外whole认证的诊断功能6/6，但wall277,978ms，current93,890ms、feedback104,774ms，是不接受的新性能回退。进程自然结束，未因观察超时重启；仅移除那两处非本次新增的legacy扩展，新增后继/同raw转发/库存认证不减。慢诊断完整保留，不能当最终交付成本通过。

原始两job、全部RED/GREEN、慢诊断、collector与逐Git审计以gzip保留，字节身份见archive-manifest.json。没有GUI/GIL/官方导入/ready/声音实测、设备、Hosted Full或发布验收；Required与实际合并仍由根线程另行确认。
