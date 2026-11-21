# 0002 Power 显示成员与行为调度

## 背景

`abyss_power_order` 调用 Schedule 记录成功应用，Schedule 再延迟导入 Order 移除怪物显示成员。两次调用组成完整依赖环。两种序列各有现行消费者：显示成员用于状态展示和可脱离事件帧，行为调度记录 hook 的获取顺序。

## 决策

把已有显示成员操作及来源优先级移入 `abyss_power_membership`。Order 以同一普通 Lua 表继续提供已有方法槽；Schedule 经该表移除显示成员，执行时读取可替换的 `remove`。成员叶只提交 `powerOrder`。Schedule 继续提交 `powerScheduleOrder` 和 `powerScheduleSerial`；状态栈仍由 Actor 命令更新。

## 备选

延迟导入只能跨过冷加载阶段。传递回调可以解除反向导入，但这里只有一个可共享的显示职责，额外装配会扩大调用接口。选用 #714 的职责叶，在当前源码中以静态加载代替原候选的延迟成员导入。

## 后果及范围

保留同一公开方法表、稳定排序、写时复制、异常对象身份和怪物／玩家分支。成员叶拒绝依赖两层协调器，Schedule 拒绝回导 Order，AST 边界同时覆盖即时及延迟引用。独立旧新 VM、原生怪物回归和故意重引反向边验证此决定。[专项规约](../plans/2026-11-21-core-architecture.md)
