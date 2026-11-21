# 49 项事件插画图元拟合试验

场景：正式事件槽 330×330 px，7 项默认随机、42 项显式进入。独立离线试验，不改游戏源码、事件登记、现有图库或 Release。

## 实际结果

- 49/49 有 32、60、96 图片控件上限三档。主对照用 **60 档**。以仓库 V25 原生导出展开后，再用 BeyondSimulator 0.5.2 逐张打开和导出，49/49 成功。每次只挂一张：**46–60 个图片控件 + 1 个根 = 47–61 个总控件**，并计入拆开的三角图片。
- 49 项独立 .gia 各 **40,089–54,599 B**，中位数 **54,357 B**，合计 **2,606,717 B**。60 档原生树和三档成本信息合计一个 JSON 为 **590,163 B**。这是实测离线文件字节，不代表整局 GIL 增量或官方关卡/服务器用量。
- 49 张独立 1254×1254 PNG 共 **93,038,393 B**，不进入运行时。神秘球体保持透明；软件对照底色只是预览。
- 数据表有逐图数量、误差、GIA 字节与 SHA。画面一眼可认的关键形状比数值误差优先；粗粒度 60 档不是 49 张生产画质验收。黏液金币的大泡轮廓还能看清；金翼金币容易丢失，圣职者脸部和双手发光细节损失明显。优先保背景大色块，手工精修关键轮廓，再考虑放开少数难图预算。

## 计数与限制

图片计数来自导出树和模拟器逐张读回，不是用原始几何行数代替。60 档无需分组，仅计一根；96 档多组后最大 **99** 个总控件。实际接入建议复用一套池，只显示当前事件，保留现有事件图标作兜底；不要同时挂 49 棵树。正式场景的额外裁切和挂载成本仍需测量。

38 张的 60 档使用横向半三角，共 268 个图片控件。共用实验 GIA writer 保存左向蒙版，需按既有实验在挂载时恢复右向填充，或以无蒙版图形重拟合；本轮只用 GIA 衡量实际序列化字节与模拟器挂载计数，软件几何画面对照不是 GIA 像素等价验收。官方导入、关卡容量、服务器容量和真机性能均未运行。不要把自动化试验结果视为发布或正式素材批准。

## 复现

使用已有目录中的 49 张 PNG，文件名采用 event_id；先核对成本表的源 SHA。已测试 Python: numpy==2.3.5, Pillow==13.0.0, opencv-python-headless==4.12.0.88, shapely==2.1.2。

    python experiments/event-primitive-fit/fit.py . <独立PNG目录> build/event-fit --workers 6
    node experiments/event-primitive-fit/export.mjs . build/event-fit build/event-fit-export
    node experiments/coop-primitive-lab/run.mjs build/event-fit-export/scenes

固定 simulator 0.5.2 按 experiments/coop-primitive-lab 的安装说明。沿用 TASK-94 的色区提取、单轴三角位姿及仓库矩形性能包作为两个候选家族。对同一缩小图比较偏重边缘的平均误差，仅作自动选档，不代替人审。没有调用角色专用的眼、鼻、口局部拟合。使用的仓库工具与源码基线 18c733c9 及本任务分支的转换入口逐字节一致。

**资料隔离**：公开技术分支放复现脚本、摘要和逐图收据，不含待审重绘、拟合图形数据、导出 GIA 和任何原版素材字节。这些只在隔离 Git 资料分支与私审流程保留。批准公开或确定私有目标后，完整 PNG 用定向 Git LFS，图元 JSON 和索引用普通 Git；不得推送缺失真实 LFS 对象的指针，也不把原版参考 PNG 放入仓库。

## 半三角导出复验（同档、零额外控件）

建议这个离线实验的独立 GIA 导出使用 --mirror-left-masks。共享的实验 GIA 序列化器只写左填充；对已有中心横轴的对称图片 100003，把左填充控件的局部 X 单独镜像，保留宽高、中心、Z 角和纵向镜像。原始右填充图元仍保存在控制树数据，供将来走正式编码器；镜像仅用于实验 GIA，不修改游戏正式渲染或原生库。

使用中性三角对照，旧左填充与真实右填充相差 4,382–4,406 个像素；左填充加横向镜像后，在直放、旋转及旋转加纵向镜像三场景均为 **0 像素差**（含 RGBA）。真实 GIA 每场景仅改变四套平台的 X 缩放符号位，大小不变。按此选项重导 49/49：每项控件数、字节数均逐项不变，仍为 **47–61 / 单张，2,606,717 B 合计**。原始文件 SHA 保留在首轮成本表；新 SHA 见 half-mask-recheck.json。模拟截图和二进制并不等于官方导入或手机美术验收。

    node experiments/event-primitive-fit/export.mjs . build/event-fit build/event-fit-mirror --mirror-left-masks
    node experiments/coop-primitive-lab/run.mjs build/event-fit-mirror/scenes
    node experiments/event-primitive-fit/probe-half-mask.mjs build/event-mask-probe
    python experiments/event-primitive-fit/verify-half-mask.py build/event-mask-probe --receipt build/event-fit-mirror/scenes/simulator-all.json --baseline experiments/event-primitive-fit/event-fit-summary.json
