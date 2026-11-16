# 守卫115行接入的最小安全边界（只读分析）

基线：归档源码 ba7c04af；具体实现须按最新 Release 再复核。没有改仓库。

## 当前路径不是按敌人图元数分配

- scripts/monster-art.mjs:65-75：唯一 AbyssMonsterActor 模板，nativeArtPool(art.poolCapacity)嵌入模板。把115行加入同一poolCapacity会令所有实例预留115槽，不能达到小怪41槽。
- scripts/build-ui.mjs:164-166：只登记一个actor模板。
- src/lua/abyss_monster_surfaces.lua:selectRows：所有actor无条件allocate(api.templateIndex,... )；记录按entry.id复用。
- src/lua/abyss_monster_art.lua:newPool：现有控件以actorBox:GetChild('monsterArt')找到预制层级。不能把某个任意动态子控件命名后假定GetChild能找到。
- src/lua/abyss_ui.lua:215-225：bridge只认Actor、Power、ReadyCardGroup三种索引→名称映射。
- scripts/build-native-candidate.mjs:213-215校验唯一actor模板与源码完全一致；294-296只绑定唯一actor实际索引；scripts/audit-native-candidate.mjs:188-189同样。

## 最小“不猜引擎行为”的可行方向

额外构建一个明确命名的完整`AbyssMonsterActorLarge`（115槽），保留原`AbyssMonsterActor`小模板（41槽），不要先做动态替换美术子树。二者均沿用既有完整实例创建、血条/意图/输入绑定及销毁路径。根据已验证definitionId→所需slots映射，在首次创建时选小/大模板。

此方案只使用已经支持的具名业务模板与返回句柄；不依赖动态挂载后的GetChild猜测。代价是保存两份轻量actor模板定义，而不是所有怪物分配115实例槽。

## 不能声称是已经验证的小修

至少同步修改并验证：
1. build-ui模板注册与sourceInputs；candidate生成、strict审计及实际索引回执。
2. monster_actor_binding增加实际largeTemplateIndex并校验唯一正索引。
3. abyss_ui bridge新增Large名称映射，与component binding.templates一致。
4. surfaces首次分配选模板；同actor.id若definition变成另一预算必须明确处理，不能静默溢出。生产当前setup通常新serial，但测试仍需负控。
5. 大→小→大、混合怪物选敌/死亡、重入退出、分页、创建失败/引擎析构中断、bridge真实语义树及候选严格审计均要覆盖。

若不做这些，就没有可证明的安全办法把115行塞进41槽。动态美术子树单独分配虽然最终更省模板重复，却还需明确返回句柄交给Art管理、拥有权、回收、bridge映射及模板绑定，变更面更大。直接复用Portrait controller也要处理独立动画/着色/生命周期，不能当无成本捷径。

## 本轮建议

当前发布修复以所有42敌人可识别、不误绑、已有小池为目标。守卫保留现有清楚回退，不为一个115图元细化稿额外放大所有小怪；上面的双actor模板作为下一次独立优化。maskless115行文件和几何回执已可复用，但不等于生产接入已完成。
