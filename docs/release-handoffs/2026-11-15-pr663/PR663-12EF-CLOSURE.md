# #663 退回接续：12ef1a46 的 helper-copy 绑定
适用 HEAD `12ef1a4681a20919601f00561dd6762693a2b637`、BASE `e65d9b98fbec69442047650254238cd9244df805`。新 HEAD 保留原执行者的 WeakSet、Proxy 与继承属性校验。**不要再套上一轮 d378 的四文件 runtime 补丁**，这次只缺来源闭包接线。

[当前 Full CI](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43678809981) 已观察到 5 个失败分片同根：`copyIntegrationSourceClosure` 核对 runtime 时实际为 `ee54191f327d412a5e37a76ff236af6f4aac692e51884a0e3afd33fe62e427e4`，仍要求旧闭包的 `5341c965ce41e956f153caf90c2e2097ccaee447a2d1e53a5aa666d15a238882`。外层见证已有新 runtime 内容身份，但缺了复制闭包这一行；这与上一个 HEAD 的 Windows 超时不是同一个失败。

## 应用
由 #663 原执行者核对 HEAD/BASE 及两份已登记 LFS 原件；用本目录的 `check-witness-inputs.mjs` 可先快查。确认仍为本版本后，只移植同目录的 `pr663-12ef-closure-only.patch`（SHA256 `918e42ac80b3a5f71f6d1f4ae6e88a47e04e5c4f1f1ee346b999c75df7de0506`）。

```sh
git apply --check /path/to/pr663-12ef-closure-only.patch
git apply /path/to/pr663-12ef-closure-only.patch
node tests/helpers/generate-integrated-ci-source.mjs --write
node tests/helpers/generate-integrated-ci-source.mjs --check
node --test tests/integration-source-epoch.test.mjs
```

补丁只改生成器和严格 closure 清单，用不可变旧清单固定旧身份，并为该 runtime 增加唯一 before→after；提交时包含原执行者本地生成的两个对应文件，不接收本交接目录的历史压缩包。发布门槛、Owner 读、所有已冻结记录、超时和独审不变。新 HEAD 先接回独审、Full 与原生队列，不重跑旧 HEAD。

## 精确验证
- 用远端四个文件的 Git blob 重建真实 HEAD 树 `5ae6199b9f7bde33c9039949483c90bf89b699aa`；真实 copy 失败重现。
- 仅加上两处接线后，实际 copy 精确复制 runtime，原同一套源码合同 **41/42 → 42/42**，外层生成器 `--write` / `--check` 一致。
- 224 路径、1,344 历史视图、既有 closure 和测试库存原样保留；两份接线的 current 记录更新，新增一个 runtime closure。保留已提交 runtime 字节不动。
- 对已提交缓存实现另行跑 3 条定向合同和 12 条独立探针，通过。审查和定向结果不是托管 Windows/Full 成功或 2.0.0 放行；最终候选仍须同 GIL 真机验收。
- 本目录只存文本补丁和证据，不放素材、压缩见证、正式包或历史候选。交接分支不合入。
