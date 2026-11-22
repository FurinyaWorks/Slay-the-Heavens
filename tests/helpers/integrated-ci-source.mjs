import {beforeCoopJsInventory,beforeShopEntryInventory,beforePreflightSource,preflightPriorRead} from './fork-preflight-source.mjs';
// Explicit immutable source views for the reviewed integration inputs.
// Production projectors never import this CI-only archive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {integratedCiBytes} from './integrated-ci-binding.mjs';
import {releaseBootstrapCiSource,releaseBootstrapCiCheckedSource,assertReleaseBootstrapCiCurrent} from './release-bootstrap-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const integratedCiProof=freeze(JSON.parse(gunzipSync(integratedCiBytes)));
assert.equal(integratedCiProof.schemaVersion,1);
assert.deepEqual(integratedCiProof.sources,{native:'97af2fed6db0d8c77ea29165ec6395bfb55e2161',closeout:'fdb91c7e30688f593728bde26db0e4d6f614d933',sts:'afd8834b1e7f613b7d68c7a4b6d68ca196f37064',menu:'ec0d0b990bb4baa7d45413101599ef3030f33892',selection:'f0581b708a62378fa838233139d2efef1db7ed8b',release:'900527d931df941eed642a9667ccde92f76b73db'});
for(const [path,row]of Object.entries(integratedCiProof.files))for(const binding of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source));assert.equal(hash(binding.source),binding.sha256,path+' complete source');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob);
}
// Release hotfixes retain the frozen integration view. Only complete source
// files from dd7b9cdc1e86094965dbf50f89b92aebbe2c8381 select this predecessor.
const releaseSuccessors=Object.freeze({
 "config/architecture.json":"178e876a145f71b181220a81fd76b9983281dc36187f07b871f33e6b1f795861",
 "data/presentation/ui_theme.json":"75236c40c76d9f8fd02937c566c6a10665e4581cc6cf36f1f4510b8348bf7005",
 "scripts/character-ui-layout.mjs":"7224c361975b8d760ebc772c13bf1dd56e5b7772cde436561b79b8dc50d8cb51",
 "scripts/cinematic-ui-layout.mjs":"c661e55e0db4ea437f43461c28864cc52c83e60d2a371f8abb39ca6a54bca8e2",
 "scripts/game-ui-layout.mjs":"c515c18b91e47656438079dbd28926e101a49a9eb2477adf12c3e60ef38ceef9",
 "scripts/lowcost-art.mjs":"8b804664b3eb83d221b8aec6b10623c7175418b55942fa0c7a8904576996da70",
 "scripts/node-ui-layout.mjs":"eb4f592654de1531d7fc8366a03c6a8cfcf88e1768c2df73f0b89382db19908f",
 "scripts/noncombat-v25-layout.mjs":"8aa4489c8f89a765442f6142b78af374ea19b3c9eeebd8e30b10ee6e6e9b4959",
 "scripts/official-assets-layout.mjs":"44223c968da6474503361d1d2b131f22ded35a73899a7f8e6da2fc2536e87af4",
 "scripts/official-battle-card-chrome.mjs":"6392aefe0d8b4dc233e0ce5f149022f9bb509420723667f2aa4b00f71b6388a3",
 "scripts/sts-reward-row-layout.mjs":"b8063690a9dafb1ecb377c579c899742a91702c6df8643ff611dddf302f56477",
 "scripts/v25-character-layout.mjs":"24c3cdd81def1de79b0cb8a8367d871704ce1e20719bcb29fd16292863d423c0",
 "scripts/v25-node-layout.mjs":"9cb0b2a38f3171a7fe1fc1b9174de8b4533f2c64f8181857c17d00c36fe276e1",
 "src/lua/abyss_game_ui_view.lua":"21aaed83def99c1306b87f41d122f36e1bdae66569f0f58e9079e807f4e480c0",
 "src/lua/abyss_v25_menu_view.lua":"a2a3b9d001699e2bb638193d26523a94e93cefeb0bb222b814619b7d81b8430e",
 "tests/deck-browser-reveal-reuse.test.mjs":"0f28cadcf64bee721889b84a0bb855c7f22664ca95748a3bd5812721d87edb63",
 "tests/enemy-status-hand-clearance.test.mjs":"913b331159bf9c97f73246977e521a70658c2b28d445fa58965710c0675eeb7b",
 "tests/game-ui.test.mjs":"427eec89fefd32060552aa7058b99504ca73d61f5787169c06200fa03d58bcb7",
 "tests/lua/formal_campaign_entry.lua":"18309f8a278c92845828e1da651b163a0f94f5bf7b6c58fcf484580ca25857e0",
 "tests/lua/full_source_campaign_entry.lua":"188656c960968f8b5e689a8fa639dcc3b3d18724a35d3e533dee1eb69a1e6c30",
 "tests/lua/lowcost_art.lua":"3b4b86cfae2f09ada29ba25330f8c70daa176fb92f456c6c409a051b8e94f5be",
 "tests/lua/support/node_ui_cases.lua":"0473731d2fb9388b98ef567d11c0dc7d155fe0db937fd7cff0ee6d51d9a6030b",
 "tests/lua/support/official_choice_pagination.lua":"412a343af80e39fd3dc90a132a37dae27951d03de03d6d562f8bd71c1583c820",
 "tests/noncombat-v25-layout.test.mjs":"872d27a0575a36c14aedbb5ac3247e5f8a1b3c148cd9f6c94a0f043de37f9aea",
 "tests/official-assets-legibility.test.mjs":"9dfac44310c9a1e2957d59a5ffc28ec82bcea715340f8755f7f4d0a7ebf6a58d",
 "tests/official-assets-runtime.test.mjs":"d7122df9233df47d110d1e7776bedd89c81dd2c498c9841a957c7bc35852e672",
 "tests/official-choice-pagination.test.mjs":"62d9b15ce9866c6a5c590dfd7c34034242cd63a154ddc610dabb51e4213dc559",
 "tests/official-run-chrome.test.mjs":"a27e8e1355186833b5cde4901df5fd74da1d8dde5849c5aa374e5cdd31d24a5e",
 "tests/sts-card-reference-runtime.test.mjs":"1cab596c184d775191800dd7db21b51e0f1923c7ec8219034ffc065836e5bb96",
 "tests/sts-character-browser.test.mjs":"5c6ef9dc8681e3e69fc756ace097d77da4ab85aecd39ed85cc9c4f9d2eb1b3a4",
 "tests/sts-page-reveal.test.mjs":"626c0d696152515ea76b776cbf07ed72838c2c5bd0b08c03ca4dd564537d600f",
 "tests/sts-reward-row-runtime.test.mjs":"64adb18e85446d892a2cd4bd5e025ea9b1cdda64bc45956a2c47d1f28ecfd0fc",
 "tests/sts-reward-row.test.mjs":"433e516c4c968fb92149327a24d513e4b33c12e5e87eff83cf865d4b9d338b4a",
});
const releaseSuccessorAliases=Object.freeze({
 "scripts/cinematic-ui-layout.mjs":"e6e8045a5037de59c451cb752b42b99020bbdb07b4b681e72715ce6403d81c9d",
 "tests/lua/full_source_campaign_entry.lua":"81464e0e868a6d654767497fee3fd1c2cb69b089f0572196c0950cfff97e7c25",
});
function beforeReleaseSuccessor(path,source){
 if(!Object.hasOwn(releaseSuccessors,path)||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const digest=hash(norm(source));
 if(digest!==releaseSuccessors[path]&&digest!==releaseSuccessorAliases[path])return source;
 return integratedCiProof.files[path].current.source;
}
export function integratedSource(path,source,target){
 assert(Object.hasOwn(integratedCiProof.sources,target),'known integration input');
 if(path.startsWith('src/')||path==='config/architecture.json')return beforePreflightSource(path,source);
 const row=Object.hasOwn(integratedCiProof.files,path)?integratedCiProof.files[path]:null;
 const predecessor=row?.views[target]?beforeReleaseSuccessor(path,source):source;
 source=releaseBootstrapCiSource(path,predecessor===source?beforePreflightSource(path,source):predecessor,row?.current);
 if(!row?.views[target]||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 if(row.views[target].sha256===row.current.sha256)return source;
 return row.views[target].source;
}
export function integratedRead(target,{read=readFileSync}={}){read=preflightPriorRead(read);return(path,encoding)=>{
 const raw=read(path,encoding);
 const binary=Object.hasOwn(integratedCiProof.binaryViews,path)?integratedCiProof.binaryViews[path]:null;
 if(Buffer.isBuffer(raw)&&binary?.views[target]&&hash(raw)===binary.current){
  const saved=binary.views[target],bytes=read(saved.path);assert.equal(hash(bytes),saved.sha256,'complete immutable integration binary predecessor');return bytes;
 }
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=integratedSource(path,text,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertIntegratedCurrent(read=readFileSync){
 assertReleaseBootstrapCiCurrent(read);
 const readCurrent=read;
 read=preflightPriorRead(read);
 for(const [path,row]of Object.entries(integratedCiProof.files)){
  const raw=readCurrent(path,'utf8'),predecessor=beforeReleaseSuccessor(path,raw);
  const source=predecessor===raw?read(path,'utf8'):predecessor;
  assert.equal(hash(norm(releaseBootstrapCiCheckedSource(path,source,row.current))),row.current.sha256,'fresh complete integration source: '+path);
 }
 for(const [path,row]of Object.entries(integratedCiProof.closure))assert.equal(hash(path.endsWith('.gz')?read(path):norm(releaseBootstrapCiSource(path,read(path,'utf8'),integratedCiProof.files[path]?.current))),row.after,'fresh integration copy owner: '+path);
}
export function extendIntegratedHelperClosure(original){
 const current={...original},patch=integratedCiProof.closure;
 assert.deepEqual(Object.keys(patch).sort(),['tests/helpers/closeout-source-epoch.mjs','tests/helpers/combined-epoch/source-epoch-runtime.mjs','tests/helpers/menu-presentation-source.json.gz','tests/helpers/menu-red-production-source.json.gz','tests/helpers/menu-red-source-epoch.mjs','tests/helpers/release-source-epoch.json.gz','tests/helpers/release-source-epoch.mjs','tests/helpers/session-menu-source-epoch.json.gz','tests/helpers/session-menu-source-epoch.mjs']);
 for(const [path,row]of Object.entries(patch)){assert.equal(row.before,original[path]??null,'exact integration copy predecessor: '+path);assert.match(row.after,/^[a-f0-9]{64}$/);current[path]=row.after;}
 return freeze(current);
}
// Exact complete inventories for historical receipts; raw Full discovery remains live.
export function integratedPriorInventory(paths,target,kind='js',read=readFileSync){
 const current=kind==='js'?integratedCiProof.inventory:integratedCiProof.luaInventory;
 const prior=integratedCiProof.inventories[target]?.[kind];
 assert(prior,'known integration inventory');
 if(kind==='js')paths=beforeCoopJsInventory(paths,current,read);
 else paths=beforeShopEntryInventory(paths,kind,read);
 // New standalone reviewed views consume raw discovery. Older chained views
 // retain their existing idempotent prior-inventory contract.
 if(target==='selection'||target==='release')assert.deepEqual([...paths].sort(),current,'complete reviewed raw '+kind+' inventory');
 if(JSON.stringify([...paths].sort())===JSON.stringify(prior))return [...paths];
 const added=current.filter(p=>!prior.includes(p));
 if(added.length===0){
  assert.deepEqual([...paths].sort(),current,'complete identical integration '+kind+' inventory');
  return [...prior];
 }
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,kind==='lua'?'complete integration Lua discovery inventory':'complete integration js inventory');
 for(const path of added){
  const row=integratedCiProof.files[path];assert(row,'complete added inventory source: '+path);
  assert.equal(hash(norm(releaseBootstrapCiSource(path,beforePreflightSource(path,read(path,'utf8')),row.current))),row.current.sha256,'fresh added inventory source: '+path);
 }
 return [...prior];
}
export function renderIntegratedCiBinding(sha){
 assert.match(sha,/^[a-f0-9]{64}$/);
 return `// Fixed trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),${JSON.stringify(sha)},'complete reviewed integration CI sources');\n`;
}
