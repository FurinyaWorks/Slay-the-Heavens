# 2026-11-16 新荧立绘：同源精度试验

输入是本轮用户提供的透明战斗稿 [PNG](image%2820261116-034213%29.png)，不是旧手描。源 SHA256 为 c120a972f609d376be7cbec910dc93e971856d8710e1f80753a44192c99a2dc0。项目中的旧批准姿态源不在这里重复复制。

- [全身对照](lumine-native-tier-study.png)；[保细节透明参考](lumine-detail-reference.png)；[平衡透明参考](lumine-balanced-reference.png)。
- [原生矩形和混合试验](native-trials/)：同源轮廓保形，先对齐脸/双花/站姿，透明遮罩压缩；全身 1735/1245/1034/784 四个实际离线回执。其余为扫描点，只报告布局计数，没做控制器验证。
- [原生轮廓/三角试验](vector-probe/)：955/552 为图元数，未计完整容器、未上控制器，主要探索轮廓和色面的工具路线。眼睛/双花仍失真，**不作为通过版本**。
- 1245 = 1222 原生矩形 + 23 容器。头部 1×、身体和飘带约 0.78×同坐标；交界裁切保持透明，不是单张 PNG 作为游戏资产。原生 mock 的 120 次恒定位姿、回访和释放验证通过；未实现真正待机、PC或手机验证。

复现矩形和混合试验：Python 依赖 Pillow、NumPy。仓库实际探针复用已装的项目锁定依赖。先在本目录执行下列命令，然后在游戏仓库根目录执行对应的 runtime-probe.mjs（避免测试 fixture 相对路径失效）。

```sh
SCALE=1 TOL=23 ALPHA_BINS=5 python native-trials/fit-full.py "image(20261116-034213).png"
SCALE=.78 TOL=29 ALPHA_BINS=3 python native-trials/fit-full.py "image(20261116-034213).png"
SCALE=.65 TOL=32 ALPHA_BINS=3 python native-trials/fit-full.py "image(20261116-034213).png"
python native-trials/compose-hybrid.py
# 之后切换到 game 仓库根，选择上述某档的绝对路径：
node /path/to/archive/lumine/native-trials/hybrid-head1-body78/runtime-probe.mjs
```

轮廓路线需要 SciPy。运行 vector-probe/trace.py 24 30 2.5 或 18 60 4，然后 vector-probe/fit.py /path/to/game-repo；重复运行会覆盖该子目录的中间生成结果，但保留冻结的 probe955 与 probe552。
