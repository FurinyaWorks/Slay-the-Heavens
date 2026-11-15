# 独立复审：PC21 旅行者接地阴影

结论：**PASS_SCOPED**，无代码发现。仅审 `36b9b157ee6f05b65eb9f1da7e2978647d36c210` → `862c3f2a8988b1af21fc897d6de1d65650798a0d` 的五条路径：build-ui、official-portraits、feedback_actor_painter、JS/Lua阴影回归。复审者未参与实现。没有审整合HEAD，也没有批准Release合并/发布。

## 代码与证据核对

- 三个生产文件与来源 `8b1a591b` 的新增/删除行完全相同；被审五文件规范化LF后均与精确HEAD逐字相符。没有带入来源已存在的health painter或后续idle改动。
- `officialAssets` 只由既有build选项传给挂载器；默认profile与battlePortrait禁用路径不增加阴影。正式battle启用时，恰好在原 `officialFigure` 中增加一个首位image，使用既有ellipse资源100002与怪物ground色，`raycastTarget=false`。它不增加输入监听、命中面、独立owner或新生命周期。
- 足位来自已有严格hash验证的approved idle，独立计算得到中心x=1.5、groundY=-93、宽127、高15.875。最低opaque足部在band18，其sourceY=537.7734375，既有idle场在y>=490为零位移；阴影与不动脚部共用figure父级。action位移及非等比缩放同属该host，因此不会把旧整身idle叠到脚底。
- player分支才查找/染色阴影，alpha复用同次死亡alpha；怪物、原HP渲染与原反馈时序未改。静态shadow属于原figure，准备/跨页/继续/死亡/重开/release/engine destroy沿用该host隐藏与退役，未建立可残留的独立控制器。

测试不是仅复算实现公式：JS同时检查唯一新增节点、原控件/输入/变换完全相同；Lua使用真实生成的7303条approved图元，硬断言足位数值，并取实际最低opaque图元的变换后脚底，检查完整2.2秒idle和非等比action后与shadow ground相合、Run/RNG未变、怪物不进入player lookup、死亡alpha、缓存复用及退役。

只读查看并核对保存的RED2/2、修后及增强后GREEN2/2、相关9个JS文件67/67与工程原始日志；其SHA256与长度写入 `review.json`。本复审未把读日志称为重跑测试，未增加回归/Full/GUI操作。工程日志为351模块、6166/6166测量、1988边，无新增Luacheck诊断，6项历史warning保留。

## 未验边界

`fast-plan.json` 明确要求Full，尚未执行，不能以本次独审或已有定向结果替代。正式候选、官方导入/ready/容量、PC及手机实际像素、GPU抗锯齿和阴影观感仍未验。仅可将本报告用于上述精确源码切片的独立复审证据，后续组合必须继续原Release准入。
