# Release 能量球断言：恢复桌面 Host 夹具

实际 Release 源 `ca97847a3144cbff26fd731b3fb412424b2e6aa9`，相同生产渲染器（SHA-256 `363b4b3031575daae77cd79c8a79c0458753c2f7b603f47a10c594d9bb4f096c`）。原始用例停在 `install`：夹具只传 `options={}`，生产 Host 明确有 `platform`，该方法会读取其中的 `mobileRunHud`。不将这个失败误判成能量球游戏逻辑或 #946 内容改动。

候选仅为原本桌面夹具补 `platform={}`，不启用移动 HUD、不改生产代码和原断言。用现有测试文件按名称运行，原夹具 0/1，补足后 1/1；同一候选上临时令渲染器永远用亮色，原断言「empty material must be visibly dimmer」仍准确失败（0/1）。变异只做负控，已恢复生产文件。先前 Release [POSIX 2 精确失败](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45396426003/job/138453678082) 同为缺失 platform。该记录只覆盖一个测试入口，并非 Full、引擎或真机通过。

从确切 Release checkout 并恢复仓库原有测试输入后，应用 `desktop-orb-fixture.patch`，定向复跑：

```sh
node --test --test-name-pattern='STS1 reference keeps the complete orb' tests/sts-card-reference-runtime.test.mjs
```

未修改 Release 或向其提交生产 PR。其它历史来源/版式／检出问题不由此补丁解释或解除；由现有发版验证负责人决定是否接手此夹具。
