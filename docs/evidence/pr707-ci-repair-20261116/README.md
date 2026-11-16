# PR #707：现有 CI 红项最小修复

来源 HEAD `6a1cfb35db36bb3efa1433ee0e54b86d6301f80d`，Release BASE `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。

托管 run 43843822897 的 POSIX5 job 133266123697、POSIX6 job 133266123915、Windows11 job 133266123939 原日志确认三处同源失败；没有重新启动 Full。

- Draft/Fast 投影在任何逆向前保存原输入，部分迁移/重复/改变策略的拒绝路径不再提前剥掉 publication gate。
- selection-map 历史断言使用已有完整源认证后的精确历史视图。原 live 输入、生产身份、未知/尾字节及所有旧 pin/库存保持；修改测试自身完整新字节也经精确 SHA 映射回原档案，不重写历史包。
- 最终 draft helper `357ad5c4d68378063b02cf75396f804c8c2b61d12a925595663a4b533948e4e6` 只映射到原完整 `5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986`，不会接纳未知字节或其他路径。

Node v24.22.1 定向验证：summary/selection 两文件 16/16；原失败 combined-closeout 单项 1/1；Release cases 7/7；ci-impact 单文件 14/14（包含上述 7 项 cases，不重复计数）。新增负控覆盖 LF/CRLF、CRCRLF、追加/删首、非字符串、foreign 路径与 Buffer 保留。附同轮日志，不冒称本地 Full 或 hosted 新头通过。首次本地加载因 Git LFS 指针及 npm 默认缓存路径缺失而中断，恢复精确 LFS 内容及临时缓存后执行；两份材料化历史 gz 不作为改动提交。

独立评审由另一 Agent 只读进行；结果绑定候选提交后另行记录。不修改 workflow、保护、生产代码、游戏数据或任务状态；Backlog CLI 不可用，未手改 Backlog。Hosted 必需检查及合并仍待后续真实结果。
