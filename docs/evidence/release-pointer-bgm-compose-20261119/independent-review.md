# 独立复审：指针与致命错误停乐的真实来源合成

结论：PASS，无阻断。复审为只读，未修改源码、推送或启动 Full。不是 Hosted CI 或设备验收。

## 固定输入

- Release：`1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`
- 指针候选：`90ee3942272272a042c6120f524be5d7df839a36`
- 停乐候选：`3c8e7f133c05ba90b37cb4086adc641ce443bdae`
- 合成见证 SHA-256：`0c9825cfe9fa600dc703de2a109dc746ef893d9a0a757106113640c7d870426a`

| 文件 | 固定 Git blob |
| --- | --- |
| `tests/helpers/closeout-source-epoch.mjs` | `a3a61be38bf7a2cd1e5c3974f158ffae31a6b3df` |
| `tests/helpers/copy-integration-source-closure.mjs` | `dbb43a1da114e956ba9c367ef65030ff65c16651` |
| `tests/helpers/release-potion-enemy-source.mjs` | `20c7cd98434f79f2ebf1ba83bb933d68d4e153ad` |
| `tests/helpers/release-pointer-bgm-ci.json.gz` | `7f248e94cc940feffb8a85a776c840053143dd90` |
| `tests/helpers/integrated-ci-source.mjs`（原指针版不变） | `28424470fdfaf87d7cd9baf1fba036550a69bc71` |
| `tests/integrated-ci-source.cases.mjs` | `ddf62f94906ab81932e35fcb71b06064550b97a5` |
| `tests/release-card-contact-integration.test.mjs` | `d2c2660d216dd093fcefd2b13779b2b7d0350ade` |

## 实际核查

- 352 份现行生产来源、86 个完整历史目标、129 个 owner。`abyss_ui.lua` 早已属于指针版 129 owner；不错误增为 130。
- 两候选的 9+1 个产品文件逐字复用，各自 6 份既有 CI/production 档逐 byte 不变。
- 4 个合成 live 叶的 SHA 全部实读匹配，8 个 exact parent view 逐文本等于固定远端 Git 源。
- 任一旧 parent view 替换真正 current 的 8 个负控，均报 `fresh composed integration source` 拒绝。
- BGM 独占 `native-startup` 被当前重放识别；公共 string/Buffer 路径结果一致。BGM owner、指针 owner、outer 档的实时漂移在 `integratedSource` 和 `integratedRead` 均拒绝。
- 实际 copy 函数用 VM 只虚拟化目标写入，来源读取真实磁盘。四份新增相关依赖 copied bytes 逐字相同；各自 drift/missing 的 8 个负控、以旧指针/BGM helper 冒充 live 的 2 个负控拒绝，恢复后通过。
- `git diff --check HEAD` 通过。没有重写原 after SHA、隐藏新增 fixture、放宽 owner/target、混入 Develop 功能或接入新怪物/技能。
