# 商人分页：已容纳短句的离线修复

基线：`origin/develop@9f2f44e4`。本切片只处理现有字符预算内已有完整句末时，下一句开头被挤进同页后硬切的问题；不代表整个商人同句拆页问题已解决。

## 根因与样本

真实生产路径：`narrative.zh-CN.json` → `abyss_narrative` → `abyss_merchant.begin` → `paintSpeech`；手动 `tap` 与自动 `advanceSpeech` 共用页尾。旧实现用 `page * pageCharacters` 截取 UTF-8 字符，没有句末边界。逐字显示、点击和计时器都使用同一固定切分，故并非原文主动分段或仅交易状态导致。

当前通用气泡正文为44×64、字号14、预算9字符；official投影正文104×48、预算12字符。源码中的投影配置不等于本轮官方截图或字体实测。本次不改这些参数、文案、交易布局或交易行为。

直接运行生产商人模块，批准问候在预算9时的有效RED输出：

```text
greet budget 9: 「路不好走吧？来， | 看看有没有用得上的 | 。」
FAIL approved greeting keeps its complete first sentence on both native budgets
FAIL short sentences and their closing quotes stay complete when capacity permits
2 merchant pagination failures
```

修后首屏为 `「路不好走吧？`，下一屏从 `来，` 开始；9与12字符预算均保留完整第一句。短句 `「眼光不错。」` 仍完整展示。长句无预算内句末时保留原有硬切；例如无标点的20字回归首屏仍为 `「甲乙丙丁戊己庚辛`，全文拼接逐字相同。预算内的闭引号跟随句末；句末后闭引号超出预算、长句的完整语义分段仍未解决，也未擅自制定新规则。

实现预计算每页末尾，现有逐字、点击加速、自动推进和收起/重读均读取同一结果。重复改动的防回退点是直接断言生产问候第一页、预算9/12、完整拼接、末尾引号及tap/auto等价；原真实UI生命周期测试仍验证购买、拒绝、连买、隐藏暂停与离店，结束判断改成实际字符游标，避免继续依赖固定页长漏测。

## 本轮验证

`npm run build:data`、`npm run build:ui` 成功。沙箱首次子进程EPERM以及根目录缺Fengari依赖均为环境失败，不计有效RED；复用锁文件相同的 `integration-next/node_modules` 后获得上面的有效生产失败。

```text
node --test --test-concurrency=1 tests/merchant-dialogue-pages.test.mjs tests/merchant-dialogue-lifecycle.test.mjs tests/merchant-action-group.test.mjs
tests 6
pass 6
fail 0
duration_ms 12017.0806
```

新增分页夹具内5组覆盖短句/标点/闭引号、原长句硬限、全部真实台词无丢重及自动/手动等价、隐藏暂停与收起重读。另两个既有测试文件保留原生控件替身上的真实NodeUI交易和布局断言。上述为Fengari离线执行，不是官方客户端或设备实测。

## 阅读参考与未验边界

主控检索的[Ren’Py对白文本标签](https://www.renpy.org/doc/html/text.html#dialogue-text-tags)区分逐字显示、等待继续和段落暂停；[对白文档](https://www.renpy.org/doc/html/dialogue.html)说明普通对白的点击继续。这是官方框架阅读参考，不是原作或成熟游戏的实际试玩例证，不满足AC4的完整要求。

本轮没有候选构建、官方导入、新ready、连续画面、PC或实体手机实测。长句分页规则、阅读节奏和最终同条件用户人工确认仍待完成。任务全部AC由主控按证据管理，本附件不声明全任务Done。
