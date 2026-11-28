import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { exactSourceMatches } from './source-fingerprint.mjs';
import { restoreExactFixtureHunks } from './exact-fixture-hunks.mjs';
import { beforeReleaseEntranceOwner } from './release-entrance-owner-source.mjs';
import { beforeReleaseClosureFixture } from './release-closure-fixture-source.mjs';

const archive = readFileSync(new URL('../fixtures/master-backflow-predecessors.json.gz', import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'), 'b16492b78553e53e675537d95d3f9ef24557d792f657ba41f0f280e43fab325f');
const { develop, master, ledgerPredecessor, files } = JSON.parse(gunzipSync(archive));
assert.equal(develop, 'e483c6a191dc8dd7622e0cb137e7b8581b171af8');
assert.equal(master, 'd96c9f0d7958148ec1bb027f14a3214da81d06b4');
// #1017 adds six reviewed reference origins before #1019 adopts the ledger.
assert.equal(ledgerPredecessor, '67baf53929708e20943c8644ea9234b89b0d0970');

for (const [path, { before, after }] of Object.entries(files)) {
  assert(exactSourceMatches(before.source, before), 'exact Develop predecessor: ' + path);
  assert.match(after.sha256, /^[a-f0-9]{64}$/);
  assert.match(after.gitBlob, /^[a-f0-9]{40}$/);
  assert.notEqual(before.sha256, after.sha256);
}

// #964 and #988 precede the backflow on develop. Bind the merged shop and
// ledger sources and the TASK-116 checkout cleanup alongside the frozen proof.
const updatedSources = new Map([
  ['.gitattributes', ['889f8fcde1d9cd6ec11ca79cec21677612e94b11cb1bfccd53a64fd5a71c06a6', 'dafbf156e289707fd0a9a612badf45794e6d67ba']],
  ['config/ci-media-lfs.json', ['2c8470c78d11cddfa0a33c234f624175636fa5f42fa2a9a558eb92425507ce00', '8e97088d1172eaa434a9f032166ca09325900983']],
  ['docs/legal/assets.json', ['2fd4b435b871db820568656d28d6afb7e755bc08bcc1afd870a53d8dbba57737', '8d2d572f49b288faa19abb5fb516f7f6b00f140f']],
  ['scripts/ci-media-lfs.mjs', ['e0e71dca9c631734d1cf52f9eae7684428095d949eb4b956d592899652ef0d63', '3803eaa2637dc1e8370bf98dba77e82cd52c71d9']],
  ['scripts/deck-ui-layout.mjs', ['fb8ca6270444a5eaed5fff5ce797b469b01ff53e882a40c13c85374890921b06', '22359b12e6164a4fde5ae9302eef823b5df257dd']],
  ['scripts/official-battle-hud.mjs', ['af6ffdb50e11d77cf9c2046931f3e455d3bc780fcde9b265fd003d33b1c07a9b', '9956f4ded7b99023522ffc3f59b49b11b1916e85']],
  ['src/lua/abyss_battle_detail_bindings.lua', ['fc3e819c62455d966db30172055d2c3b4aa721daed943418519252fd38ad1852', '951d6e972052ed08a0638140b156ee2ffaea5166']],
  ['src/lua/abyss_battle_details.lua', ['eda327547a5399714320309d5cda22ed264123a8747ec5827ec9ee1a42409aab', '53a076d7a7c0958b02a968ca5125d3f65c744a2c']],
  ['src/lua/abyss_battle_info_content.lua', ['e5be45b603c6a38f863d7589c9553ebb52a6c3ec9ab1be6d436cf7fceb1b409b', '57a59fac16323440d756b6ed771ef4d87207167d']],
  ['src/lua/abyss_battle_info_view.lua', ['310fb87f002004b8bdbc8fc1b269b8dc1cbb6ecf0cf03256840fbdaed0d756ff', '7a24b24c0d1ccaa246bbb17afbf1cb4f0ce555dd']],
  ['src/lua/abyss_game_ui.lua', ['607192763b5ed9b93e4be3cb0ebddfae78aabe8710b274104ac26f6cef672e4a', 'c533ebfef1f88c30a4c45cadac43414400f4151e']],
  ['src/lua/abyss_game_ui_lifecycle.lua', ['6e3967351a581630c2c352742fdfc3fecc20fefbaf2c26c7ddc8f21e052b3e14', 'abf67a2ab3994df9058d32a3554420c6317d133c']],
  ['src/lua/abyss_game_ui_navigation.lua', ['89c0b1d90b00e97ca6bfaa5cffc13c7317064017e86da285d6792e56e726d477', 'a98e73313e33629917ca535933d35a79d91a287f']],
  ['src/lua/abyss_game_ui_view.lua', ['817eb3428c3fc0bb081a11015212520f445f018368c2028a8c5e4216747eb178', '94addcbe13c7dd643469e0c1bf33062ed27a8a7a']],
  ['src/lua/abyss_page_reveal.lua', ['e78b78ff3db4c173736839b87c9fdc001f5aa5e2f192f297f2ff46b9fce76485', '9ef23fdb2e68b008903ade8eef3575789bb651a8']],
  ['src/lua/abyss_shop_ui.lua', ['caa2a9e292c671e8caccda3c04905bad9f930b53bb5c52d14491452845b7cb1c', 'e7956c45a252b2595fb5af636b56e3a12d4a4581']],
  ['tests/ci-reviewed-lfs.test.mjs', ['2a9a520742fc514b7edfad5ae8b636caf5834cfd8e7c8cd49b971ea054a9c119', '0d61e4d967a2a9946cd2adb9d32762064215a73c']],
  ['tests/defect-utility-planning.test.mjs', ['d7b64a1189fce508eab45275d33dbbf442a46f085d0c2c3fe10c6c2caccab6ab', 'ba92ddb97178c4ccf977c5148db23d69f06b4485']],
  ['tests/enemy-status-hand-clearance.test.mjs', ['1bedfb69d287476ba4bef9e5bb040fa6f2e0c977427fa91ee70aa05dfebfd232', 'e162e4a75211b80296b7e6111bc00dfdb0ecb25a']],
  ['tests/game-ui.test.mjs', ['24e4ac5ceaa35a28372b53ab1e7baf4f0442383b96b0218f7457f94f37e49fec', '69aa3d7748b13116293ae97a31347cca31b6d643']],
  ['tests/helpers/fork-preflight-source.mjs', ['b4440a981c0b581e87db2e0a9d9e5e8ec5765bbaa125383483bd979ac35dd419', 'e356164cd80b8533040fba7fa56c51b88235bc50']],
  ['tests/helpers/isolated-current-source.mjs', ['b839ff3ffa5985995b5720350e5554816f87d0365069b76bc5c447d495f9e5e6', '6cfa35ef0d27fef1acaae4f5db501ec52fbef3b1']],
  ['tests/helpers/pr323-accepted-source-inverse.mjs', ['09a393bb0cac34f4f6ea319905486f36ccb3ce39468c712c195bbbfd512b118b', 'ebaedb48d3128518a3a1654c5990b8dbed8d958c']],
  ['tests/helpers/replay-reviewed-selection.mjs', ['5cd7ad3d5a728418bb89cb8dbf0d4fea7fa199fb005b399b71772e63e0ec2851', '2128fceb1bff074e04d02f911264194e2415037f']],
  ['tests/helpers/release-map-deck-source.mjs', ['ddaf9067612caa2e279e4702e6c7bf94a70a4201c0b87b87466060ec7abaf79b', '111ecb276fe90556f7c7702af4c6c4f1d825e013']],
  ['tests/integration-source-epoch.test.mjs', ['fd0cb659920b58cb0354c37acba7344028847c06211bb0339cc0deb38bbc2a8b', '8ec5fab8e038c2b0a3e1201a353283a28f02293f']],
  ['tests/lua/dynamic_monster_input_bindings.lua', ['8f79e3591cbcf361879fd664fc72eb9a495cb1004c22ad5a2b6fa3dff813ec21', '95895f0e46424f30b6f207d44b0891a33cece192']],
  ['tests/lua/intent_artifact_preview.lua', ['f924151fbc38a417985524171f8a8adb0927f133573a4f7b233ee1d52be2279c', '425180561c68ac50d4f67a13fa5fbf4a7a06e6b2']],
  ['tests/lua/support/dynamic_monster_game_ui.lua', ['abfe82b4330839610a3b495db737078ba2f4704ee951e8c1ac53cc8ee8056b94', '05e5c56c220b537f9a5fbaa68e49d0d5345dcdb8']],
  ['tests/official-assets-runtime.test.mjs', ['475d4772d0224ee4690cb5215d2536ac4961efe8a1415a40c3219dcc70fd4cde', '4ab27d84b1640b8ee6c48daaecc3c6aae1b416c8']],
  ['tests/official-assets-legibility.test.mjs', ['0649464990d270f88312779533ac2eeb77507f970d19a8002c7a13f3e9b00bfb', 'f5e64d0859d806078369bcd2297052ea3a351fc4']],
  ['tests/official-battle-relic-icons.test.mjs', ['02ac336167bbf416ca27af8679c8983dad1420820128a5966dd8c796356a6b5e', '01dd97b42135c76c110fae8f2acc6e71b7bd8be4']],
  ['tests/official-run-chrome.test.mjs', ['87fc525fbd0690029b8c32ec37f48c26ca80241bfce13dbe11a39c3659fafb74', 'fcdd143c84f896d09c680704d1e136d9f1da5788']],
  ['tests/run-max-hp-config-inverse.test.mjs', ['a40879d35601e22bfbd5622fce1604d0a9ee7a2222d15525f66d7e82b862928f', '408137bf30fd65836eb8a0eaba40de3a3902bdd5']],
]);

// The combined production modules retain the reviewed removal of dynamic reading.
// Earlier readers receive the exact approved develop modules after live source authentication.
const productionReadingBackflow = {
  "src/lua/abyss_battle_card_view.lua": {
    "path": "src/lua/abyss_battle_card_view.lua",
    "beforeSha256": "2a061b3bb338b5fab6e17a7bd322690e39a4c9251f643e25d937fac208fb7c71",
    "beforeBlob": "cbde32e89d278e327c5327dcb7a1d448e2b1fe7c",
    "afterSha256": "a754a1c70a92ee789fa8c8266ee0ede46f22427b271ab464b85b8ce17d59e158",
    "afterBlob": "1affa0043815bb45816077e74bd723abb8a4e8ac",
    "hunks": [
      {
        "at": 280,
        "before": "\nfunction M.new(view, controls)",
        "after": "\nlocal function releaseCoveredHand(child)\n    local cleared=true\n    for i=1,10 do\n        local box=child('card'..i)\n        CardGlow.clear(box)\n        local hidden=box:GetChild('nativePlayableRim'):SetVisible(false)~=false\n        local _,released=CardDisplay.clearNativeArt(box)\n        cleared=hidden and released and cleared\n    end\n    return cleared\nend\nfunction M.new(view, controls)"
      },
      {
        "at": 298,
        "before": "    local handBattle,handPoses,previousPiles=nil,{},{}\n    -- Ten physical hand slots own their native animation handles until explicit",
        "after": "    local handBattle,handPoses,previousPiles=nil,{},{}\n    local handSuspended=false\n    -- Ten physical hand slots own their native animation handles until explicit"
      },
      {
        "at": 433,
        "before": "\n    local function renderCards(data, presentation, battle, fighting, active, reward, picking)\n        local context = { data = data, presentation = presentation, battle = battle, fighting = fighting,run=view.run,",
        "after": "\n    local function suspendHand()\n        if not handSuspended then handSuspended=releaseCoveredHand(child) end\n    end\n    local function renderCards(data, presentation, battle, fighting, active, reward, picking)\n        handSuspended=false\n        local context = { data = data, presentation = presentation, battle = battle, fighting = fighting,run=view.run,"
      },
      {
        "at": 618,
        "before": "    local function update(dt)\n        for i=1,10 do local box=child('card'..i);CardSkin.tick(box,dt);CardGlow.tick(box,dt)end",
        "after": "    local function update(dt)\n        if handSuspended then return end\n        for i=1,10 do local box=child('card'..i);CardSkin.tick(box,dt);CardGlow.tick(box,dt)end"
      },
      {
        "at": 635,
        "before": "    end\n    return { renderCards = renderCards, renderDrag = renderDrag, refreshHover=refreshHover, refreshAim=refreshAim, update = update, destroy=destroy }\nend",
        "after": "    end\n    return { renderCards = renderCards, suspendHand = suspendHand, renderDrag = renderDrag, refreshHover=refreshHover, refreshAim=refreshAim, update = update, destroy=destroy }\nend"
      }
    ]
  },
  "src/lua/abyss_battle_ui.lua": {
    "path": "src/lua/abyss_battle_ui.lua",
    "beforeSha256": "f11e1b2a3ffe9accac309987070f4df68060f801a756c90f3bbf615de57bb182",
    "beforeBlob": "3d25656b7664ec7f42c86fdf1ca7a89a0b769fd2",
    "afterSha256": "77ddda8af4036bf16118ced2125f6b29d80016e5b1cc08105b43a1a67b291039",
    "afterBlob": "5dcb576b75cf3e7c28ff74217a7954867646b8cd",
    "hunks": [
      {
        "at": 122,
        "before": "        \"child\", \"enemyAt\", \"swallowed\", \"discardEnemyPointer\",\n        \"enemyReady\", \"down\", \"cancelPotionAim\", \"sameEnemySlot\", \"consumeReleasedDragClick\"\n    })))",
        "after": "        \"child\", \"enemyAt\", \"swallowed\", \"discardEnemyPointer\",\n        \"enemyReady\", \"down\", \"closeInfo\", \"cancelPotionAim\", \"sameEnemySlot\", \"consumeReleasedDragClick\"\n    })))"
      },
      {
        "at": 197,
        "before": "        statusDetail = statusDetail, statusKind = statusKind, intentView = intentView, potionText = potionText,\n        temporaryOps = temporaryOps, stanceNames = stanceNames, orbNames = orbNames,",
        "after": "        statusDetail = statusDetail, statusKind = statusKind, intentView = intentView, potionText = potionText,\n        displayedIntent=function(battle,id)return host.monsterIntentParticles:tooltip(battle,id)end,\n        temporaryOps = temporaryOps, stanceNames = stanceNames, orbNames = orbNames,"
      }
    ]
  }
};

export const productionReadingBackflowOwns = path => Object.hasOwn(productionReadingBackflow, path);

export function beforeProductionReadingBackflow(path, source) {
  if (!productionReadingBackflowOwns(path) || typeof source !== 'string') return source;
  const row = productionReadingBackflow[path];
  const lf = source.replaceAll('\r\n', '\n');
  if ((source !== lf && source !== lf.replaceAll('\n', '\r\n')) ||
      !exactSourceMatches(lf, {sha256: row.afterSha256, gitBlob: row.afterBlob})) return source;
  const prior = restoreExactFixtureHunks(row, path, lf);
  assert(exactSourceMatches(prior, {sha256: row.beforeSha256, gitBlob: row.beforeBlob}),
    'exact combined reading predecessor: ' + path);
  return source === lf ? prior : prior.replaceAll('\n', '\r\n');
}

// The local map return repair follows the already authenticated backflow.
const pageRevealContinuation = {
  path: 'src/lua/abyss_page_reveal.lua',
  sha256: 'e78b78ff3db4c173736839b87c9fdc001f5aa5e2f192f297f2ff46b9fce76485',
  gitBlob: '9ef23fdb2e68b008903ade8eef3575789bb651a8',
};

function matchesSuccessor(path, source, original) {
  if (exactSourceMatches(source, original)) return true;
  if (path === 'docs/legal/assets.json' && exactSourceMatches(source, {sha256:'a31ebb2c1d348da1fab24af5cbc07ad6c957867a15b3e32caf85c9fbe2e3ac46',gitBlob:'16fe8d2ffd88f40698f7161f7aad8adfe25d0855'})) return true;
  if (path === pageRevealContinuation.path && exactSourceMatches(source, pageRevealContinuation)) return true;
  const updated = updatedSources.get(path);
  return updated !== undefined && exactSourceMatches(source, { sha256: updated[0], gitBlob: updated[1] });
}

export function beforeMasterBackflowSource(path, source) {
  source = beforeReleaseClosureFixture(path, beforeReleaseEntranceOwner(path, source));
  if (!Object.hasOwn(files, path)) return source;
  const { before, after } = files[path];
  const buffered = Buffer.isBuffer(source);
  const text = buffered ? source.toString('utf8') : source;
  const message = 'fresh master backflow source: ' + path;
  const scope = beforeProductionReadingBackflow(path, text);
  if (scope !== text) return buffered ? Buffer.from(scope) : scope;
  assert(typeof text === 'string' && (!buffered || Buffer.from(text).equals(source)), message);
  const normalized = text.replaceAll('\r\n', '\n');
  const crlf = normalized !== text;
  assert(!crlf || normalized.replaceAll('\n', '\r\n') === text, message);
  assert(matchesSuccessor(path, text, after), message);
  const predecessor = crlf ? before.source.replaceAll('\n', '\r\n') : before.source;
  return buffered ? Buffer.from(predecessor) : predecessor;
}

export function beforeKnownMasterBackflowSource(path, source) {
  source = beforeReleaseClosureFixture(path, beforeReleaseEntranceOwner(path, source));
  const scope = beforeProductionReadingBackflow(path, source);
  if (scope !== source) return scope;
  if (!Object.hasOwn(files, path) || !matchesSuccessor(path, source, files[path].after)) return source;
  return beforeMasterBackflowSource(path, source);
}

const replayReaders = new WeakSet();
export function readBeforeMasterBackflowSource(read) {
  if (replayReaders.has(read)) return read;
  const replay = (path, ...args) => beforeMasterBackflowSource(path, read(path, ...args));
  replayReaders.add(replay);
  return replay;
}
