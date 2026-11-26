import assert from 'node:assert/strict';
import {exactSourceMatches as matches} from './source-fingerprint.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';

// The copier pins the confirmation archive. This predecessor remains in the
// preflight reader, outside the copier's hashed dependency manifest.
const copierPath='tests/helpers/copy-integration-source-closure.mjs';
const predecessor={"sha256":"73a38d069953b7bd095a7cfb33b04ab58a2b4623cf86b219876061188f450e7c","gitBlob":"5cf5de877fa6472f87d778e1686e1f8a046312ca"};
const successor={"sha256":"e0fd5dbe1d28bdc3b748a46d6f286766ad0424bfc7cbe8a9aeee02ab17a97a00","gitBlob":"9adb797518edd2bfbf61fdd0f4e45bff9949485c"};
const hunks=[
  {
    "at": 346,
    "before": "const entranceFiles=Object.freeze({\n ...currentReplayFiles,\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'c9d98969785466649e0e915df0d912f81b774d8b937b4fb63e74eed731635133',\n 'tests/helpers/release-ui-restore-source.mjs':'846781b9a6b31c7b85dfca9cdca0447d1880f9a220d1488c18278c4189d6ad48',\n 'tests/helpers/current-replay-fix-sources.mjs':'bfef80da2fc30501c3b2e82cd14bdb8130e4a089f2db231ff2587804fa83a08b',\n 'tests/helpers/character-preparation-source.mjs':'ae3b89b99224cf8bb86b8e569e6488db68ac2d30bf1233ed6652c90808df1984',\n 'tests/helpers/develop-release-backflow-source.mjs':'4ac2a7c073d78f0029d85e9834f6063a4a797f215a529e349bdfc4f19ab5484c',\n 'tests/helpers/refined-release-source.mjs':'cdc740ca1ab04e423eef6462d2c61f68161a9431955d17b098749e6d473ae303',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',\n 'tests/helpers/ui-entrance-source.mjs':'55bbaca21af744a48dff1c5b445160b993bcf0862f813ce328a630408247e315',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',",
    "after": "const entranceFiles=Object.freeze({\n ...currentReplayFiles,\n 'tests/helpers/rebased-release-source.mjs':'58c73785a00afa4aa47c63381312dcfab1ca7d756b9f0972b8017116d7e28842',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'c9d98969785466649e0e915df0d912f81b774d8b937b4fb63e74eed731635133',\n 'tests/helpers/release-ui-restore-source.mjs':'2ec5855476f1b4c8cf762ca1a7ee366028322841b07996a518af96fdd87259b9',\n 'tests/helpers/current-replay-fix-sources.mjs':'bfef80da2fc30501c3b2e82cd14bdb8130e4a089f2db231ff2587804fa83a08b',\n 'tests/helpers/character-preparation-source.mjs':'ae3b89b99224cf8bb86b8e569e6488db68ac2d30bf1233ed6652c90808df1984',\n 'tests/helpers/develop-release-backflow-source.mjs':'4ac2a7c073d78f0029d85e9834f6063a4a797f215a529e349bdfc4f19ab5484c',\n 'tests/helpers/refined-release-source.mjs':'747f63088f1830dad97f7fa116df16f265c555639c9a01161ba9ba3b3b5ecc5c',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'aee3721a70b70ac08bf18c8da7de8beaee906575ba4dc6a81c6718ef750ac5c1',\n 'tests/helpers/ui-entrance-source.mjs':'0f200d67ccd93c5d9ff8391ea4c71fa186c24312168ab5f96a0124a648976a72',\n 'tests/helpers/ui-confirmation-predecessors.json':'81a7cbee8051f06a26d83cf5ce789501f4892c0a699aef51e607f28ed3e4f240',\n 'tests/helpers/ui-confirmation-v220-predecessors.json':'be68f3bf46b01ebe525d8009f330c6348234af752c4c4d778b1524b15b00a7f2',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',"
  }
];

export function beforeConfirmationCopier(path,source){
 if(path!==copierPath||!matches(source,successor))return source;
 const previous=restoreExactFixtureHunks({path:copierPath,
  beforeSha256:predecessor.sha256,afterSha256:successor.sha256,hunks},path,source);
 assert(matches(previous,predecessor),'exact confirmation copier predecessor');
 return source.includes('\r\n')?previous.replaceAll('\n','\r\n'):previous;
}

export function assertConfirmationCopierEdition(path,source,read){
 if(path!==copierPath)return;
 const expected=matches(source,successor)?successor:matches(source,predecessor)?predecessor:undefined;
 if(!expected)return;
 let live;
 try{live=read(path,'utf8');}catch(error){assert.fail('combined linked owner missing: '+path+': '+error.message);}
 assert(matches(live,expected),'combined linked owner identity: '+path+' during confirmation copier validation');
}
