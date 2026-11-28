// Proposal facade: the original epoch module and its oracle are byte-for-byte frozen.
export * from './epochs/powerShop/tests/helpers/power-shop-source-inverse.mjs';
import { prePowerShopSource as original } from './epochs/powerShop/tests/helpers/power-shop-source-inverse.mjs';
import {sourceEpoch} from './combined-epoch/source-epoch.mjs';
import {readFileSync} from 'node:fs';
import {beforeStsDetailSource} from './release-sts-detail-source.mjs';
import {configSourceTokens,sourceConfigLayoutMatches} from './source-fingerprint.mjs';
import {createHash} from 'node:crypto';
const live=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const configPath='config/architecture.json';
function normalizePrimaryConfig(path,source){
 // The original Power Shop contract admits config whitespace in a primary
 // input only. Anchor that token stream to the exact #1080 successor first.
 if(path!==configPath||typeof source!=='string'||beforeStsDetailSource(path,source)!==source)return source;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const raw=live(configPath);
 if(beforeStsDetailSource(configPath,raw)===raw)return source;
 const tokens=createHash('sha256').update(configSourceTokens(raw)).digest('hex');
 return sourceConfigLayoutMatches(source,tokens)?raw:source;
}
export function prePowerShopSource(path,source,{readSource=live}={}){
 const projected=sourceEpoch.preCombinedSource(path,normalizePrimaryConfig(path,source),{target:'powerShop',readSource});
 return original(path,projected,{readSource:(typeof readSource==='function'?sourceEpoch.combinedReader(readSource,'powerShop'):readSource)});
}
