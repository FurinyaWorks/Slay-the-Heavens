# 隔离 proof 独立复审

结论 PASS，仅认可固定隔离证明，不代表正式 runner 已修或完整历史游戏成立。

固定 proof SHA-256 `83f029562b2412695d0b3fd945edad9dec025564a97486d9bc03d6f1c0101c38`；manifest `96faddccadeacea6a73c8bc17e18da4ebe7d0f8ecab49ef4e3b9b2ca57dae9ed`；最终运行日志原始 SHA `8c8752bd2325a24d7386e15f59717ada589b02aefad555d5958b6be038bfa59d`。

独立确认远端 6d267ca8 与本地 c3d7cf07 同 tree。逐字重建三个实际启动脚本：原 gesture preload、新增精确 base bindings、既有80帧、原 event/texture 前缀、原 fixture。原12个名称、1–6/7–10/11–12分区、exit0及12.632/7.754/7.159秒匹配。351个当前src Lua逐个算Git blob均相符；19个生成Lua哈希一致、零shadow；support/stubs/runner未改。未重复跑Lua。

独立实测8个两owner host/linked drift+missing、恢复fresh读取、CRLF、非目标与foreign cwd不接管。首个缺失matcher写得过窄，底层正确拒绝，原失败保留。三类对照严格区分：未配对Intent nil、精确pair漏settle失败、archive bindings加settle虽过但来源不合格。

独审源探针原始 SHA `28ef28d9d385fb0de854b54a520444b013084cf216a13f57228abc5fef412898`，日志原始 SHA `5ab1a9088c66605ea8d3ce497adc06efb3857c0bb2174c4ba77d8a2731e8407c`。
保留产物复核探针原始 SHA `c8bf09600e6408275cd8a70cb7985d7490d723901f86b34526392c06d22ab124`，日志原始 SHA `bd2bffda43def1c6d61f4d5c9f8422f1813c5dbaa698fad71fb355d3fd9ba2b2`。
公开日志仅脱敏本机临时绝对路径，原始与公开摘要分别记录。便携 proof 复现请使用全新独立输出目录；现有脚本会按约定覆盖该目录下同名输出。
