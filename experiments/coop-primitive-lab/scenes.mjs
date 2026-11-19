import assert from 'node:assert/strict';
import {nativeShape} from '../../scripts/v25-battle-scene.mjs';

export const room = Object.freeze({min:1,max:2});
export const capacityCases = ['999','1000','1001','1100','split-A','split-B','nested','dynamic'];
export const budgets = {
  300: {enemies:400, hand:200, hud:150, effects:150},
  400: {enemies:600, hand:300, hud:200, effects:400},
  600: {enemies:800, hand:400, hud:300, effects:500},
};

const group = (name, children, position=[0,0]) => ({name,kind:'container',children,position});
const image = (name,position,size,colour='#34475C',sprite=100001) =>
  ({name,kind:'image',position,size,colour,image:sprite});
const text = (name,label,position) => ({name,kind:'textbox',label,position,size:[104,22]});
const make = (count, build) => Array.from({length:count},(_,index)=>build(index));
const pages = (nodes, pageSize=50) =>
  make(Math.ceil(nodes.length/pageSize),index=>group('page'+index,nodes.slice(index*pageSize,(index+1)*pageSize)));

export function inventory(nodes, ancestorVisible=true) {
  const stats = {created:0,visible:0,containers:0,images:0};
  for (const node of nodes) {
    const visible = ancestorVisible && node.visible!==false && node.active!==false;
    stats.created++;
    stats.visible += Number(visible);
    stats.containers += Number(node.kind==='container');
    stats.images += Number(node.kind==='image');
    const children = inventory(node.children??[],visible);
    for (const key of Object.keys(stats)) stats[key] += children[key];
  }
  return stats;
}

export function capacityScene(id) {
  assert(capacityCases.includes(id),'Unknown capacity case');
  const cells = (count, offset=0) => make(count,index=>{
    const i=index+offset;
    return image('cell'+i,[-480+(i%55)*17,260-Math.floor(i/55)*24],[12,12]);
  });
  if (id==='split-A') return {roots:[group('groupA',cells(550))]};
  if (id==='split-B') return {roots:[group('groupB',cells(550,550))]};
  if (id==='nested') return {roots:[group('nestedHost',[])],templates:[group('nested',pages(cells(1100)))],dynamicCopies:1};
  if (id==='dynamic') return {roots:[group('dynamic',[])],templates:[group('cellTemplate',cells(22))],dynamicCopies:50};
  return {roots:[group('flat',cells(Number(id)))]};
}

export function figure(pack) {
  assert.equal(pack.shapes.length,pack.budget);
  const k=245/pack.height;
  const images=pack.shapes.flatMap((shape,index)=>{
    const name='facet'+index;
    if (shape.type==='nativeTriangle') {
      const {cx,cy,w,h,rx,ry,rz}=shape.placement;
      return [{...image(name,[(cx-pack.width/2)*k,(cy-pack.height/2)*k],[w*k,h*k],shape.colour,100003),
        rotation:[rx,ry,rz]}];
    }
    assert(['rect','polygon'].includes(shape.type), 'Unsupported fit shape');
    const x=640-pack.width*k/2, y=338-pack.height*k/2;
    const placed=shape.box
      ? {box:[shape.box[0]*k+x,shape.box[1]*k+y,shape.box[2]*k,shape.box[3]*k]}
      : {points:shape.points.map(([px,py])=>[px*k+x,py*k+y])};
    return nativeShape({...shape,...placed,name,opacity:1},{image:{rect:100001}});
  });
  assert.equal(images.length,pack.nativeImages,'Data and emitted native image counts differ');
  return pages(images);
}

function segments(count, width, height, colour, sprite=100001) {
  return make(count,i=>image('segment'+i,
    [(i%20-9.5)*width/20,(Math.floor(i/20)-(Math.ceil(count/20)-1)/2)*height/Math.ceil(count/20)],
    [width/24,height/Math.ceil(count/20)*0.8],colour,sprite));
}

function card(index, count, view) {
  return group('card'+index,[
    image('edge',[0,0],[109,100],view==='A'?'#BF9864':'#7CB8BA'),
    image('face',[0,0],[104,94],'#1D303C'),
    image('icon',[0,7],[30,30],'#E2BC78',100002),
    text('cost',String(index%3),[-38,34]),
    text('name',index%2 ? '防御' : '打击',[0,-23]),
    text('owner',view,[0,-39]),
    ...segments(count-7,95,9,'#3F5265'),
  ],[-504+112*index,-246]);
}

export function stressScene(pack, view) {
  assert(['A','B'].includes(view),'View must be A or B');
  const budget=budgets[pack.budget];
  assert(budget,'Unknown stress grade');
  const partner=view==='A'?'B':'A';
  const character=figure(pack);
  const templates=[
    group('local',[...character,text('seat',view,[0,-136])],[-435,15]),
    group('partner',[...character,text('seat',partner,[0,-136])],[-232,15]),
    group('enemies',make(4,index=>group('enemy'+index,[
      image('body',[0,0],[112,114],'#728579',100003),
      text('intent','攻击',[0,77]),
      ...pages(segments(budget.enemies/4-3,103,84,'#859890',100003)),
    ],[40+146*index,24]))),
    group('hand',make(10,index=>card(index,budget.hand/10,view))),
    group('hud',[
      text('title','双人战斗 · '+view,[0,49]),
      text('energy','能量 3 / 3',[-480,15]),
      ...pages(segments(budget.hud-2,950,27,'#657989')),
    ],[0,256]),
    {...group('effects',pages(segments(budget.effects,750,180,'#E5AF66',100002)),[132,46]),visible:false},
  ];
  const modules=Object.fromEntries(templates.map(node=>[node.name,inventory([node])]));
  return {roots:[group('battle',[])], templates, modules, stress:true, seats:[{seat:1,playerId:'A'},{seat:2,playerId:'B'}], view};
}
