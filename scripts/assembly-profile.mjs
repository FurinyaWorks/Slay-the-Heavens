// Configuration identity excludes source/layout/asset hashes: normal content
// growth must remain comparable within the same assembly policy.
const switches=['nativePageLifecycle','legacyCardFrames','experimentalCharacters','performanceArt',
 'privateCardAssets','privateUiMasks','releaseCandidate'];
const artKeys=['cards','menuBackground','selectionAvatar','battlePortrait','monsters'];
const keys=['schemaVersion','uiProfile','renderProfile','artFeatures','cardArt','staticCardHosts',...switches];
const exact=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)
 &&Object.keys(value).length===names.length&&names.every(key=>Object.hasOwn(value,key));
export function normalizeAssemblyProfile(value){
 if(!exact(value,keys)||value.schemaVersion!==1||value.renderProfile!=='native-v2'
  ||!['default','official-assets','v25-battle-chrome','bounded-2d'].includes(value.uiProfile)
  ||!['disabled','dynamic','static'].includes(value.cardArt)
  ||!switches.every(key=>typeof value[key]==='boolean')||!exact(value.artFeatures,artKeys)
  ||!artKeys.every(key=>typeof value.artFeatures[key]==='boolean')
  ||value.artFeatures.cards!==(value.cardArt!=='disabled')
  ||!Array.isArray(value.staticCardHosts)||value.staticCardHosts.length>10
  ||value.staticCardHosts.some(host=>typeof host!=='string'||!host)
  ||new Set(value.staticCardHosts).size!==value.staticCardHosts.length
  ||(value.cardArt==='static')!==(value.staticCardHosts.length>0))return null;
 return {schemaVersion:1,uiProfile:value.uiProfile,renderProfile:value.renderProfile,
  artFeatures:Object.fromEntries(artKeys.map(key=>[key,value.artFeatures[key]])),cardArt:value.cardArt,staticCardHosts:[...value.staticCardHosts].sort(),
  ...Object.fromEntries(switches.map(key=>[key,value[key]]))};
}
