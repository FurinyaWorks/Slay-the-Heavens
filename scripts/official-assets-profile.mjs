// Approved native art and layout, with its own fixed artwork inventory.
export const officialAssetsProfile = 'official-assets-battle-v2';
export const officialAssetFlags = Object.freeze({cards:false,menuBackground:false,selectionAvatar:true,battlePortrait:true,monsters:false});
export function matchesOfficialAssetFlags(artFeatures) {
 return Object.entries(artFeatures).every(([key,value])=>Object.hasOwn(officialAssetFlags,key)&&value===officialAssetFlags[key]);
}
export function validateOfficialAssets(options={}) {
 const {officialAssets=false,lightweight2d=false,v25BattleChrome=false,
  v25CardAssets,v25UiMasks,nativeCardArt,readyCardArt,artFeatures={},performanceArt=false,componentWidgets,prepare}=options;
 if(typeof officialAssets!=='boolean')throw Error('Official assets must be an explicit boolean');
 if(!officialAssets)return false;
 if(lightweight2d||v25BattleChrome||v25CardAssets!==undefined||v25UiMasks!==undefined
  ||nativeCardArt!==undefined||readyCardArt===true||performanceArt||componentWidgets||prepare)
  throw Error('Official assets require a separate candidate without other art profiles');
 if(!matchesOfficialAssetFlags(artFeatures))
  throw Error('Official assets preserve the existing Traveler portraits and disable custom cards, monsters and scenery');
 return true;
}
export function officialAssetsArgs(argv){
 const args=[];let officialAssets=false;
 for(const arg of argv){
  if(!arg.startsWith('--official-assets')){args.push(arg);continue;}
  if(arg!=='--official-assets'||officialAssets)throw Error('Invalid or duplicate official assets option');
  officialAssets=true;
 }
 return {args,officialAssets};
}
export function candidateAssetsArgs(argv){
 const legacyCount=argv.filter(arg=>arg==='--art-version=legacy').length;
 const options=officialAssetsArgs(argv.filter(arg=>arg!=='--art-version=legacy'));
 if(legacyCount>1||legacyCount&&options.officialAssets)throw Error('Conflicting UI profile options');
 return {...options,legacy:legacyCount===1};
}
export function officialAssetsFromReceipt(receipt){
 const value=receipt?.officialAssetsProfile;
 if(value===undefined)return false;
 if(![officialAssetsProfile,'official-assets-first-v1'].includes(value))throw Error('Invalid official assets profile receipt');
 validateOfficialAssets({officialAssets:true,artFeatures:receipt.artFeatures?.flags,
  lightweight2d:receipt.experimentalProfile!==undefined,v25BattleChrome:receipt.experimentalBattleChrome!==undefined,
  v25CardAssets:receipt.v25CardAssets,v25UiMasks:receipt.v25UiMasks,nativeCardArt:receipt.nativeCardArt,
  readyCardArt:receipt.readyCardArt?.enabled===true});
 const flags=receipt.artFeatures?.flags;
 if(!flags||Object.entries(officialAssetFlags).some(([key,value])=>flags[key]!==value))throw Error('Official assets receipt has different artwork flags');
 return true;
}
