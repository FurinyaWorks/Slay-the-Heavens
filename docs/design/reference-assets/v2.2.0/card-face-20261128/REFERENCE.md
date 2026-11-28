# v2.2.0 现行共享卡面

2026 年 11 月 28 日的 Release 基线是 `95b003d41a229218916d20785145cd4a7e9583fe`。现行实施以该分支的正式有声 GIL 构建入口为准。正式构建启用 `official-assets-battle-v3` 和原生页面生命周期，使用 `stsReferenceChrome` 绘制共享卡面。[正式构建与回执要求](../../../../versions/V2-RELEASE-HANDOFF.md) · [固定基线的正式卡面装配](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/95b003d41a229218916d20785145cd4a7e9583fe/scripts/official-assets-layout.mjs)

2026 年 11 月 13 日的 Owner 修正确定了现行卡框轮廓、边厚、牌型和稀有度的参考范围。2026 年 11 月 24 日合入的 #940 接续了正文排版及超限查看。事件预览沿用正式卡面。锻造显示现有双卡，页脚在正式布局中已经左右分列。[设计决定](../../../UI_DESIGN.md) · [#940](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/940)

核对新证据时记录实际 Release SHA、构建入口和生成的卡面控件标识。用同一正式配置生成基线和候选，再对照现有卡面的尺寸、材质和按键位置。模拟器画面用于交互验收。官方客户端画面以正式候选回执为依据。
