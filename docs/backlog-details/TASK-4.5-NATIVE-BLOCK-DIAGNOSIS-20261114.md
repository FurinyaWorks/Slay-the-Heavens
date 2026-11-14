# TASK-4.5 原生格挡回退：已定位，试改否决

本轮只有可重复诊断，没有通过产品修复。所有生产源码与 `9f2f44e4c79789fbcb64a515938765dbc240f830` 一致；实验保存在独立 `feat/native-block-digits`，不推送、集成或更改发布候选。

## 真实缺口

旧普通路径的 `chip` 随数字扩宽；`abyss_battle_unit_view.blockPartGeometry` 的 source 分支直接使用 `source.blockWidth`，忽略 `chip`。当前 `EnemyView.geometry` 给出 `64 × 1280/1920 = 42.6667` 宽，实际生成的原生 `AbyssMonsterActor.block` 使用24号且不允许缩字。三位数按现有字符预算需 `3 × .6 × 24 + 4 = 47.2`；这里确认的是预算失败，浏览器字形与官方实际裁剪仍不能互代。

另有实际矩形冲突：source芯片右边越过自身HP边框，拥挤阵形中部分芯片也覆盖左邻HP。不能仅扩大文字框后便声称所有多位数及五敌布局已修。

## 同条件实验

执行 `node experiments/native-block-digits/run.mjs`。两组在独立 Lua 进程运行同一夹具，复用构建器、GameUI、真实动态原生实例管理器和已有HTML导出。第二组只在内存中替换 source 分支，不写生产文件。当前源码输入和全部生产/生成 Lua 摘要、输出摘要见 [收据](../evidence/native-block-digits-20261114/receipt.json)。

| 断言失败次数 | 原版 | 仅扩宽并左移 |
| --- | ---: | ---: |
| 三位数字容量预算 | 32 | 0 |
| 自身HP净空 | 98 | 0 |
| 邻接矩形冲突 | 24 | 96 |

数量为分场景、分层重复断言次数，不是独立缺陷数。候选扩大邻接问题，结论 `REJECTED`。原始失败日志和两组真实导出保留，没有删去失败断言。脚本退出0只表示对照实验复现了这两组预期失败；收据的 `productStatus` 均为 `FAIL`。

覆盖1–5独立实例、Boss的1/10/99/100/999；另用真实 `sourceEncounter` 构造器生成 Lots of Slimes 与 Gremlin Gang 阵形并注入全员1/10。固定构造器随机边界和人为格挡不是自然获得或完整同局证明。重复渲染还核对核心字段、表引用、元表不变，零格挡隐藏及HP/角色source位置保持。

四张 [浏览器对照](../evidence/native-block-digits-20261114/) 已由主控查看。只保留HP/格挡子树，其余画面省略；SDK纹理仍未知，不能据此判断最终美术。旧Edge不支持Playwright检查器使用的 `element.checkVisibility`，ARIA自动快照报错；页面加载、普通截图成功，未将ARIA错误算作产品故障。

## 后续边界

不得直接采用本试改。下一修复需兼顾原有“HP左侧、格挡位置一致”的用户要求与拥挤时的真实空间，不能偷偷恢复旧头像搬移分支、缩小字体、改变source阵形/命中或删掉邻接断言。

已勾的旧AC1仅有旧路径证据，不能认证新source路径；本轮撤回该项勾选。旧自动回归和原版预览证据仍保留，设备AC4–7继续未验。无本轮官方导入、ready、PC或手机结论，不标Done。
