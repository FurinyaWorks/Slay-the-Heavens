# TASK-38 · 药水与已落地697接续

本轮仅继续既有 PR679，本地准备交独立复审；任务沿原 continue，不新领、不 Done，不推送、不改 PR、不启用自动合并。官方导入、手机及发布未验证。678仍等待679实际落地。

## 实际输入与合流

- 原679：`3e96a1589435f8b06645db095775a789f24b1350`。
- 实际 Release / 已落地697：`33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`，父为1cc。
- 正常双亲 merge：`a9df9dff11779cb1d850dc97b715c711881cf9c6`。保留两侧所有祖先。
- 八个冲突均为 source/CI/helper/消费者：calibration、closeout epoch、copy closure、integrated helper/cases、integration source、session menu、StS source。先以3e作为显式历史前驱提交真实产品树，再追加本轮真实组合来源层。
- 三个战斗药水 runtime blob逐一等于3e；GameUI input/view两个blob逐一等于33d。其余生产352文件完整与真实合流树一致，没有产品调整。原697 source/producer、3e的18项药水验证及独审链按原blob复用，未重跑11-Lua矩阵。

## 来源合同

新 production outer仅组合两处真实Map runtime及三个继承药水身份，复用已有通用projector，保留全部旧targets和明确的 `potionBeforeSelection` / `selectionMapLanded`。current owners117，与3e相同、无新增；旧697 immutable legacy owners116。完整生产352，两个输入及绑定共761个真实Git对象在审计中逐字节验证。

新CI outer声明**42 current bindings、105 archives**：collector取两侧实际Git到合流树的完整差集，再采集本轮真实metadata字节。104旧archive均按原Git字节或原LFS OID/size验证不变；新增production packet为第105个。自身CI packet不自认证。当前raw完整发现JS880/Lua1424；3e历史877/1424；33d历史879/1423。

Source、Read、实际current→priorInventory及明确历史reader每次转换不同字节前fresh认证本层完整声明，public integratedRead/Source贯穿同一raw reader；unknown、已历史、未变化、binary保持原边界。CheckedSource仅用于显式完整validator认证后比较。没有给旧legacy before/binary入口追加缓存或全组合认证。

旧697 116owner/4mode projector实验明确在已验证真实Git的immutable legacy域执行；current117另对真实FS的每个owner做LF/CRLF warm缺失、漂移、恢复。物理current缺失不会被legacy fixture代替。

## 本轮验证与诊断

所有日志与可重放脚本位于 [证据目录](../../.artifacts/potion-post697/)。失败诊断原文以 `.log.gz` 无损保存，原始字节SHA/size见 `diagnostic-log-identities.json`，避免原stack缩进触发源码空白门禁。

- `final-corpus.log`：最终42/105声明，8/8通过，95410.5577ms。包括Source/Read/Inventory所有声明项warm missing/null/drift/restore、integrated同raw、117current owners、双历史跨输入、真实raw负控、旧697 CI读回和隔离copy。
- `affected-source-first.log`：11目标中9通过，2个metadata RED。通过项包含StS真实raw发现/历史库存（31005.5568ms）、live menu、current完整生产、legacy3e与697生产/guard；两个RED为collector遗漏selection→merge差集和copy物理CRLF身份。已以双输入差集及copier原LF合同修复；上述最终8目标包含这两个精确GREEN，未重跑其余9目标。
- `receipt-utf8.log`：原receipt parser目标1/1通过。早期Python默认编码往返造成ℹ mojibake，已从3e/33d精确UTF-8 Git原文重放最小接线；非目标receipt片段保留原字节，不把编码失败记为通过。
- `gameui-combo-seventh.log`：真实generated official Host，原30s child guard，1/1通过，6517.4866ms。合法F.start seed61，在同一Run自然胜利领取Fire，进入small_slimes：Use→Menu→只读Map→原previewBack；完整Run含RNG不变，旧tail零消费/伤害，重新选瓶+fresh目标恰消费一次并造成20伤害。只用真实公开命令，未改runtime或硬设Run phase。
- `gameui-combo-first`至`sixth`保留环境/fixture诊断：Temp权限、LFS输入未展开、依赖未链接、以及完整pointer能力/真实receiver选择。均不是产品PASS。最后沿原合法公开路径完成，没有为了测试改生命周期。
- `union-contracts-first.log`为早期21binding声明的6/6探索性结果；42才是最终声明，不以旧21结果代替最终认证。
- `audit.json` / `audit.log`：352生产、117/116 owner、42bindings、105archives/104旧档案、raw及5runtime Git blob逐项核验；记录的HEAD是产品checkpoint a9df，最终metadata提交是其后继。

本地仅展开两PNG及两个旧gzip的精确原LFS对象；这些现场M不作为新产品或旧archive修改入提交。依赖通过只读junction复用。未修改预算、timeout、CI工作流、分片、并发或规划权重。原Quality执行guard为fast Windows45/POSIX30分钟、rules本地75/Hosted45分钟、POSIX工程30分钟；本轮局部耗时不能证明整文件、Hosted分片或Full成本合格，**组合Hosted与整体成本仍未知**，交根按原门禁准入。
