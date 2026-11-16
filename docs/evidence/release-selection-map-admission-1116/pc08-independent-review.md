# PC08 地图返回按钮独立复审

结论 **PASS / CODE_SCOPE**，findings/unresolved为空。产品 `70664a691705bac5e9bb2b57c53ca2e1137b9ae3`（tree `2fe863db2fc4ec9b6bb9fc3514f2d5b0b9c54e99`）；最终证据HEAD `e7fa9106f77a430595b8fc6f0b42e53776fe20c3`（tree `a289024612515248787f8233320ff51083f7262a`），base Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。作者与评审者独立，13路径完整覆盖。

正式返回按钮复用最终选角cancel四态低控件旗帜，保留原previewBack/hit/label、实时正文、routeClose动作与token。独立生成树验证同一输入对象、仅一个原生hit、四态flag完全同源、default不变、24px正文与安全区；位置[-510,-235]、180×60在4种画布中满足安全区。正常节点的保守1.5倍包络最左-420与按钮右沿-420不交叠；作者实际Host另外检查可见当前/可达节点的旋转与pulse包络。

独立小探针通过：真正无cursor能力的正式生成Host中，C档点击返回一次、重复回调拒绝，busy/requested/disabled门禁不变，Run/RNG完整快照不变。直接执行真实bindCommand的旧generation、外触点Up/Exit、EndDrag取消、focus前回调一次、Controller消费一次及退役旧监听均通过。mapReturnAvailable与menu/route权限、原触点和命令逻辑未放宽；仅增加官方face的既有hover/focus反馈与refresh状态重置。

作者11项/3场Host和Luacheck证据已读，未整套重跑。父JS实际生成official后完整执行support Lua，原raw Lua未删除或省略。独审发现RED日志空白使完整diff-check失败，e7fa只修可读空白和文档：1571字节原始RED另存732字节gzip，逐字等于旧Git日志，非空白正文不变；现完整base..HEAD diff-check通过，产品/测试无增量、工作树clean。

私图02未访问；24px及安全区源码检查不代表正式字体/像素通过。Source/CI接续、Full/Hosted、正式candidate导入/ready、官方容量及PC/实体手机均未验。不外推bcca分页组合或#692接续；实际base变化需重绑复审。

详见 [JSON](review-pc08-map-return.json)、[独立探针](pc08-independent-probes.json)、[Host日志](pc08-independent-host.log)。
