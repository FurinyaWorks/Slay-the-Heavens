# Picker actual Release 1cc continuation

状态：SOURCE_CI_VERIFIED_PENDING_NEW_INDEPENDENT_REVIEW。原产品七路径未变；本轮只解决真实 Release 合流后的 Source/CI 接续，未完成官方或设备验收。

- 原 HEAD / backup：bcca699509a159f21555d870f96fdfeca7191856 / refs/heads/backup/picker-controls-before-release1cc-20261116
- 实际 Release：1cc5479b713edab6fd26db4e20f8eb22b7401cb2，单父36b9b157；真实双亲 merge：afacf12a9e72182fbd31efcbf0968e6f618d39a1
- packet 输入代码：2f522633ac7a2c8c6feb6fbb8ca08910cc519564
- 新 code + packets 冻结：ffd8905ea415c04dc6e3f1125743e78963809234，tree c7f69be6265657e7b61c095f6949651f83ad10aa
- 原 product93ae、source9ff评审与全部旧证据保留。不是对新叶的独立评审。

## 来源与完整历史

全部352来源（351 Lua + architecture）在1cc/36的Git blob逐项一致；完整等价证书固定SHA256 4678cdb4036cab5217a359657ae15735c7a2af47936ec58067018dd2d53c9dfa。不推进原生产epoch，原8846606f生产packet、producer93ae和copy helper保持原blob。

新CIpacket为8f63e3cb7ee9b5a81139b4193589ce6f098e423d43b576d190925411681776fe，25条after逐项绑定已提交代码2f522633ac7a2c8c6feb6fbb8ca08910cc519564，before逐项绑定真实1cc。原550daa97 packet完整原字节另存tests/helpers/release-picker-controls-ci-before-release1cc-source.json.gz，包括其全部20条原before/after；没有删除旧before、原bootstrap断言或任何历史gzip。bootstrap10条current完整原文逐项对上1cc真实Git，全部原before仍由原868f4e71档案保留。原92份档案、原产品与source证据41文件全部原Gitblob不变；当前96条immutable摘要全部核验。

投影顺序：当前picker→精确1cc→bootstrap current→bootstrap before→既有历史target。生产projector/隔离copy不导入CIleaf。新leaf排除自身packet，十key guard仅检查完整性，不能自证当前；最终独审必须读冻结leaf真实Gitblob、固定packet pin以及25个after/1cc before。

## 本轮证据

先保存实际合流红灯source-post-merge-red.log.gz：3pass/1fail，旧packet拒绝新calibration来源。之后Source及双方集成8/8、原owner/隔离copy7/7、双方raw CI2/2通过。全部原始gz与raw SHA256在validation.json。两份raw合同分别保持878JS当前库存与876JS bootstrap前驱、完整1423Lua。

forecast与60秒预留仍仅诊断。workflow、timings、shard成本及预算完全未改；Fast45/30、Windows托管45/可信本地75、POSIX30分钟硬guard和dispatch/ref条件原样硬验。所有原断言保留，未运行整套calibration。

## 边界

- No product Host, Fast or Full suite was rerun.
- No CI polling, push, PR, Backlog edit, GUI, MCP or input action.
- No production source epoch, product behavior or seven reviewed product blobs changed.
- Official candidate/import/readback/ready/capacity and PC/mobile acceptance remain unverified.
- Prior 93ae product and 9ff source reviews remain historical exact-blob evidence; this new source/CI continuation requires new independent review.

固定Node24.18.0，外部隔离TEMP；没有代理、依赖安装或系统配置改动。完整原20input旧/新blob、七产品blob、新25绑定、352等价、96档案及原证据逐文件摘要均在validation.json。
