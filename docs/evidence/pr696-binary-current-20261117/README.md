# #696 当前容量联合域的最小二进制读优化

基于准备提交 d48057ca1c8e1061593059894face7343937e575；实际 Release 00ab3fe6d386f55aecfb063e59aeca2cf5065807，原 PR 仍 e9866fec，未提升。

复用 Fork A 已独审 0906baa2808cb447cf98b3cd67c848521eec9bf9 的私有 Buffer 早返思路，而不是覆盖其后的容量/库存改动。当前有两层精确映射，因此 `uncheckedRead` 必须同时排除 B9 与容量 files map；`capacityJoinRead` 排除容量 files map。只有刚刚鲜读、明确无文本投影的 Buffer 才原对象返回，省去无用 UTF8 解码。映射内 Buffer、字符串、原始 fresh 认证、档案 hash、公开逐次调用、库存、预算和全部断言不改。无缓存、新公开接口、测试框架或 Full。

同一公开 `assertReleaseIntegrationCurrent` 单次本地观测：原版 6989.127ms；只优化内层 4545.781ms；最终两层 1892.699ms。三者均 **1041 次鲜读 / 211778535 字节**。这是单对探针，不是统计加速比、Hosted预算或设备性能结论。预备 checkout 两份 LFS档案仅从现有工作树按精确 OID 物化，没有修改其 Git 指针或原档案。

最终版本：档案 missing/tail/null 三类拒绝及恢复4检查通过；完整健康入口通过。原具名 copy closure 1/1 PASS（4.229s）；两项原 selection消费者2/2 PASS（34.570s），均0fail/0cancel/0skip，原 strict SHA及负控保留。源码syntax、diff检查通过。原始日志逐字gzip保全，manifest标明解压摘要。

未验证：完整 calibration、其他 selection/isolated copy消费者、完整大矩阵和Hosted成本准入；不能把旧B9三矩阵通过搬到新组合。不提升原PR、不合并、不宣称官方/设备验收。
