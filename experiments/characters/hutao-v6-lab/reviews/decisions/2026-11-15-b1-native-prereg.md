# B1 源码解释器追加预登记：V8 无 DOM 测试
- task: 胡桃机制独立评审; 2026-11-15; independent run ID unavailable.
- Candidate: v6-e-draw1-b1-20261115; full first-script source blob 3da512df7e62afdbfe49c7a8d47a781bebe65786.
- After initial static review we verified source's FIRST script has no DOM/network/host references. GitHub connector fetches this exact immutable blob; a restricted synchronous V8 new Function(firstScript + return ...) can run native HutaoGame without a browser. This supersedes initial materialization concern *for headless native-engine tests only*. It does not verify DOM, interaction, UI or official platform.
- No additional seeds, strategy search or enemy balance edits. Tests are preregistered fixed diagnostic fixtures; not natural win-rate data.

## Fixed tests
1. Frozen-source native engine boot: starter length 10, 75 cards, 69 rewards, 3 energy, 5 draw, 72HP, first relic unused.
2. E at 72HP, 3 energy, artificial E/heavy/guard hand with top normal, then heavy + guard; record HP/energy/block/mark and compare to old A under exactly same synthetic setup.
3. E at 6HP refused and state unchanged; at 7HP allowed, then no blocking and first real encounter's attack7 causes death despite relic's 4 block.
4. B1 E at full HP with empty draw and discard: pays cost, attempts draw but gets zero; reserve this as edge, not a normal opener.
5. Fixed natural-start seed 50242 from already predeclared shuffle holdout example: check hand/no-attacks and post-E next normal; this is illustrative not representative.
6. u10 归于安宁 in single foe encounter with marked 1HP target: 2 energy spent and kill block applied, but immediately cleared at victory; compare unplayed case. In encounter4 with two foes (first marked 1HP, second attack9), repeat to see whether block has defensive value when enemy remains.
7. Q healing threshold: HP36, butterfly2, fixed Q+normal, fixed 35HP foe, order Q->normal and normal->Q; compare same post-turn HP and enemy HP.
8. u18 适可而止 at HP34, butterfly2, fixed normal+u18, compare order and damage.
9. Area attack wildfire with butterfly2, two alive targets with equal HP, select target index 1 and record which enemy gets bonus, if any.
- For every case preserve actual output, expected, and assertion. Synthetic hand/HP/enemy modifications are only diagnostic, not natural rewards or true campaign.
- If V8 compile or source identity fails, label those tests BLOCKED, retain static verdict; never fabricate pass.
