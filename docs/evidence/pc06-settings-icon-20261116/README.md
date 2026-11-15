# PC06 原生设置图标最小复用

基线为Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`（#692合入后的精确新base）。仅复用#672作者`9c1fb9513422d67b89966a4b15fb8e1f01125e78`中`officialBattleUtilityFaces`的6行diff：官方设置四态从Unicode齿轮改为既有`theme.icon.settings=100161`、28px原生image；deck符号/count、配色、48px hit、状态映射及命令/位置身份保留。整个生产文件after逐字节等于作者该文件。没有搬作者Theme、HP/gold、menu y335或Lua前景差异。

Release没有`mobile-run-hud.test.mjs`，所以3个窄facet加入既有`official-run-chrome.test.mjs`，未新增raw父文件，原模块源码/断言去除新增块及imports后与base完全相等。原作者混合测试没有删改，也没有宣称全部通过：其额外画布断言依赖y335，Release仍为y338.5、48px hit上沿362.5，比设计画布360高2.5；该继承边界仅记录，未修、未放宽。

本轮结果：原Release36图标RED1失败；因base推进，在1cc同一窄facet再次RED1失败，均为真实text≠image。移植后3/3通过，覆盖四态、原hit与deck身份及实际default/candidate-art/v25/official生成负控。既有菜单布局5项与菜单pointer/controller/settlement、map单步返回共7/7通过；依赖build:data/ui均exit0。当前完整Lua生产来源单项1/1通过，未推进352路径/116owner生产epoch。

**现有CI来源仍有真实未修失败**：`integrated-ci-source.cases.mjs`为1失败/2通过，完整current guard拒绝本次修改的`official-run-chrome.test.mjs`绑定（旧hash4cac72f1…）。日志完整保留；没有忽略断言、修改归档或提前复制其它切片的source/CI适配。Root将按本轮实际hash/失败范围决定独立接续，故本片不是所有来源门禁全绿。

完整日志、原作者证明及source intake错误纠正以无损gzip保留，每项raw/hash/大小与解压回读结果在`source-manifest.json`。作者原3/3/11/11与独审只是已存在证据，未计为本轮当前通过。原“#672未改样式链”的错误说法已纠正为#672确有图标替换；图标复用不等于PC06棕色根因、色调或设备验收完成。

没有改产品范围外的Theme/Lua、sourceepoch/CI档案、workflow、timing或预算。未运行Full/Fast、整套Host、原作者混合测试、官方导入/new ready或设备试玩。没有PNG、GUI/MCP、Backlog写入或发布；root的Task4.16脏文件保留且不stage。
