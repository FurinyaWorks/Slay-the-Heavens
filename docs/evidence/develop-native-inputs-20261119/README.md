# 原生默认输入预检：缺失背景原件恢复

目标基线为 `develop@62328bdac7703c3ab241e0ddb19e0fa05474f76a`，不是旧 Release 或旧 b166 候选。原生包装/官方验收仍由既有 owner 接续；本轮不改其工作树、任务归属或源代码。

## 已解决的输入阻塞

从该精确提交的 GitHub media 路径取回 `art/characters/key-visual/traveler-geo/official-landscape-v1/preview-native.png` 原件：**81,155 bytes**，SHA256 **e23d1daac5e7046f9119edbd6179fd16fa31abd245c24d395adfd1af31a91a43**。与该提交 Git LFS 指针、`asset.json` 和原构建器冻结哈希完全一致，PNG 签名正确。未用替代图、重新生成图或用户 Windows 文件。

另四件该配置需要的原始头像/立绘输入，从现有已验证授权工作树只读复制；每件按当前 Git 指针完整 SHA256 和 bytes 核验后，仅物化至本独立工作树。源资产仍以原 Git LFS 指针跟踪，未提交任何资产二进制或产品改动。

## 实际执行

`nativeAudioBuildArgs([])` 直接给出当前原生默认 flags：cards=false，menuBackground/selectionAvatar/battlePortrait=true，monsters=false。按 `build-native-candidate.mjs:prepareBuild` 的实际数据/UI 子进程执行，不调用 GIL 构建器或 native client。

- 原始指针树：build-lua-data 成功，build-ui 失败 `Background budget data changed`。
- 精确原件物化后：数据/UI 两步均 exit 0。
- 因果负控：保持其他四件输入不变，仅恢复背景的 130-byte LFS 指针，真实 build-ui 仍拒绝；再只翻转原图末尾一个字节，也被原哈希门禁拒绝。两次均 exit 1、同一错误，最终恢复原件。
- 最终原生默认数据/UI 两步再次 exit 0，生成 24 个文件；643 件选择来源中没有未物化 LFS 指针。构建前后 sourceInputs 的完整字节摘要一致。
- 初次附加 portrait inventory 读取遇到本工作树未安装 luaparse；按锁文件执行 npm ci --ignore-scripts 后完整预检通过。准备失败原始输出未删，不计为产品失败。

背景离线库存按原合同为 4,500 图元、4,577 动态控件；这不是官方容量、设备性能或已写入的候选证明。完整命令、负控、物化清单、643 条输入身份、24 条输出身份及预检脚本见 `validation-logs.tar.gz`，摘要见 `receipt.json`。

## 仍未做 / 下一步

没有调用 native toolchain，没有 `.gil` 写入/读回，没有官方导入、ready、GUI、实体手机/PC、Full 或 Hosted CI，也没有发布。当前 sourcePayloadDigest 不含尚未提供的 native encoder/toolchain 输入，不能冒充完整候选 receipt。

原先“缺精确背景 PNG”这一项已解除。下一步仅由既有包装 owner 使用本精确输入及其已确认的 official base GIL、匹配 native toolchain，在真实目标组合生成完整候选 receipt，再进行官方导入/ready 和同候选设备验收。本轮不复制包、不替换底图或工具链、不扩成产品任务；不创建 PR。
