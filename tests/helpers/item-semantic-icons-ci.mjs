// CI-only trust leaf. No production projector or helper-copy dependency imports it.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pcFinalCiSource,pcFinalCurrentInventory,pcFinalPriorInventory} from './pc-final-ci-source.mjs';
import {pcAfterFixCiPacket} from './pc-after-fix-ci-source.mjs';
import {perfFinalCiPacket} from './perf-final-ci-source.mjs';
import {reconciliationCiPacket} from './reconciliation-ci-source.mjs';
const norm=s=>s.replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
// Filled once from the two reviewed Git snapshots after the bounded code changes.
export const itemIconCi=freeze({
  "aliases": {
    "data/presentation/lowcost-relic-art.json": [
      {
        "before": "1735a5f8dfca4b28220825aa163d8b9dc4d8a1aceba0244eb6e11ae6198963b3",
        "after": "9d6f50f624250fb05511aac086adf2bcb4487485416b56c4c44cdff7fc8e8526"
      }
    ],
    "docs/legal/assets.json": [
      {
        "before": "b87da8f51d74160958db06f8f4e17eee84174d3ab9ec9960c925ccc82969f871",
        "after": "aa344735337481007635250a075d5fc8a47c8354219233ece1bee2bcf61a5a09"
      },
      {
        "before": "47609edf4d016d4f83091cde721138556c0185d01ec9ef30a54a65371bc9f9bd",
        "after": "f56b56683045e475d22f143a1d8f5de9f5b019ed06bb05ef8a7c4e946982b2b9"
      }
    ],
    "scripts/lowcost-art.mjs": [
      {
        "before": "eb06982af04f2f09aad86580803a92426240da205c26b8287f661a12b32e40a8",
        "after": "7a1246e6a37bd5041258feccb7b2501cd7874434a0cf19f6f21acb93c1f3cf32"
      }
    ],
    "tests/helpers/closeout-source-epoch.mjs": [
      {
        "before": "552e5980a76b46fcd030fcafe516d5b7673021dce0a7b0c23072bfb67dcf1e40",
        "after": "aa943b070906e85c7adb23b2019728886d83bcfb2f80b19266931b23c3f98ffc"
      },
      {
        "before": "163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7",
        "after": "3471ca3ce9f2f0f1ddeb87d21c201cf83a4c41592744de068696812af9154dc8"
      },
      {
        "before": "3f6eff5b06cc91371de414aa1a7fb960ee447d6cdca9b8fc7807ce503793fd6c",
        "after": "775646f95cc2a4f4008c789824ebdf597f409bcb68e82e1e7118cabbe35b042a"
      },
      {
        "before": "3f6eff5b06cc91371de414aa1a7fb960ee447d6cdca9b8fc7807ce503793fd6c",
        "after": "ca1375c9dfab0d93f78afc8b80e86e8930f92057a201e48e946d7d6a7b350c42"
      }
    ],
    "tests/helpers/copy-integration-source-closure.mjs": [
      {
        "before": "17f1e337b452ed462ee189d026145f1296c9c6992da4ba7ddb0cd1229d5816b0",
        "after": "009ce6fc36f821911275f61a8d5a2a67749567d981f57b1bec878c6a2d098681"
      },
      {
        "before": "17f1e337b452ed462ee189d026145f1296c9c6992da4ba7ddb0cd1229d5816b0",
        "after": "32823db828eb0f75cfe8d1f67c528ab32911dd0b73f7ae4e9c75aeb1a70399fd"
      },
      {
        "before": "17f1e337b452ed462ee189d026145f1296c9c6992da4ba7ddb0cd1229d5816b0",
        "after": "408f9bd0d81d8e2ff25549d8385e1b18c327396074cd3b0a13d1c4f695e02134"
      }
    ],
    "tests/integration-source-epoch.test.mjs": [
      {
        "before": "f557ed773b0b3c811a12a2eedadf3678112c97d47ad6a1a2db2f7d7570a1d4a9",
        "after": "ed5fd98af1eec7ceb93b67ab162aa6162527229026be4f5e74bf561ea713b373"
      }
    ],
    "tests/lowcost-art.test.mjs": [
      {
        "before": "3f2641d7d9576f535e6c9f99783b1989deb5a2f3b63208072609b17b64c86cdc",
        "after": "0d3c29f4b6058b715dec0d60f35323ec62d3bb746ef7f81c0d43190dcd32f4c5"
      }
    ],
    "tests/helpers/integrated-ci-source.mjs": [
      {
        "before": "85aafbc1e178e281489eb959f816a7d3ced883395d58baa41d39c67e0cc26e8e",
        "after": "040eb09c4b83f5b83524fbdf15186a501d466ceebd94c7c33cbee6fbe95a88f9"
      },
      {
        "before": "2c5f69104518ae70185f98b6329bbc85a395e4d89c24fbae0d6def614cf584cf",
        "after": "2f33e04816202529fcd3a37d17eea28429cc81493691d8837b4932aaec3ea7cd"
      },
      {
        "before": "91ffba192be6ab3ff13928ba898c48749ed44d837203d10fd6f37f3826804df3",
        "after": "8e1e7f20d71de2c838cec298bdf15f9b0c6368f263449a8eadcf4e897343785c"
      }
    ],
    "tests/sts-style-source-epoch.test.mjs": [
      {
        "before": "68857b76da46773eef18fecd866aa9a718b2102f41b7a3f63efb93878bc21bf1",
        "after": "aa7bf6e06a6b9ebd9d8b129cc1bcd5d54df49722a5a4a30324bb1c2a3804b98b"
      },
      {
        "before": "e07efc666c0fc2c2d956b621d7e770ee47a4a900256fdf891360534f8b7b36be",
        "after": "d05dfa36d20e6ad2bc5287b2974cba5d571ab7fc823d0afb7978ed64510db043"
      }
    ],
    "tests/integrated-ci-source.cases.mjs": [
      {
        "before": "2dd0201a30f3307dfcc0351902050f9bc268a1e802aaf1a181b5c92117b5a664",
        "after": "6ad4a10485f2919ca0a2f5127a9659f54695cf77c8001a0d5491f02aacf90318"
      }
    ],
    "tests/ci-complete-calibration.test.mjs": [
      {
        "before": "4459d2b61e96a1ffbcf89f10bff6e03fae6847361cf02dc5ea9c744701a0f03a",
        "after": "a38e5933813409d68d6d835f046edf70b2207952aa38bb67c05e589b4da6bb02"
      }
    ],
    "tests/helpers/replay-reviewed-selection.mjs": [
      {
        "before": "f6f7684c8c71beefd28bc7af625bcbdc4758ae8a7dedfd91ff91121674b387cc",
        "after": "279d5b77263cc68a7c80fac5828b9e80daf4a73e4010ed3239c93a6a4128e46c"
      },
      {
        "before": "44b65f1d067478b61ca5262722771513d37cce7194a109d5a31df325e96003b5",
        "after": "b9d4ef3e997699edca580431c52053d42708ef268d4e38a7ad2cb384a730f1e0"
      }
    ]
  },
  "added": {
    "js": {
      "tests/item-semantic-icons-source.test.mjs": "516400fd4fcb04e60d980afeeb0f0776398f61597a5f991d4454885de95117ea",
      "tests/potion-art-runtime.test.mjs": "48e2a21951f0162e2f7ab5ba10b27fb130bf941dc985da59310c5e2b9cd2d540",
      "tests/potion-art.test.mjs": "786ee6a5964199ef66b6be9a576dd158d2d027bfef567d39e1658acc86a87270"
    },
    "lua": {}
  },
  "inventories": {
    "js": [
      "19d5d17db472ea35bde61f1a49b93bfe2d30258dab403709da6d8cc87b583e60",
      "210f8b9060ba2f90ff76e3c75443187680b1679b7667d267cb74b0429a845be7",
      "4bbf63f570d50ad04f1e4c9a42070ea62851208cd78e0cdb4c528d5e42496e06"
    ],
    "lua": [
      "681e9f9260fc44a96d676c6704badef733970e519c89f34d28c7d9bce5da7332",
      "86a16eeead2e6fc6874e921d84660e339ce52b4b7ca22f51351dab5fc5f6a4e3",
      "5e31f374c21e3623655a8babbb2cad1984cc561ec4d1d99c22cf19d38a2a2d3b"
    ]
  },
  "support": {
    "tests/helpers/potion-art-runtime.lua": "1bacb6318c747f21885db36a749bb6a44c9b9166fc98bfbb8c6fdda00da3a86e",
    "tests/helpers/reward-art-runtime.lua": "e4d44b67bd9f905f237b5541980ce45a6e12520aee86000012c5f270e1e365d3"
  }
});
export function itemIconCiSource(path,source,row){
 source=pcFinalCiSource(path,source,row);
 if(typeof source!=='string'||source.includes('\r\r\n')||!row)return source;
 const aliases=Object.hasOwn(itemIconCi.aliases,path)?itemIconCi.aliases[path]:[];
 return aliases.some(alias=>alias.before===row.sha256&&alias.after===hash(norm(source)))?row.source:source;
}
export function itemIconCurrentInventory(base,kind){
 assert(['js','lua'].includes(kind),'known item icon inventory kind');
 const added=Object.keys(itemIconCi.added[kind]).filter(path=>!base.includes(path));
 if(added.length===0)return pcFinalCurrentInventory(base,kind);
 assert(itemIconCi.inventories[kind].includes(hash(JSON.stringify(base))),'exact item icon base inventory');
 return pcFinalCurrentInventory([...base,...added].sort(),kind);
}
export function itemIconPriorInventory(paths,base,kind,read,proof){
 const added=Object.keys(itemIconCi.added[kind]).filter(path=>!base.includes(path));
 // An adopted complete current base is already its own historical identity.
 // This mapping does not replace assertIntegratedCurrent's unconditional gate.
 if([pcAfterFixCiPacket.currentInventory[kind],perfFinalCiPacket.currentInventory[kind],reconciliationCiPacket.currentInventory[kind]].some(complete=>JSON.stringify([...base].sort())===JSON.stringify(complete))&&JSON.stringify([...paths].sort())===JSON.stringify([...base].sort()))return [...paths];
 paths=pcFinalPriorInventory(paths,kind,read);
 if(added.length===0)return [...paths];
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),[...base,...added].sort(),'complete item icon '+(kind==='lua'?'Lua discovery':kind)+' inventory');
 for(const path of added)assert.equal(hash(norm(pcFinalCiSource(path,read(path,'utf8'),{sha256:itemIconCi.added[kind][path]}))),itemIconCi.added[kind][path],'fresh added inventory source: '+path);
 if(kind==='js')assertItemIconRuntimeSupport(read,proof);
 return [...base];
}
function assertItemIconRuntimeSupport(read,proof){
 const adopted=proof.inventory.includes('tests/potion-art-runtime.test.mjs')&&Object.keys(itemIconCi.support).every(path=>proof.files[path]?.current||proof.closure[path]?.after);
 if(adopted)return;
 for(const [path,sha]of Object.entries(itemIconCi.support))assert.equal(hash(norm(read(path,'utf8'))),sha,'fresh runtime support source: '+path);
}
export function assertItemIconAddedSources(read,proof){
 const base={js:proof.inventory,lua:proof.luaInventory};
 for(const [kind,group]of Object.entries(itemIconCi.added))for(const [path,sha]of Object.entries(group))if(!base[kind].includes(path))assert.equal(hash(norm(pcFinalCiSource(path,read(path,'utf8'),{sha256:sha}))),sha,'fresh added inventory source: '+path);
 assertItemIconRuntimeSupport(read,proof);
}
