import {readFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {registerHooks} from 'node:module';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {withNativeXyzRotations} from './native-ui-rotations.mjs';

const anchor='return checkClient({mapPath:file,scripts},{listClientScripts,listComponents,listSignals,signalWords,';
const replacement='return checkClient({mapPath:file,scripts},{listClientScripts:a=>$abyssNativeCheckScripts(a,{container,fields,one}),listComponents,listSignals,signalWords,';
const helperUrl=new URL('./native-client-check.mjs',import.meta.url);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

// Match the native gallery mode at component 96/84/501. Retain explicit Basic
// as field zero and leave the field absent when a control omits its image type.
export function withNativeImageTypes(source){
 if(!source.includes('export function clientControlRecord('))return source;
 const anchors=[
  ['rootForm,image,colour,mask','rootForm,image,imageType,colour,mask'],
  ["only(['image','colour','opacity','mask'","only(['image','imageType','colour','opacity','mask'"],
  ['image:c.image,colour:c.colour','image:c.image,imageType:c.imageType,colour:c.colour'],
  ['image:[clientBlock(96,Buffer.concat([field(502,0,','image:[clientBlock(96,Buffer.concat([$abyssImageTypeBytes(image,imageType),field(502,0,'],
  ['if(has(picture,503))out.image=number(picture,503);','if(has(picture,503))out.image=number(picture,503);\n    if(has(picture,501))out.imageType=$abyssReadImageType(number(picture,501));'],
 ];
 const helpers=`
function $abyssImageTypeBytes(image,type){
 if(type===undefined)return Buffer.alloc(0);
 if(!Number.isSafeInteger(image)||image<=100006||!['basic','stretch'].includes(type))throw Error('Native image type requires a gallery image and Basic or Stretch mode');
 return field(501,0,type==='basic'?0:1);
}
function $abyssReadImageType(mode){
 if(mode!==0&&mode!==1)throw Error('Unsupported native image type');
 return mode===0?'basic':'stretch';
}
`;
 for(const [anchor,replacement] of anchors){
  if(source.split(anchor).length-1!==1)throw Error('Native gallery image type schema changed');
  source=source.replace(anchor,replacement);
 }
 return helpers+source;
}

// Node 22.22/24 synchronous load hooks affect only one fresh URL of the original
// encoder. No installed file is written. Its original checker, interface reads,
// clientTrees/mount/template traversal and diagnostics remain byte-for-byte.
// Rectangle read/write additionally preserves native XYZ rotation fields;
// scalar Z-only controls keep exactly their previous bytes. Gallery image mode
// is written and read only when requested or present in the native bytes.
export async function loadNativeUiEncoder(toolRoot){
 if(typeof toolRoot!=='string'||!toolRoot)throw Error('Native UI encoder requires a tool root');
 const sourcePath=join(resolve(toolRoot),'src','scene-save.mjs'),original=readFileSync(sourcePath);
 const source=original.toString('utf8'),count=source.split(anchor).length-1;
 if(count!==1)throw Error(`Native UI encoder requires exactly one checker anchor; found ${count}`);
 const helperPath=fileURLToPath(helperUrl),helper=readFileSync(helperPath);
 const isolatedHelper=new URL(helperUrl);isolatedHelper.searchParams.set('abyss-native-checker',randomUUID());
 const rotationAdapter=withNativeXyzRotations(source.replace(anchor,replacement));
 const transformed=`import {checkScripts as $abyssNativeCheckScripts} from ${JSON.stringify(isolatedHelper.href)};\n`+withNativeImageTypes(rotationAdapter.source);
 const isolated=pathToFileURL(sourcePath);isolated.searchParams.set('abyss-native-ui-encoder',randomUUID());
 const sourceSha256=digest(original),helperSha256=digest(helper);let intercepted=false,helperIntercepted=false;
 const hooks=registerHooks({load(url,context,nextLoad){
  if(url===isolatedHelper.href){
   const loaded=nextLoad(url,context);
   if(loaded.format!=='module'||digest(Buffer.from(loaded.source))!==helperSha256)throw Error('Native UI checker helper changed during isolated loading');
   helperIntercepted=true;return loaded;
  }
  if(url!==isolated.href)return nextLoad(url,context);
  const loaded=nextLoad(url,context);
  if(loaded.format!=='module')throw Error('Native UI encoder must load as original ESM');
  const bytes=Buffer.from(loaded.source);
  if(digest(bytes)!==sourceSha256)throw Error('Native UI encoder source changed during isolated loading');
  if(digest(readFileSync(helperPath))!==helperSha256)throw Error('Native UI checker helper changed during isolated loading');
  intercepted=true;return {...loaded,source:transformed};
 }});
 try{
  const native=await import(isolated.href);
  if(!intercepted||!helperIntercepted||typeof native.checkClientScripts!=='function')throw Error('Native UI encoder checker adaptation was not loaded');
  return {native,identity:Object.freeze({adapter:'section50-script-projection-v1',sourcePath,sourceSha256,sourceBytes:original.length,
   helperPath,helperSha256,helperBytes:helper.length,transformedSha256:digest(transformed),anchorCount:count,xyzRotations:rotationAdapter.enabled})};
 }finally{hooks.deregister();}
}
