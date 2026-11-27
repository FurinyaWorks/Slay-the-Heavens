# 岩旅行者技能图标 A · 75 张隔离候选

这是后续版本的美术候选，**不会接入生产构建、不会替换任何现有卡框或线上图标**。只提供透明前景、可复现生产方式及隔离原生组装验证。现行 75 张以岩旅行者初始牌组及原始三档职业卡池的并集为准，与现有美术目录双向核对：32 攻击、29 技能、14 能力。状态与诅咒不在此包。

## 生产顺序

1. **锁目标。** 用 `extract-roster.py` 从最新目标基线重读牌池、已有美术目录和生产本地化生成器，输出真实显示名、效果、目标及基础/升级描述。中文名称不可从 STS 英文名或原始牌表反推。逐卡按稳定 ID 追踪。任何牌名或机制变动，旧评审不能直接继承。
2. **先一句图区分。** 分开写牌的实际机制、玩家在小尺寸应该读出的动作、容易撞的其他牌、参考图中借鉴的具体笔画。参考只用于学习轮廓、负形和主次，不把官方位图或私人截图打包。图元精度无需承载具体数值，数值由牌文承担。
3. **分批画透明前景。** 120×82 左上原点，至少留 1 px 安全区；采用五档接近原神岩系的浅色阶，优先单主形、一到两个辅助形、宽负形。底色按牌型已有结构提供，禁止复制进每张前景。用户认可的六张以源文件 SHA-256 锁定，不参与自由重画。实验 B 的 6 层装饰不是 A 的依赖。
4. **按实际图片控件降本。** 比较量化时同时保留 120×82 / 60×41 样图。用项目原生三角求解器编译；交给独立工程审核者核对退化、出界、反射、半遮罩、序列化和预算。每张目标 ≤60 个图标图片控件，底色、宿主和遮罩另列，不能把源多边形数写成运行时控件数。压缩先去无语义细线，所有轮廓变动重新送审。
5. **独审不是出图。** 另一个人先看去名、去数值的小图，先写读到的动作和目标，再揭示本地化文本和对照组。反击触发点、多击/群攻、固守/新增格挡、抽取/消耗/复制等成组对看，错读标 HOLD，指出具体现象。回到权威名与现有可靠画稿局部改，不覆盖已审源。真实卡框内再查遮挡、对比度、体积和 10 手牌预算；固定基线/输出摘要，审批绑定实际图而非审查人的一句话。

## 批量复用

沿用[卡牌插画规范](../../docs/art/CARD_ILLUSTRATION_STANDARD.md)的 ART-00～ART-12 与 4/8/16 自适应批次，不为岩旅候选新建另一套任务台账。每批初稿先校验重复 ID、路径自交、面积守恒和实际图元上限，再盲读。两张出现同一种误读时暂停同类牌，先修两张再扩；只改被退回的稿，保留其他牌和评审证据。透明素材、数据、独审与设备证据分别留档。新角色不要照搬岩旅对象或配色，要重新定代表牌、身份证据和生产合同。

`blind-sheet.py` 可输出无名、无类型、同底色的两档缩略图，先记录编号的自由读法再开答案。用 `record-review.py` 将独立离线结果绑定到源 JSON 和预览 PNG 的 SHA-256。离线审核不会把原生安装或正式发版状态改为通过。

## 如何复现

依赖：Python 3、Pillow、NumPy；出中文对照板需 Noto Sans CJK。Lua 测试使用项目兼容的 Lua 运行时。所有生成目录为本地文件，不需要联网，不需要私有贴图；正式原生整局场景继续复用仓库 Simulator 工具链。

**复现已归档批次：** 图稿和工具与牌表是两份不同的输入，不能把实验分支的 `HEAD` 当作牌表基线。从包含下列两个提交的 Fork A 克隆目录运行：

```sh
set -eu
ART=0efdc18d3310c670b448c0f780d9f3cef351f2c4
BASE=aaf8008875896f24acc8fda0d4df47df2564ec1d
W="$(mktemp -d)"
git worktree add --detach "$W/art" "$ART"
git worktree add --detach "$W/source" "$BASE"
D="$W/art/experiments/traveler-card-icons-a"
SOURCE="$W/source"
G="$W/generated-receipt"
mkdir -p "$G"
export PYTHONUTF8=1
python3 "$D/extract-roster.py" "$SOURCE" "$G/roster.json" --commit "$BASE"
python3 "$D/compile.py" "$G/roster.json" "$G/generated" \
  "$D/accepted-six.json" "$D/attack-one.json" "$D/attack-two.json" \
  "$D/skill-one.json" "$D/skill-two.json" "$D/powers.json" --sheets
python3 "$D/pack.py" --roster "$G/roster.json" --pinned "$BASE" \
  --tri-solver "$SOURCE/scripts/art/native-triangle-placement.py" --art "$G/generated" \
  --native-overrides "$D/approved-native" --semantic-index "$G/generated/semantic.json" \
  --out "$G/native-pack.json" --allow-pending-review
python3 "$D/validate.py" "$G/native-pack.json" "$G/roster.json" --pinned "$BASE" --art "$G/generated"
python3 "$D/test_validation.py" "$G/native-pack.json" "$G/roster.json"
python3 "$D/test_runtime.py" "$G/native-pack.json"
python3 "$D/record-review.py" "$G/generated" "$D/static-review.json" "$G/static-review-bound.json" --authoring-only
(cd "$SOURCE" && node --test tests/warrior75-names.test.mjs)
python3 - "$D/verification.json" "$G/native-pack.json" <<'PY'
import hashlib, json, sys
from pathlib import Path
expected = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["generatedPackSha256"]
actual = hashlib.sha256(Path(sys.argv[2]).read_bytes()).hexdigest()
if actual != expected:
    raise SystemExit(f"pack SHA-256 mismatch: {actual} != {expected}")
print(actual)
PY
```

已从两个固定提交全程重建，75 张、名称测试、负例、Lua 模板回放与 75 份独审绑定均通过；包 SHA-256 与 `verification.json` 一致。该 SHA 是上面带待审开关的离线包，不是原生发布批准。工作树验证完毕可用 `git worktree remove "$W/art"` 和 `git worktree remove "$W/source"` 清理（输出在第三个目录，不受影响）。

**生产新批次：** 将 `BASE` 改成审定的最新内容提交并重抽名单，生成新收据，不比较旧包 SHA；牌名或机制有变则送回复审。可复用分批画图、盲评与图元验证步骤，但 `extract-roster.py` 的初始牌组、目录和 75 张断言是岩旅行者专用。换角色时先接入该角色正式牌池、本地化和素材目录，再锁定新的内容与图稿提交。

带待审开关的输出只准离线出样。正式实例必须移除该开关并以独立评审记录锁定每张图。隔离适配器不得从现有生产注册表、UI 装配器或发布配置导入。本实验的本地编译与夹具测试不证明千星 Editor/GIL、正式资源实例数量、PC/手机画面、FPS 或发布资格。
