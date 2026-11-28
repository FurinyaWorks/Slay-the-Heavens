import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {beforeStsDetailSource} from './release-sts-detail-source.mjs';

// Exact pre-fix Release base: 7dded1e93f169f319c4a52e38f1ba47943ac4463.
// Only historical readers apply this inverse. Live battle checks use current files.
const changes = {
 "docs/legal/assets.json": {
  "current": {
   "sha256": "3802c173fbfc1944b3d3bb2230d6edc905380c8673f2659a1978623c75663cdc",
   "gitBlob": "74945372b37ba6d6800a9a803683b856e08e2703"
  },
  "previous": {
   "sha256": "a31ebb2c1d348da1fab24af5cbc07ad6c957867a15b3e32caf85c9fbe2e3ac46",
   "gitBlob": "16fe8d2ffd88f40698f7161f7aad8adfe25d0855"
  },
  "hunks": [{"at": 277, "count": 11, "before": "    \"docs/evidence/v2.2.0-enemy-ground-contact/act1-formations.webp\": {"}]
 },
 "data/presentation/ui_theme.json": {
  "current": {
   "sha256": "d944a6fe3732a81cc7efc3cce64c8d6320c4cf3f1716fe655522855be7164e59",
   "gitBlob": "15d8698b82d885bb5bdfd8cc54b7e0b8a00bfec1"
  },
  "previous": {
   "sha256": "ecffd748962d2e8193599992639ab8ccc43018fd6ff2c7252c85a48ea31fdfb8",
   "gitBlob": "20e31d0c2b6d65d97fabbe16606f1d7ddbd8ccce"
  },
  "hunks": [
   {
    "at": 15,
    "count": 6,
    "before": "  \"officialAssets\": {"
   }
  ]
 },
 "scripts/v220-chapter-battle-scenes.mjs": {
  "current": {
   "sha256": "926e26a5f5be388cbd55f4fbded8ba06908eb1059a2f5d8c65dd51f0079b3b54",
   "gitBlob": "8afeacb8d764727d5cb1b74c5f1341d565c381ce"
  },
  "previous": {
   "sha256": "2cff6fd9892e9d0684766948230f6c53847bdf2f97d722d2e0daf02099fe6b2c",
   "gitBlob": "4f90a0698d76eb6e95a8e7f4cd7535264ae9c011"
  },
  "hunks": [
   {
    "at": 44,
    "count": 1,
    "before": "function enemyGroundContact(y) {"
   },
   {
    "at": 56,
    "count": 1,
    "before": "    y, depth: .35, healthGap: 8, artSize: 106,"
   },
   {
    "at": 64,
    "count": 2,
    "before": "  const {layout, canvas} = theme;"
   },
   {
    "at": 74,
    "count": 5,
    "before": "  layout.enemyRow.groundContact = enemyGroundContact(centerY - (groundY - 21));"
   }
  ]
 },
 "src/lua/abyss_battle_card_layout.lua": {
  "current": {
   "sha256": "20cf208e192edb0d6a89574017d4996b03a95629a5e3f37007c731a06e128ea6",
   "gitBlob": "d0b698eaddc149801ca5f9eeb28548338cecadef"
  },
  "previous": {
   "sha256": "6a33acc4b5113463f16cc992c439044bf1b1ebd0d8f75b8ee0601cd160cfbafa",
   "gitBlob": "334d9960f7e04f861b7b1d508b6d40af810f225b"
  },
  "hunks": [
   {
    "at": 9,
    "count": 3,
    "before": "    local function placeHandHit(box, w, h, restAngle, point, scale)\n        local r = restAngle * math.pi / 180\n        local c,s = math.abs(math.cos(r)),math.abs(math.sin(r))\n        local restH,restW = (h*c+w*s)/2,(w*c+h*s)/2\n        local hotH = h * Theme.motion.hoverScale / 2\n        local hotY = Viewport.handFocus(point.baseY)\n        local low = math.min(point.baseY-restH,hotY-hotH)\n        local high = math.max(point.baseY+restH,hotY+hotH)\n        local dy,a = (low+high)/2-point[2],box.localRotationZ*math.pi/180"
   },
   {
    "at": 13,
    "count": 2,
    "before": "        -- Inverse the card transform: one world-space hit rectangle covers both poses.\n        hit:SetAnchoredPosition(math.sin(a)*dy/scale,math.cos(a)*dy/scale)\n        local width=math.max(restW*2,w*Theme.motion.hoverScale)\n        -- Adjacent hand centres own disjoint horizontal lanes. Keeping a full\n        -- hover-width receiver here lets a later sibling steal the initial press.\n        hit:SetSizeDelta(math.min(width,point.hitWidth or width)/scale,(high-low)/scale)"
   },
   {
    "at": 16,
    "count": 1,
    "before": "        hit.localRotationZ = -box.localRotationZ"
   },
   {
    "at": 18,
    "count": 1,
    "before": "    local function placeCard(box, count, index, selected, measureOnly)\n        local w, h = L.card.size[1], L.card.size[2]"
   },
   {
    "at": 22,
    "count": 1,
    "before": "        local point={x, y, baseY=baseY,hitWidth=laneWidth}"
   },
   {
    "at": 28,
    "count": 1,
    "before": "        placeHandHit(box,w,h,angle,point,scale)"
   }
  ]
 },
 "src/lua/abyss_battle_card_view.lua": {
  "current": {
   "sha256": "e65094455dca79b11c582052c9f7945a53da1ccfe2acf6fc9d6c2a5d32783920",
   "gitBlob": "d9752d807dce27afd20501285c6589fa30f5cbe6"
  },
  "previous": {
   "sha256": "a754a1c70a92ee789fa8c8266ee0ede46f22427b271ab464b85b8ce17d59e158",
   "gitBlob": "1affa0043815bb45816077e74bd723abb8a4e8ac"
  },
  "hunks": [
   {
    "at": 51,
    "count": 3,
    "before": "local function handTarget(count, index, hot, point)\n    local restAngle=-(index-(count-1)/2)*L.hand.arcDegrees\n    -- The hit rectangle still covers the idle anchor when the card is raised.\n    return {x=point[1],y=point[2],scale=hot and Theme.motion.hoverScale or 1,"
   },
   {
    "at": 62,
    "count": 2,
    "before": "    local w,h=L.card.size[1],L.card.size[2]\n    local r=target.restAngle*math.pi/180\n    local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))\n    local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2\n    local hotH=h*Theme.motion.hoverScale/2\n    local hotY=Viewport.handFocus(target.baseY)\n    local low=math.min(target.baseY-restH,hotY-hotH)\n    local high=math.max(target.baseY+restH,hotY+hotH)\n    local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180\n    local width=math.max(restW*2,w*Theme.motion.hoverScale)\n    return {pose.x,pose.y,pose.scale,pose.angle,\n        math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,\n        math.min(width,target.hitWidth or width)/pose.scale,(high-low)/pose.scale}"
   },
   {
    "at": 230,
    "count": 1,
    "before": "        entry.target=handTarget(#battle.hand,slot-1,hot,point)"
   },
   {
    "at": 308,
    "count": 1,
    "before": "        local target=handTarget(count,index,hot,point)"
   }
  ]
 },
 "src/lua/abyss_battle_enemy_view.lua": {
  "current": {
   "sha256": "16187ba39684623de28a74be14e9d335dafd7132b66065ef590351f33744ded3",
   "gitBlob": "06391977871b62b9d7a2a671d087f65632454621"
  },
  "previous": {
   "sha256": "ee1f1db69b9718c4198cce800348f6a284802d25f1a8e0de725bd63f8ee84615",
   "gitBlob": "1206ce4401b191160426d335f8d52c74632ad425"
  },
  "hunks": [
   {
    "at": 36,
    "count": 2,
    "before": "local function powerGap(healthHeight)"
   },
   {
    "at": 48,
    "count": 2,
    "before": " local firstX=g.healthX-g.hitWidth/2+10*scale"
   },
   {
    "at": 63,
    "count": 1,
    "before": "  local firstBottom=g.y+g.healthY-powerGap(g.healthHeight)-powerDepth(icon,countY)"
   },
   {
    "at": 69,
    "count": 1,
    "before": "  firstY=g.healthY-powerGap(g.healthHeight)-icon/2}"
   }
  ]
 },
 "src/lua/abyss_viewport.lua": {
  "current": {
   "sha256": "c89cf5dbe63337f3a26d6f90777175854862cdc930b665cbee9b6faba0e30081",
   "gitBlob": "385834a6bbaaa883b2cb3f5015c790c04a21f758"
  },
  "previous": {
   "sha256": "d9741c3f60f9fc72d8c87a386947a4a77373f22312ed8fe1da9b30c58b28c939",
   "gitBlob": "4744e8a51084a0950f381a1213a8316762a26195"
  },
  "hunks": [
   {
    "at": 56,
    "count": 20,
    "before": ""
   }
  ]
 },
 "tests/enemy-status-hand-clearance.test.mjs": {
  "current": {
   "sha256": "53a67174dfde3ba1193fbc079936a1d96618ccef63d76ea5e5f11aec01763f2c",
   "gitBlob": "73459fda5be317f3bf28a8db81901a69161cc88f"
  },
  "previous": {
   "sha256": "1bedfb69d287476ba4bef9e5bb040fa6f2e0c977427fa91ee70aa05dfebfd232",
   "gitBlob": "e162e4a75211b80296b7e6111bc00dfdb0ecb25a"
  },
  "hunks": [
   {
    "at": 9,
    "count": 21,
    "before": "const require=createRequire(import.meta.url);"
   }
  ]
 },
 "tests/lua/native_enemy_portraits.lua": {
  "current": {
   "sha256": "2583f8a02b454b47a3e74addce16918640e21549e93ba91d3f2c1a267ecf5545",
   "gitBlob": "3deb388f70f0ef28b816ae6bab280cf1af130c95"
  },
  "previous": {
   "sha256": "28a5bd3b76a9e24e2c7259b3f5c2f33d9604906f0e775dd2cc3e6605e2e1e780",
   "gitBlob": "d6431413b8cda3b13556fcd4aedacc0698ae5160"
  },
  "hunks": [
   {
    "at": 116,
    "count": 1,
    "before": "        near(g.y+g.healthY,hitBottom-20,id..' contact-relative health Y')"
   }
  ]
 },
 "tests/lua/hand_geometry_cache.lua": {
  "current": {
   "sha256": "92aa793ee0e4491a23e68b0365839217636f3e6483cfc74735622fdb5ed325f8",
   "gitBlob": "fbc5cff9c25e8c101f41a030b14561621ddcff6a"
  },
  "previous": {
   "sha256": "049972d6991ee24c9fe7d3ca1ffc60063b3b687978eae007c8a5500ef0be1e37",
   "gitBlob": "315cf18860f2da7b420e3d0266d741e1ed1256da"
  },
  "hunks": [
   {
    "at": 13,
    "count": 2,
    "before": "   return {index*100,-200,baseY=-200}"
   }
  ]
 },
 "tests/lua/support/card_blocked_display.lua": {
  "current": {
   "sha256": "6dd16979800b548e6315eca6b0cc4b833f575527c81d5d3374d715c994583c1d",
   "gitBlob": "3174c7b2d970f4ea3db2a278782f1b4a2b82c6de"
  },
  "previous": {
   "sha256": "e45e945a3e9a92c162d2d502b8e0d848f8024ac178ed66dda1a81d05051f72bb",
   "gitBlob": "4b316bca435b3cab2c0287f30c5c1af0ab5b7915"
  },
  "hunks": [
   {
    "at": 66,
    "count": 1,
    "before": " platform=platform,placeCard=function()return {0,0,baseY=0}end})"
   }
  ]
 },
 "tests/runtime-ui-hotpaths.test.mjs": {
  "current": {
   "sha256": "0da09ca5b3005d3fc52a89ba8759e87930ca20a4f64db7011ceb5735f54a00b3",
   "gitBlob": "fd371a84d1273422c5ef519d44155691fd263601"
  },
  "previous": {
   "sha256": "0db4dc2f24c5d58f3c04833576e6f8f050662c5558dc5d503918a8ebdfef0b3c",
   "gitBlob": "6c19ed17128fbebb4d505bcf5567eaac135b9c5a"
  },
  "hunks": [
   {
    "at": 42,
    "count": 1,
    "before": " const module='abyss_battle_card_view',source=readFileSync(`src/lua/${module}.lua`,'utf8');"
   }
  ]
 },
 "tests/helpers/chapter-battle-scene-source.mjs": {
  "current": {
   "sha256": "799040ad7eef63281029b16094e95292b14df23692208a00639cd4ce7d8113e2",
   "gitBlob": "945c602ca9f853150e79681840cdf4f47963ae73"
  },
  "previous": {
   "sha256": "e98323fd66d7fc37158c09b35f205035a05b0800b10bf2835f5ff6262d71880a",
   "gitBlob": "83a1bcc190495858eca8763fcb8612bee2d60cca"
  },
  "hunks": [
   {
    "at": 5,
    "count": 2,
    "before": "import {beforeBossMapScroll,bossMapScrollIdentity} from './boss-map-scroll-source.mjs';"
   },
   {
    "at": 825,
    "count": 2,
    "before": "function readingScopeIdentity(path,source) {"
   },
   {
    "at": 837,
    "count": 2,
    "before": "      assert(beforeProductionReadingBackflow(path,source)!==source,'fresh complete integration source: ' + path);"
   },
   {
    "at": 845,
    "count": 2,
    "before": "export function beforeCardReadingScope(path,source) {"
   },
   {
    "at": 896,
    "count": 2,
    "before": "      assert(matches(beforeProductionReadingBackflow(path,source),{sha256,gitBlob}), 'fresh complete integration source: ' + path);"
   },
   {
    "at": 906,
    "count": 5,
    "before": "  const handSource = beforeResponsiveHand(path, source);\n  const hand = handSource !== source ? responsiveHandProjections[path] : undefined;"
   },
   {
    "at": 912,
    "count": 7,
    "before": "  const readingScope = readingScopeIdentity(path,source) ?? (hand && readingScopeIdentity(layoutPath,read(layoutPath,'utf8')));"
   },
   {
    "at": 925,
    "count": 1,
    "before": "  const expected = bossMaskSource ? bossMapScrollIdentity(path)"
   },
   {
    "at": 927,
    "count": 1,
    "before": "    : before !== handSource ? candidate : matches(handSource, predecessor) ? predecessor : undefined;"
   },
   {
    "at": 931,
    "count": 3,
    "before": "  };"
   },
   {
    "at": 935,
    "count": 9,
    "before": "    const live = read(owner, ...args);"
   },
   {
    "at": 945,
    "count": 4,
    "before": "    const linkedScope = Object.hasOwn(cardReadingScopeProjections,owner);"
   },
   {
    "at": 950,
    "count": 1,
    "before": "    if (linkedHand && !linkedScope) assert(matches(live, {sha256: linkedHand.afterSha256, gitBlob: linkedHand.afterBlob}),"
   },
   {
    "at": 953,
    "count": 1,
    "before": "    if (owner === path && !readingScope && (expected || prior !== live)) {"
   }
  ]
 },
 "tests/helpers/release-closure-fixture-source.mjs": {
  "current": {
   "sha256": "289dbb0f64df673d88909d620f3e204cd92a96d448eb62acd6347f91f4e39b23",
   "gitBlob": "48bea331e9508b49ea8bee42c828fc4260bd6795"
  },
  "previous": {
   "sha256": "7526ec6dc7c6a15d04b62320458e525dbd48e6863cd430063900a6faeb4dd625",
   "gitBlob": "d22561333f66dc69b1c4e08f9506b3cea195de39"
  },
  "hunks": [
   {
    "at": 5,
    "count": 2,
    "before": "import {beforeBossMapScroll} from './boss-map-scroll-source.mjs';"
   },
   {
    "at": 2260,
    "count": 1,
    "before": " raw=beforeReleaseMetadata(path,raw);"
   }
  ]
 }
};

export const releaseEnemyClearanceIdentity = path => Object.hasOwn(changes,path) ? changes[path].current : undefined;

export function releaseEnemyClearanceStage(path,source) {
 const row=Object.hasOwn(changes,path)&&changes[path];
 if(!row||typeof source!=='string')return undefined;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n'))return undefined;
 if(exactSourceMatches(lf,row.current))return 'current';
 if(exactSourceMatches(lf,row.previous))return 'predecessor';
}

const stsDetailLedger={
 path:'docs/legal/assets.json',
 current:{sha256:'20a4b5307cd582a2fd592d04e78057de39189e643d9bcdb0c70eff247ffbe686',gitBlob:'e7f2cc3ffd76953ec8de677723996be28e32bf15'},
 previous:{sha256:'3802c173fbfc1944b3d3bb2230d6edc905380c8673f2659a1978623c75663cdc',gitBlob:'74945372b37ba6d6800a9a803683b856e08e2703'},
};
const stsDetailOutsideArchive=Object.freeze({
 [stsDetailLedger.path]:stsDetailLedger,
 "tests/defect-actor-boundary.test.mjs":{
 "path": "tests/defect-actor-boundary.test.mjs",
 "current": {
  "sha256": "81122eb0471b51424fc805adff076ffb53aa574cfd66c5852e90eaf75fba1cc3",
  "gitBlob": "8bc3e1e3b77e0859230f3b2f0f006083396ce66e"
 },
 "previous": {
  "sha256": "a73f32bd0a1702a2c4b6461433b173d0f4ac3cb382d1f55807ae480dd64fe3d7",
  "gitBlob": "fe9e70589091324fd406113a57feb18eb684c3c8"
 },
 "hunks": [
  {
   "at": 14,
   "before": "import {beforeCombatEvents,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');",
   "after": "import {beforeCombatEvents,pointerInputPath,retiredControllerPath} from './helpers/input-retirement-source.mjs';\nimport {readStsDetailOwners} from './helpers/release-sts-detail-source.mjs';\nimport {exactSourceMatches} from './helpers/source-fingerprint.mjs';\nconst require=createRequire(import.meta.url),luaparse=require('luaparse');"
  },
  {
   "at": 24,
   "before": "// before materializing that explicit view; never filter arbitrary live modules.\nfunction capabilityPreStyle(raw=discoverSources()){",
   "after": "// before materializing that explicit view; never filter arbitrary live modules.\n// Only the three UI modules admitted by #1080 are absent from the older\n// Actor/Focus graph. Authenticate their complete live bytes before omission.\nconst detailUiOwners=Object.freeze({\n 'src/lua/abyss_card_browse_preview.lua':{sha256:'e0d1d3262f93251bc47681cd25713a4532b2552d11f55cc6e3c2e8297d11c5bb',gitBlob:'54c7d8fb78276b57017e91470f3129be02ad1e29'},\n 'src/lua/abyss_card_keyword_tip.lua':{sha256:'291991d574c7056c675ee90f217d81c3b546da865b56fc71fdaed3cfd60a1a9a',gitBlob:'fae7fb2fe4338beb16ef59180d0db7784e0d2a48'},\n 'src/lua/abyss_node_ui_card_inspection.lua':{sha256:'51cc94804f4a33bdc43be23510a060e1c4acdaa222082e3ecafcc7fa268787ee',gitBlob:'1bcdf13d9ca0f434c23cd9a0a874b5a33953dfb1'},\n});\nfunction beforeDetailUiInventory(paths,read){\n for(const [path,owner] of Object.entries(detailUiOwners)){\n  assert(paths.filter(current=>current===path).length===1,'complete live STS detail UI inventory: '+path);\n  const source=read(path),lf=source.replaceAll('\\r\\n','\\n');\n  assert((source===lf||source===lf.replaceAll('\\n','\\r\\n'))&&exactSourceMatches(source,owner),'fresh STS detail UI owner: '+path);\n }\n return paths.filter(path=>!Object.hasOwn(detailUiOwners,path));\n}\nfunction capabilityPreStyle(raw=discoverSources()){"
  },
  {
   "at": 42,
   "before": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const liveInventory=reviewedStsStyleInventory(Object.keys(live),readLive);\n const readRenamed=reviewedRenamedStsStyleRead(readLive);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];",
   "after": " const readLive=path=>Object.hasOwn(live,path)?live[path]:read(path);\n const readBeforeDetails=readStsDetailOwners(readLive);\n const inventory=beforeDetailUiInventory(Object.keys(raw),readLive);\n const liveInventory=reviewedStsStyleInventory([...inventory,config],readBeforeDetails);\n const readRenamed=reviewedRenamedStsStyleRead(readBeforeDetails);\n const expected=[...Object.keys(proof.current),...actorFocusAdded,...stasisUpgradeAddedPaths,...deckPagesAdded];"
  },
  {
   "at": 49,
   "before": " assert.deepEqual(entranceInventory(liveInventory,readRenamed),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(Object.keys(raw),readLive);\n const readPreStyle=actorFocusPreStyleReader(readLive);\n for(const [path,binding]of Object.entries(proof.current)){",
   "after": " assert.deepEqual(entranceInventory(liveInventory,readRenamed),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),'complete live source inventory before preStyle');\n assertActorFocusInventory(inventory,readBeforeDetails);\n const readPreStyle=actorFocusPreStyleReader(readBeforeDetails);\n for(const [path,binding]of Object.entries(proof.current)){"
  },
  {
   "at": 177,
   "before": " assert.throws(()=>capabilityPreStyle(extra),/complete live source inventory/,'preStyle must reject rather than drop unknown live source owners');\n});",
   "after": " assert.throws(()=>capabilityPreStyle(extra),/complete live source inventory/,'preStyle must reject rather than drop unknown live source owners');\n for(const path of Object.keys(detailUiOwners)){\n  const checked=discoverSources();\n  const raw=checked[path];\n  checked[path]=raw.replaceAll('\\n','\\r\\n');\n  assert.equal(beforeDetailUiInventory(Object.keys(checked),p=>checked[p]).includes(path),false,'exact CRLF UI successor: '+path);\n  checked[path]=raw.replace('\\n','\\r\\n');\n  assert.throws(()=>capabilityPreStyle(checked),{message:'fresh STS detail UI owner: '+path},'reject mixed EOL before dropping a named module');\n  checked[path]=raw+'\\n-- drift';\n  assert.throws(()=>capabilityPreStyle(checked),{message:'fresh STS detail UI owner: '+path},'reject drift before dropping a named module');\n  delete checked[path];\n  assert.throws(()=>capabilityPreStyle(checked),{message:'complete live STS detail UI inventory: '+path},'reject absent live owner');\n }\n});"
  }
 ]
},
 ['tests/helpers/menu-red-ci-source.mjs']:{
  path:'tests/helpers/menu-red-ci-source.mjs',
  current:{sha256:'9a6b8c49884d22569429633f6bf26c352637f2dc7e2d3aafa27c95798249391a',gitBlob:'f54bf1ee6a6b22d6628b5839437378e5814b6598'},
  previous:{sha256:'6cef51a2b49f821ab26d6dbd54b84907e2590b98cdf9a8fef1f3f5959950c895',gitBlob:'3484ee3d5678ef7b8f4192cb82f67d7091efe883'},
  at:28,count:20,before:"export function menuRedPriorLua(paths,read=readFileSync){\n paths=integratedPriorInventory(paths,'menu','lua',read);",
 },
 ['tests/official-assets-runtime.test.mjs']:{
  path:'tests/official-assets-runtime.test.mjs',
  current:{sha256:'5d635eb1ba4af30ba8fed85e337ccb6e4ef407d3bcdc767f3b3a36133c9fac5a',gitBlob:'1ec091caa2cb92de96303f99accf89fbbdfcdee1'},
  previous:{sha256:'608f5e266b4b1ab48b762f74088d1e018b7ee8aa0864546a75745356e3a082c7',gitBlob:'12d5666dc00a9a432141e3bc4ad6d8ccc54e23fb'},
  at:69,count:19,before:" const quietRims=[...rims(stage),...templates.flatMap(rims)].filter(rim=>!handRims.includes(rim));",
 },
});
// Keep published current expectations separate from earlier immutable receipts.
const eventPreviewFixtures=Object.freeze({
 "tests/lightweight-card-layout.test.mjs": {
  "current": {
   "sha256": "a2e679cc1012e49a5bf2eacc61b12961a0caae5d63e7d4ef5d14c9ac3142245c",
   "gitBlob": "8d6135c0bb45500c4ee211ca6c3980a2588186ef"
  },
  "previous": {
   "sha256": "5e26803f7eb8e01823fae5d032d771576133b45a948563a974654ae28a9f8c67",
   "gitBlob": "31844e9128b39ab1fafaa29e74b1b4bd2ca592b1"
  },
  "path": "tests/lightweight-card-layout.test.mjs",
  "hunks": [
   {
    "at": 26,
    "before": " const prior=paths(layout),templateBefore=count(templates[0]);\n const result=compactBoundedCardFaces(layout,templates);\n // #940 adds one standalone face for inspecting a card in the deck browser.\n assert.equal(result.cardHosts,62);assert.equal(before-count(layout),2989);\n assert.equal(templateBefore-count(templates[0]),49);assert.equal(result.removedControls,3038);\n const focusFace=child(child(child(layout,'deckPanel'),'cardFocus'),'face');",
    "after": " const prior=paths(layout),templateBefore=count(templates[0]);\n const previewCard=child(child(child(layout,'nodePanel'),'eventView'),'previewCard'),previewBefore=count(previewCard);\n const result=compactBoundedCardFaces(layout,templates);\n // #940 added deck detail; #1080 adds exactly one passive event preview face.\n assert.equal(previewCard.visible,false);assert.equal(child(previewCard,'hit'),undefined);\n assert.equal(previewBefore-count(previewCard),49);\n for(const group of groups(previewCard))assert.deepEqual(group.children.map(node=>node.name),['flat']);\n assert.equal(result.cardHosts,63);assert.equal(before-count(layout),3038);\n assert.equal(templateBefore-count(templates[0]),49);assert.equal(result.removedControls,3087);\n const focusFace=child(child(child(layout,'deckPanel'),'cardFocus'),'face');"
   }
  ]
 },
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "e8332538064a52fbbb4ec7a5e4fb0229102033bbcb53ea1535bd7c46dfe80a58",
   "gitBlob": "28f7f7aba9d5aa5f553889658517187275ca865d"
  },
  "previous": {
   "sha256": "cba2484414c8e71344234dbd7b400ffda451f5db94606d7390c04babcc0e84ef",
   "gitBlob": "f8b23012510de602f341dc200768512c2c8fef91"
  },
  "path": "tests/official-assets.test.mjs",
  "hunks": [
   {
    "at": 86,
    "before": " applyOfficialNeowLayout({children:[{name:'nodePanel',children:[expectedEvent]}]},theme);\n const eventProjection=new Map(paths(expectedEvent,'/SlayTheAbyss/nodePanel'));\n const expectedChoice=experimentalCharacterControls(theme).find(node=>node.name==='choicePanel');",
    "after": " applyOfficialNeowLayout({children:[{name:'nodePanel',children:[expectedEvent]}]},theme);\n const eventFacePath='/SlayTheAbyss/nodePanel/eventView/previewCard';\n const eventProjection=new Map(paths(expectedEvent,'/SlayTheAbyss/nodePanel').filter(([path])=>\n  path!==eventFacePath&&!path.startsWith(eventFacePath+'/')));\n const expectedChoice=experimentalCharacterControls(theme).find(node=>node.name==='choicePanel');"
   },
   {
    "at": 260,
    "before": "   assert.equal(current.get(path),node,path);\n   if(eventProjection.has(path)){",
    "after": "   assert.equal(current.get(path),node,path);\n   if(path==='/SlayTheAbyss/nodePanel/eventView'){\n    const roomOnly=room=>({...room,children:children(room).filter(child=>child.name!=='previewCard')});\n    assert.deepEqual(roomOnly(node),roomOnly(eventProjection.get(path)),path+' shared event projection');continue;\n   }\n   if(eventProjection.has(path)){"
   },
   {
    "at": 320,
    "before": " const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\n const choiceFacePaths=['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face'];",
    "after": " const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\n const isOriginalHost=path=>path!==focusFacePath&&path!==eventFacePath;\n const choiceFacePaths=['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face'];"
   },
   {
    "at": 324,
    "before": " assert.deepEqual(replacedChoiceFaces.map(([path])=>path).sort(),choiceFacePaths,'the shared scroller supersedes the two former static choice hosts');\n const publishedOriginalPaths=nodes.filter(([path,node])=>path!==focusFacePath&&cardHosts.has(node)&&!retiredCards.includes(node)).map(([path])=>path).sort();\n assert.equal(publishedOriginalPaths.length+replacedChoiceFaces.length,38,'account for all 38 reviewed original official card hosts');\n assert.deepEqual(cardPaths.filter(([path])=>path!==focusFacePath).map(([path])=>path).sort(),publishedOriginalPaths,'retain every original active card host path outside the shared scroller');\n assert.equal(cards.length,37);\n const focusFaces=cardPaths.filter(([path])=>path===focusFacePath);",
    "after": " assert.deepEqual(replacedChoiceFaces.map(([path])=>path).sort(),choiceFacePaths,'the shared scroller supersedes the two former static choice hosts');\n const publishedOriginalPaths=nodes.filter(([path,node])=>isOriginalHost(path)&&cardHosts.has(node)&&!retiredCards.includes(node)).map(([path])=>path).sort();\n assert.equal(publishedOriginalPaths.length+replacedChoiceFaces.length,38,'account for all 38 reviewed original official card hosts');\n assert.deepEqual(cardPaths.filter(([path])=>isOriginalHost(path)).map(([path])=>path).sort(),publishedOriginalPaths,'retain every original active card host path outside the shared scroller');\n assert.equal(cards.length,38);\n const eventFaces=cardPaths.filter(([path])=>path===eventFacePath);\n assert.equal(eventFaces.length,1,'exactly one approved read-only event preview face');\n const eventPreview=child(child(child(layout,'nodePanel'),'eventView'),'previewCard');\n assert.strictEqual(eventFaces[0][1],eventPreview);\n assert.equal(eventPreview.visible,false,'event preview starts closed');\n assert(!all(eventPreview).some(node=>node.kind==='cursorArea'),'event preview adds no input receiver');\n const focusFaces=cardPaths.filter(([path])=>path===focusFacePath);"
   }
  ]
 },
 "tests/official-assets-legibility.test.mjs": {
  "current": {
   "sha256": "b42bcbc831e40a952b34c68a79a48d164e9f26ff75fc6f686fbe6366d2394895",
   "gitBlob": "18e454f1619313bd82d2ebe9c328e68e69ce3cf2"
  },
  "previous": {
   "sha256": "0649464990d270f88312779533ac2eeb77507f970d19a8002c7a13f3e9b00bfb",
   "gitBlob": "f5e64d0859d806078369bcd2297052ea3a351fc4"
  },
  "path": "tests/official-assets-legibility.test.mjs",
  "hunks": [
   {
    "at": 132,
    "before": "const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\nconst retiredChoiceFaces=new Set(['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face']);\nfunction assertCardHostPaths(layout,cards){\n const original=cards.map(([path])=>path).filter(path=>path!==focusFacePath).sort();\n assert.equal(original.length+retiredChoiceFaces.size,38,'account for every original official card host');",
    "after": "const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';\nconst eventFacePath='/SlayTheAbyss/nodePanel/eventView/previewCard';\nconst retiredChoiceFaces=new Set(['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face']);\nfunction assertCardHostPaths(layout,cards){\n const original=cards.map(([path])=>path).filter(path=>path!==focusFacePath&&path!==eventFacePath).sort();\n const event=cards.filter(([path])=>path===eventFacePath);\n assert.equal(event.length,1,'the approved event preview has exactly one face');\n assert.strictEqual(event[0][1],child(child(child(layout,'nodePanel'),'eventView'),'previewCard'));\n assert.equal(event[0][1].visible,false,'event preview starts closed');\n assert(!all(event[0][1]).some(node=>node.kind==='cursorArea'),'event preview adds no input receiver');\n assert.equal(original.length+retiredChoiceFaces.size,38,'account for every original official card host');"
   }
  ]
 }
});
function beforeStsDetailFixture(path,source){
 const row=Object.hasOwn(eventPreviewFixtures,path)?eventPreviewFixtures[path]:
  Object.hasOwn(stsDetailOutsideArchive,path)&&stsDetailOutsideArchive[path];
 if(!row||!exactSourceMatches(source,row.current))return source;
 const {current,previous,at=277,count=11,before='    "docs/evidence/v2.2.0-battle-clearance/guardian-layout-ab.webp": {'}=row;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const after=lf.split('\n').slice(at,at+count).join('\n');
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,
  hunks:row.hunks??[{at,before,after}]},path,lf);
 assert(exactSourceMatches(prior,previous),'exact pre-STS detail fixture: '+path);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}
export function beforeStsDetailInput(path,raw){
 const buffered=Buffer.isBuffer(raw),source=buffered?raw.toString('utf8'):raw;
 if(typeof source!=='string'||buffered&&!Buffer.from(source).equals(raw))return raw;
 const prior=beforeStsDetailSource(path,beforeStsDetailFixture(path,source));
 return prior===source?raw:buffered?Buffer.from(prior):prior;
}

export function beforeReleaseEnemyClearance(path,raw) {
 raw=beforeStsDetailInput(path,raw);
 const row=Object.hasOwn(changes,path)&&changes[path];
 if(!row)return raw;
 const buffered=Buffer.isBuffer(raw),source=buffered?raw.toString('utf8'):raw;
 if(!exactSourceMatches(source,row.current)||buffered&&!Buffer.from(source).equals(raw))return raw;
 const lf=source.replaceAll('\r\n','\n');
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n'))return raw;
 const lines=lf.split('\n');
 const hunks=row.hunks.map(({at,count,before})=>({at,before,after:lines.slice(at,at+count).join('\n')}));
 const prior=restoreExactFixtureHunks({path,beforeSha256:row.previous.sha256,afterSha256:row.current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,row.previous),'exact pre-clearance release source: '+path);
 const restored=source===lf?prior:prior.replaceAll('\n','\r\n');
 return buffered?Buffer.from(restored):restored;
}
