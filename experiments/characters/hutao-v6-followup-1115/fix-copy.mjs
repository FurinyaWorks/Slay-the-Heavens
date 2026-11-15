// String-only patch over exact 7c3 source. No mechanics, name or limit changes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='experiments/characters/hutao-v6-followup-1115';
const source=fs.readFileSync(dir+'/baseline/source.html','utf8');
const sha=s=>createHash('sha256').update(s).digest('hex');
const manifest=JSON.parse(fs.readFileSync(dir+'/source-manifest.json'));
assert.equal(sha(source),manifest.sourceSha256);
const edits=[
 {before:'每张攻击牌首个命中额外+3伤。',after:'本战半血及以下时，每张攻击牌首个命中额外+3伤。',count:1,issue:'M-01: disclose existing half-HP condition'},
 {before:"case 'prepAttack':line=`下一张攻击的首次命中额外+${e.n}伤害`;break;",after:"case 'prepAttack':line=`本回合下一张攻击的首次命中额外+${e.n}伤害`;break;",count:1,issue:'PRES-02: disclose existing turn expiry'},
 {before:'复制完整战报',after:'复制最近100条战报',count:1,issue:'PRES-03: end-screen request label'},
 {before:'复制战报',after:'复制最近100条战报',count:2,issue:'PRES-03: other report request labels'},
 {before:'胡桃 V5 五战战报 · 种子2',after:'胡桃 V5 五战战报（仅含最近100条日志） · 种子2',count:1,issue:'PRES-03: exported header'},
 {before:'提示：战报可以直接发给 AI 帮助分析卡牌和跨战生命经济。',after:'提示：战报仅含最近100条日志，之前的日志未保留；可以发给 AI 帮助分析卡牌和跨战生命经济。',count:1,issue:'PRES-03: explain omitted history'},
];
let candidate=source;
for(const edit of edits){assert.equal(candidate.split(edit.before).length-1,edit.count,'Unexpected source occurrence: '+edit.issue);candidate=candidate.replaceAll(edit.before,edit.after);}
fs.writeFileSync(dir+'/candidate.html',candidate);
fs.writeFileSync(dir+'/patch-manifest.json',JSON.stringify({sourceSha256:manifest.sourceSha256,candidateSha256:sha(candidate),candidateBytes:Buffer.byteLength(candidate),edits,
 scope:'Text strings only; same card IDs/names/effects/numbers, HP rules, 100-log array cap and prior interaction handlers',
 namingGate:'HOLD',productionEnabled:false},null,2)+'\n');
console.log(JSON.stringify({candidateSha256:sha(candidate),edits:edits.reduce((n,e)=>n+e.count,0)}));
