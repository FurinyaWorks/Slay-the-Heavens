const bytes = value => Buffer.byteLength(JSON.stringify(value));
const parts = node => node.controls ?? node.children ?? [];
const rank = (rows,key) => rows.sort((a,b)=>b[key]-a[key]);

// Subtree rows overlap (cards sit inside pages). These are inspection rankings,
// not additive storage estimates or a declaration that hidden controls are dead.
export function productionCosts(modules,layout,templates,layers={}) {
  const imageReferences=new Map(),cardHosts=[];
  function visit(node,path,ancestorHidden=false) {
    const hidden=ancestorHidden||node.visible===false;
    let controls=1,hiddenControls=hidden?1:0;
    if(node.image!==undefined)imageReferences.set(node.image,(imageReferences.get(node.image)??0)+1);
    for(const child of parts(node)){
      const row=visit(child,`${path}/${child.name}`,hidden);
      controls+=row.controls;hiddenControls+=row.hiddenControls;
    }
    const row={path,controls,hiddenControls,jsonBytes:bytes(node)};
    if(parts(node).some(child=>child.name==='stsReferenceChrome'))cardHosts.push(row);
    return row;
  }
  const treeRows=[visit(layout,layout.name),...templates.map(tree=>visit(tree,tree.name))];
  function subtree(node,path,hidden=false){
    const nodes=[node],invisible=[hidden||node.visible===false];
    for(let i=0;i<nodes.length;i++)for(const child of parts(nodes[i])){
      nodes.push(child);invisible.push(invisible[i]||child.visible===false);
    }
    return {path,controls:nodes.length,hiddenControls:invisible.filter(Boolean).length,jsonBytes:bytes(node)};
  }
  const stage=parts(layout).find(node=>node.name==='stage');
  const pages=parts(stage??layout).map(node=>subtree(node,
    [layout.name,...(stage?['stage']:[]),node.name].join('/'),layout.visible===false||stage?.visible===false));
  const category=name=>/portrait|ready_card_assets|monster_art_data|menu_background_asset|v25_card_assets/.test(name)?'art-data'
    :['abyss_data','abyss_original_v4_data','abyss_theme','abyss_narrative','abyss_presentation','abyss_art_features'].includes(name)?'configuration':layers[name]??'generated-binding';
  return {schemaVersion:1,measurement:'offline-production-inputs-not-official-storage',officialStorageMB:null,
    lua:rank(modules.map(row=>({...row,category:category(row.name)})),'bytes'),
    pages:rank(pages,'jsonBytes'),templates:rank(treeRows.slice(1),'jsonBytes'),cardHosts:rank(cardHosts,'jsonBytes'),
    imageReferences:rank([...imageReferences].map(([image,instances])=>({image,instances,storage:'reference-not-embedded-art-bytes'})),'instances')};
}

export function productionCostDelta(current,baseline) {
  const groups=[['lua','name','bytes'],['pages','path','jsonBytes'],['templates','path','jsonBytes'],['cardHosts','path','jsonBytes']];
  const valid=(report,[group,key,metric])=>Array.isArray(report[group])
    &&report[group].every(row=>row&&typeof row[key]==='string'&&row[key].length>0&&Number.isSafeInteger(row[metric])&&row[metric]>=0)
    &&new Set(report[group].map(row=>row[key])).size===report[group].length;
  if(current?.schemaVersion!==1||baseline?.schemaVersion!==1
    ||!groups.every(group=>valid(current,group)&&valid(baseline,group)))
    return {status:'UNVERIFIED-no-comparable-breakdown'};
  const result={status:'offline-comparison-not-official-storage'};
  for(const [group,key,metric] of groups){
    const before=new Map(baseline[group].map(row=>[row[key],row[metric]]));
    const after=new Map(current[group].map(row=>[row[key],row[metric]]));
    result[group]=rank([...new Set([...before.keys(),...after.keys()])].map(id=>({[key]:id,
      beforeBytes:before.get(id)??0,afterBytes:after.get(id)??0,deltaBytes:(after.get(id)??0)-(before.get(id)??0)})),'deltaBytes');
  }
  return result;
}
