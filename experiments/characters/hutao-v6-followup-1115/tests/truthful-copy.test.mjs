import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const file=process.env.HUTAO_COPY_FILE??new URL('../candidate.html',import.meta.url);
const page=fs.readFileSync(file,'utf8');
const scripts=[...page.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2);
function library(){
 const prelude=scripts[1].slice(0,scripts[1].indexOf('let g=new HutaoGame'));
 const context={};vm.createContext(context);
 vm.runInContext(scripts[0]+'\n'+prelude+'\nglobalThis.lib={CARDS,HutaoGame,conciseLines};',context);
 return context.lib;
}
function fresh(lib,hp){
 const g=new lib.HutaoGame(2);g.hp=hp;g.energy=3;g.enemies[0].hp=1000;g.enemies[0].maxHp=1000;g.enemies[0].block=0;
 return g;
}
test('hearth base/upgrade actual high/half-HP damage and exposed detailed text agree',()=>{
 const lib=library();
 for(const upgraded of [false,true])for(const hp of [72,36]){
  const g=fresh(lib,hp),power=g.newCard('hearth',upgraded),attack=g.newCard('normal');g.hand=[power,attack];
  assert.equal(g.play(power.uid).ok,true);assert.equal(g.hearth,upgraded?3:2);
  const before=g.enemies[0].hp;assert.equal(g.play(attack.uid).ok,true);
  assert.equal(before-g.enemies[0].hp,6+(hp===36?(upgraded?3:2):0),'Preserve original half-HP mechanic');
  assert.match(g.cardText(power),/半血/,'Detailed text must disclose the actual HP condition');
  assert.match(g.cardText(power),new RegExp('额外\\+'+(upgraded?3:2)+'伤'));
  assert.match(lib.conciseLines(power).join(''),/半血/,'Already-correct compact text stays correct');
 }
});
test('c14/u15 base/upgrade compact descriptions disclose turn expiry observed in actual engine',()=>{
 const lib=library();
 for(const id of ['c14','u15'])for(const upgraded of [false,true]){
  const g=fresh(lib,72),card=g.newCard(id,upgraded);g.hand=[card];assert.equal(g.play(card.uid).ok,true);
  const expected=id==='c14'?(upgraded?5:3):(upgraded?4:2);
  assert.equal(g.prepAttack,expected);g.beginTurn();assert.equal(g.prepAttack,0,'Actual next-turn reset must remain');
  const line=lib.conciseLines(card).find(s=>s.includes('首次命中'));assert(line);
  assert.match(line,/本回合下一张攻击/,'Concise label must match existing engine/technical description');
 }
});
async function reportWithLogs(){
 const lib=library(),g=fresh(lib,72);g.logs=[];for(let i=0;i<120;i++)g.log('probe-'+String(i).padStart(3,'0'));
 const original=JSON.stringify(g.logs),copied=[];
 const source=page.match(/async function copyReport\(\)[\s\S]*?(?=\ndocument\.addEventListener)/)?.[0];assert(source);
 const context={g,CARDS:lib.CARDS,navigator:{clipboard:{async writeText(text){copied.push(text);}}},toast() {}};
 vm.createContext(context);await vm.runInContext(source+'\ncopyReport()',context);
 assert.equal(JSON.stringify(g.logs),original,'Report must not change log storage');assert.equal(g.logs.length,100);
 assert(!copied[0].includes('probe-019'));assert(copied[0].includes('probe-020'));assert(copied[0].includes('probe-119'));
 return copied[0];
}
test('report export discloses retained latest-100 scope while preserving the existing limit',async()=>{
 const text=await reportWithLogs();assert.match(text,/最近100条/,'A capped report must disclose its scope');
 assert.equal(text.split('\n').filter(s=>s.includes('probe-')).length,100);
});
test('report buttons and victory caption do not promise a complete unbounded history',()=>{
 assert.doesNotMatch(page,/复制完整战报/);assert.match(page,/复制最近100条战报/);
 assert.match(page,/战报仅含最近100条日志/,'Explain scope where the user requests the export');
});
test('all 75 card identities/effects and the complete engine stay identical to the preserved source',()=>{
 const original=fs.readFileSync(new URL('../baseline/source.html',import.meta.url),'utf8');
 const oldScript=[...original.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)][0][1];
 assert.equal(scripts[0].slice(scripts[0].indexOf('class HutaoGame')),oldScript.slice(oldScript.indexOf('class HutaoGame')),'No engine, limit or state changes');
 const context={};vm.createContext(context);vm.runInContext(oldScript+'\nglobalThis.cards=CARDS;',context);
 const current=library().CARDS,old=JSON.parse(JSON.stringify(context.cards));assert.equal(Object.keys(current).length,75);
 for(const [id,c]of Object.entries(JSON.parse(JSON.stringify(current)))){
  delete c.description;delete c.upgradeDescription;delete old[id].description;delete old[id].upgradeDescription;
  assert.deepEqual(c,old[id],id+': ID/name/cost/rarity/effects/source metadata changed');
 }
});
