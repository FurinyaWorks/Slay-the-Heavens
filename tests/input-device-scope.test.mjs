import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';

test('live Lua does not register gamepad input or set native controller focus', () => {
  const directory='src/lua';
  const controllerApi=/\b(?:abyss_controller|ControllerNavigation\w*|AddNavigationEventListener|RemoveNavigationEventListener|SetControllerNavigation|SetControllerFocus|GetControllerFocus|SetPlayerFocus|GetPlayerFocus|canControllerFocus|controllerApi|IsControllerDevice|SetEnableControllerNavigation|Gamepad\w*|padKey)\b/;
  assert.equal(existsSync(join(directory,'abyss_controller.lua')),false);
  for (const name of readdirSync(directory).filter(name=>name.endsWith('.lua'))) {
    assert.doesNotMatch(readFileSync(join(directory,name),'utf8'),controllerApi,name);
  }
});

test('default and formal generated layouts omit gamepad navigation throughout the tree', t => {
  const root=mkdtempSync(join(tmpdir(),'abyss-input-scope-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const profiles={
    default:{},
    formal:{officialAssets:true,refinedReleaseMonsterArt:true,nativePageLifecycle:true},
  };
  const files=['game-ui.json','battle-ui.json','map-ui.json','game-ui-templates.json'];
  const inspect=(value,location)=>{
    if (value===null || typeof value!=='object') return;
    for (const [key,child] of Object.entries(value)) {
      if (key==='focusable' || key==='isolateNavigation') assert.equal(child,false,location+'.'+key);
      else assert.ok(!['navigation','controllerNavigation','canControllerFocus','padKey'].includes(key),location+'.'+key);
      inspect(child,location+'.'+key);
    }
  };
  for (const [profile,options] of Object.entries(profiles)) {
    const output=join(root,profile);
    buildUI(output,undefined,options);
    for (const name of files) {
      inspect(JSON.parse(readFileSync(join(output,name),'utf8')),profile+'/'+name);
    }
    const flags=readFileSync(join(output,'abyss_art_features.lua'),'utf8');
    assert.match(flags,/\bcards\s*=\s*false\b/);
  }
});
