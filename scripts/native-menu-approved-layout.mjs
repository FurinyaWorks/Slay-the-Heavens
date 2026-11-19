import { readFileSync } from 'node:fs';
import { flatTriangle } from './menu-flat-triangle.mjs';
import { nativeMenuTriangle } from './menu-red-scene.mjs';

const glyphs = JSON.parse(readFileSync(new URL('../data/presentation/native-menu-logo.json', import.meta.url), 'utf8'));
const sx = 1280 / 1672, sy = 720 / 941;
const controls = node => node.children ?? node.controls;
const find = (node, name) => controls(node).find(child => child.name === name);
const toStage = ([x, y]) => [x * sx - 640, 360 - y * sy];
const container = (name, size, children) => ({name, kind:'container', size, children});
const start = [[124,660],[486,660],[437,738],[72,737]];
const quit = [[124,758],[465,758],[418,831],[80,831]];
const ivory = '#F6DFC6';

function bounds(points) {
  const xs = points.map(([x])=>x), ys = points.map(([,y])=>y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  const centre = [(left+right)/2, (top+bottom)/2];
  return {centre, frame:[...toStage(centre), (right-left)*sx, (bottom-top)*sy]};
}

export const nativeMenuFrames = {start:bounds(start).frame, quit:bounds(quit).frame};

function triangle(name, points, colour) {
  return flatTriangle(points, name, colour) ?? nativeMenuTriangle(points, name, colour);
}

function polygon(name, points, colour, transform = toStage) {
  const vertices = points.map(transform);
  return container(name, [1,1], vertices.slice(1,-1).map((vertex,i)=>
    triangle('facet'+(i+1), [vertices[0], vertex, vertices[i+2]], colour)));
}

function titleLogo() {
  const parts = [
    polygon('rim', [[32,223],[84,140],[565,140],[595,191],[543,275],[62,275]], ivory),
    polygon('plate', [[36,223],[86,143],[563,143],[591,191],[541,272],[64,272]], '#3E1D21'),
    polygon('leftStroke', [[33,224],[84,140],[86,143],[36,224]], '#EB202C'),
    polygon('topStroke', [[84,140],[561,140],[559,143],[86,143]], '#EB202C'),
    polygon('lowerEdge', [[541,272],[591,193],[594,190],[543,275]], '#DA1725'),
    polygon('subtitlePlate', [[99,272],[428,272],[401,312],[71,312]], ivory),
    polygon('slashLeft', [[437,271],[457,271],[427,312],[409,312]], '#FE2530'),
    polygon('slashRight', [[466,271],[486,271],[455,312],[438,312]], '#FF252D'),
    polygon('tabLeft', [[69,108],[104,108],[62,150]], '#F4252C'),
    polygon('tabRight', [[118,108],[144,108],[111,141],[87,141]], '#DD1B26'),
  ];
  for (const [index,{colour,triangles}] of glyphs.entries()) {
    for (let offset=0;offset<triangles.length;offset+=48) {
      const batch = triangles.slice(offset,offset+48).map((points,i)=>triangle('glyph'+(offset+i),points.map(toStage),colour));
      parts.push(container('lettering'+index+'_'+offset,[1,1],batch));
    }
  }
  return container('approvedTitleLogo',[1280,720],parts);
}

function styleButton(button, points, primary, lift = 0) {
  const {centre,frame} = bounds(points), [x,y,w,h] = frame;
  button.position = [x,y+lift];
  button.size = [w,h];
  find(button,'hit').size = [w,h];
  const label = find(button,'label');
  label.position = [0,0];
  label.size = [218,52];
  if (button.name==='start') label.text.content = '开始游戏';
  Object.assign(label.text,{align:'centre',valign:'middle',fontSize:32,minFontSize:32,colour:ivory});
  button.children = button.children.filter(child=>child.name!=='menuAccent');
  const colours = {
    normal: [ivory,primary?'#84151E':'#351B1E'],
    hover: ['#FFF0D7','#B4222C'],
    pressed: ['#F8D6BB','#681019'],
    disabled: ['#A88C83','#403034'],
  };
  const local = ([px,py])=>[(px-centre[0])*sx,(centre[1]-py)*sy];
  const inset = points.map(([px,py])=>[centre[0]+(px-centre[0])*.982,centre[1]+(py-centre[1])*.91]);
  for (const state of controls(find(button,'v25MenuFace'))) {
    const [rim,fill] = colours[state.name];
    state.children = [polygon('rim',points,rim,local),polygon('fill',inset,fill,local)];
  }
}

export function applyApprovedNativeMenu(menu) {
  find(menu,'v25MainMenu').children = [titleLogo()];
  styleButton(find(menu,'start'),start,true);
  styleButton(find(menu,'titleQuit'),quit,false);
  styleButton(find(menu,'continueRun'),start,true,70);
}
