# PC07 / PC19 有界诊断原始记录归档

本目录仅保全 2026-11-16 已有诊断与独立核对记录，未修改产品或 Backlog，未重跑 Host、探针或测试，未读取私人 PNG，也未收集任何 generated 目录。`manifest.json` 明列33个原始文件的来源相对路径、原始字节数、SHA256、bundle与成员路径，并固定两个压缩bundle的完整hash。归档完成后已从落盘bundle解压回读，逐项核对成员集合、原始字节、长度与hash；这是归档完整性检查，不能视为新增产品验证。

## PC07：保留症状，未确认产品缺陷

归档来源是既有 `pc07-source-intake.json/md`、audit/interpretation/topology脚本及stdout/stderr、开放PR快照、#672/#684快照与Release684地图diff，共14项。既有基线为 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。

原有离线完整GameUI/Map装配覆盖12个固定seed、684个状态。357条节点/图例矩形接触可分为：336条shadow box保守矩形；7条circle corner外接方形假阳性；14条transparent hit接触。没有已证实的solid可绘制实体遮挡。阴影真实alpha未采样，约0.073px圆角间隙不构成平台抗锯齿或真实观感结论；不能扩大为“像素完全不重叠”或“PC07已修复”。图例无cursorArea/presetButton，也没有本轮实证证明其拦截点击。

684状态、24张拓扑分布及视口公式仅解释受控离线几何；原私人图01、实际候选、seed/act/currentNode/scroll/canvas均未取得，无法复现用户“上段偏向一侧”的具体画面。不改变路线投影、拓扑、滚动、RNG或规则。PC07与TASK-4.13保持未验收。

## PC19：仅一个已有按钮复用路径

本白名单没有单独PC19 source-intake；有界来源是既有 `review-pc19-existing-footer.json/md`、三个Lua探针版本、两个runner版本和四组落盘receipt/stdout/stderr，共19项。独立核对结果只支持：受控 `golden_wing` option3 leave后保留的held `resultFooter`“继续”路径，已被 `bcca699509a159f21555d870f96fdfeca7191856` 的既有PC26共享按钮装饰覆盖；Release36为shared=false，bcca为shared=true。这不是新的产品修复。

两个源码中的 `golden_idol` 都是option2再option1，两步后phase=map且没有held footer；不能以node root confirm皮肤推定其终末event option也统一。私图05的文件名golden-idol与描述“金翼雕像”存在身份歧义，原候选/sourceId/像素未取得。大黑底、版式、其他事件/结果、独立disabled交互及完整PC19仍未验。

探针失败分层保留：`picker-bcca` receipt exit1源自“两个事件必有自然held footer”的错误假设；`picker-bcca-trace` receipt exit1源自直接调用旧private `actions.confirm.handler`并期待失效，绕过了公开输入归属路径。这两者不是产品RED。最终 `picker-bcca-native` 与 `release36-native-external-cli` receipt均exit0/error为空，采用公开 `ui:press` 和真实hit的Down→render→Up/Click检验旧触点；Continue前后完整Run/map含RNG保持相等。normal/hover/pressed有断言，disabled只作为其他面隐藏检查，没有独立禁用态交互覆盖。

另有交接提到首次baseline因本树缺少Fengari CLI依赖而在落盘前失败；本白名单无该次原始receipt或日志，故仅记录此证据缺口，不补造首个环境失败日志、不把它当产品失败。最终baseline明确复用bcca同锁CLI，生产模块仍从baseline本树加载；此与上述两个已经落盘的无效探针假设应区分。runner版本与最终receipt的CLI路径/hash原样保留，未运行或修正归档脚本。

所有Host结果仍为固定seed/人为节点初始化与native mock，不代表用户自然遭遇、官方导入、新ready、PC/手机或容量验收。PC19及相关任务保持未完成。

## 文件

- `pc07-raw.tar.gz`：14个既有PC07文件，按原始相对成员路径保全。
- `pc19-raw.tar.gz`：19个既有PC19文件，包括失败探针及最终receipt。
- `manifest.json`：明确白名单、逐项hash/大小、bundle完整hash与解压回读结果。

bundle可解压到新的离线目录查看；其中脚本只作历史记录，不应因本归档而自动执行。JSON内原绝对路径与生成文件hash是旧执行元数据，不表示本目录含有或重新检查了这些生成文件。
