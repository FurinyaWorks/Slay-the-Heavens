import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const normalize=source=>source.replaceAll('\r\n','\n');
const digest=value=>createHash('sha256').update(value).digest('hex');

// Authenticate the develop split fix before restoring an older receipt.
const slimeSplitSources=Object.freeze({
  "src/lua/abyss_combat.lua": {
    "before": "609e75ba6e83da7b2311629adfdc2fd101c8167d3d17dbb1cdc0748baa9b1d1c",
    "after": "e2722605fad6ba7c56526d878cd6e0d571ef61156a5c5c5e28ad0d6bbc034355",
    "hunks": [
      [
        "        children[i].sourcePosition = EnemySetup.splitPosition(parent, i)\n",
        "        if ai.splitPositions then children[i].sourcePosition=copy(ai.splitPositions[i]) end\n"
      ]
    ]
  },
  "src/lua/abyss_combat_enemy_setup.lua": {
    "before": "76c8aa93a85a272b80ff4ae74645bc26fe33b7f6d18eb733d8c54d904b9331da",
    "after": "bd4875cf008fd05fa65f90eea11a29165b4b98733c5d30e2210e3f7545dcc725",
    "hunks": [
      [
        "end\nfunction M.splitPosition(parent,childIndex)\n if parent.ai.splitPositions then return Copy(parent.ai.splitPositions[childIndex])end\n -- Large slime takeTurn places medium children +/-134 source pixels from the parent.\n local origin=parent.sourcePosition or {x=0,y=0}\n return {x=origin.x+(childIndex==1 and -134 or 134),y=origin.y}\n",
        ""
      ]
    ]
  }
});
export const slimeSplitSourcePaths=Object.freeze(Object.keys(slimeSplitSources));
function matches(source,sha){
  return typeof source==='string'&&!source.includes('\r\r\n')&&digest(normalize(source))===sha;
}
export function beforeSlimeSplitSource(path,source){
  const row=Object.hasOwn(slimeSplitSources,path)?slimeSplitSources[path]:null;
  if(!row||!matches(source,row.after))return source;
  let prior=normalize(source);
  for(const [current,before] of row.hunks)prior=prior.replace(current,()=>before);
  assert.equal(digest(prior),row.before,'exact split source predecessor: '+path);
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeSlimeSplitReceipt(path,source,read){
  const prior=beforeSlimeSplitSource(path,source);
  if(prior!==source)assert(matches(read(path),slimeSplitSources[path].after),'fresh slime split source: '+path);
  return prior;
}
