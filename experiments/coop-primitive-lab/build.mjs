import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {room,budgets,capacityCases,capacityScene,stressScene,inventory} from './scenes.mjs';

const read = path => JSON.parse(readFileSync(path));
const seed = new URL('../art-tech-lab/seed.save.json',import.meta.url);
const runtime = new URL('./runtime.lua',import.meta.url);
const argb = (hex,opacity=1) => ((Math.round(opacity*255)<<24)|parseInt(hex.slice(1),16))>>>0;
const xy = ([x,y]) => ({x,y});

export function simulatorSave(name, scene) {
  const save=read(seed);
  const sampleRoot=save.assets.server.root.children[0];
  const samples=Object.fromEntries([sampleRoot,...sampleRoot.children].map(node=>[node.kind,node]));
  let guid=name==='capacity-split-B' ? 1073757500 : 1073755000;
  function convert(node) {
    const {kind,children=[],position=[0,0],size=[1280,720],pivot=[.5,.5],scale=[1,1]}=node;
    const rotation=Array.isArray(node.rotation) ? node.rotation : [0,0,node.rotation??0];
    const [rx,ry,rz]=rotation;
    const n=structuredClone(samples[kind]);
    Object.assign(n,{id:'n'+(++guid),guid,name:node.name,isRootContainer:false,
      visible:node.visible!==false,active:true,scriptMappingIds:[],giaRelatedGuids:[]});
    for (const t of Object.values(n.transformByPlatform)) {
      Object.assign(t,{offset:xy(position),size:xy(size),pivot:xy(pivot),
        scale:{...xy(scale),z:1},rotation:{x:rx,y:ry,z:rz},anchorMin:xy([.5,.5]),anchorMax:xy([.5,.5])});
    }
    if (kind==='image') Object.assign(n,{imageId:node.image,imageColor:argb(node.colour,node.opacity),
      imageSource:'StaticReference',enableMask:!!node.fill,enableFill:!!node.fill,
      fillAmount:node.fill?.amount??1,fillType:'Horizontal',fillHorizontalType:'Left'});
    if (kind==='textbox') Object.assign(n,{text:node.label,fontSize:16,minimumFontSize:16,
      fontColor:argb('#F0DEC0'),bgColor:0,enableOutline:false,horizontalAlignment:'Middle',verticalAlignment:'Middle'});
    n.children=children.map(convert).reverse();
    return n;
  }
  const roots=scene.roots.map(convert);
  const templates=(scene.templates??[]).map(convert);
  for (const root of [...roots,...templates]) root.isRootContainer=true;
  save.assets.server.root.children=roots;
  save.assets.server.selectedId=roots[0].id;
  save.assets.client.root.children=templates;
  save.assets.client.selectedId=templates[0]?.id??null;
  save.meta.name=name;
  save.assets.scripts=[];
  if (scene.dynamicCopies || scene.stress) {
    const bindings=templates.map(node=>`['${node.name}']=${node.guid}`).join(',');
    // The GIA exporter supports left-filled horizontal masks only. Retain mask
    // geometry in the template and restore the V25 right fill once on mount.
    const masks=scene.stress ? scene.templates[0].children.flatMap(page=>(page.children??[])
      .filter(node=>node.fill).map(node=>`{'${page.name}','${node.name}'}`)) : [];
    const config=scene.stress ? `view='${scene.view}',bindings={${bindings}},masks={${masks.join(',')}}`
      : `copies=${scene.dynamicCopies},template=${templates[0].guid}`;
    const source=`local EXPERIMENT_CONFIG={${config}}\n`+readFileSync(runtime,'utf8');
    save.assets.scripts=[{id:'lab',guid:++guid,path:'coop-lab.lua',source,
      controlId:roots[0].id,controlAsset:'server-control-template'}];
    roots[0].scriptMappingIds=[guid];
  }
  return save;
}

const write = (path,value) => writeFileSync(path,JSON.stringify(value)+'\n',{flag:'wx'});
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');

function build(fitDir,out) {
  mkdirSync(out);
  const cases=[];
  function add(id,scene,fit) {
    const filename=id+'.save.json';
    write(join(out,filename),simulatorSave(id,scene));
    const groups=Object.fromEntries(scene.roots.map(node=>[node.name,{...inventory([node]),directChildren:node.children.length}]));
    const layout=inventory(scene.roots);
    const templates=inventory(scene.templates??[]);
    const copies=scene.dynamicCopies??Number(!!scene.stress);
    cases.push({id,filename,sha256:sha(join(out,filename)),groups,layout,templates,
      templateGroups:Object.fromEntries((scene.templates??[]).map(node=>[node.name,inventory([node])])),
      dynamic:templates.created*copies,expectedCreated:layout.created+templates.created*copies,
      expectedInitialVisible:layout.visible+templates.visible*copies,
      expectedPeakVisible:layout.visible+templates.created*copies,
      ...(fit && {fit,modules:scene.modules,seats:scene.seats,view:scene.view})});
  }
  capacityCases.forEach(id=>add('capacity-'+id,capacityScene(id)));
  for (const budget of Object.keys(budgets)) {
    const path=join(fitDir,`fit-${budget}.json`), pack=read(path);
    const fit={rawPrimitives:pack.shapes.length,emittedImages:pack.nativeImages,
      sourceSha256:pack.sourceSha256,packSha256:sha(path),packBytes:readFileSync(path).length};
    for (const view of ['A','B']) add(`stress-${budget}-${view}`,stressScene(pack,view),fit);
  }
  write(join(out,'inventory.json'),{room,officialCapacity:'UNVERIFIED',physicalDevices:'UNVERIFIED',cases});
}

if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const [fitDir,out]=process.argv.slice(2);
  if (!fitDir || !out) throw Error('build.mjs <fit directory> <new output directory>');
  build(fitDir,out);
}
