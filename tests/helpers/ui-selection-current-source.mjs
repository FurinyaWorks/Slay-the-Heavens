import assert from 'node:assert/strict';
import {beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// Keep exact 454b fixture and helper editions for the existing archives.
// The official-assets inverse uses the previously approved selection edit.
const receipts=Object.freeze({
 "tests/official-assets.test.mjs": {
  "current": {
   "sha256": "9c8f77cb1fee968f4115824559023e7d0cdb441c1ad2c778645e5fce0e8a3663",
   "gitBlob": "2016c0cde717e9254f7a5882238b9ea4fd8f24f8"
  },
  "previous": {
   "sha256": "da4c8de1a7585309afcb548cc44efc0729880095ffbfef14c0e86e16ab8d74b3",
   "gitBlob": "9aa0c69f89142ab919f2c990cf8b02d3ce341dd9"
  }
 },
 "tests/sts-character-browser.test.mjs": {
  "current": {
   "sha256": "f10724414fe7a44db6eead4007fbed882a69b6db090c10d017ee84b74f51c2a6",
   "gitBlob": "30d12b5dd4900db8a86ccb7e84cd9bee87402145"
  },
  "previous": {
   "sha256": "a8c371980710a7824aff8328cf5c041b06b1199eea548cb4e51b17668a7d40dc",
   "gitBlob": "be5b6ad2bc339cfc227818355a4505b94f88ddf9"
  },
  "hunks": [
   {
    "at": 76,
    "before": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and #deck.cards==info.deckSize and deckPanel:GetChild('pileGrid').visible)\nassert(not panel.visible and not panel:GetChild('deckView').visible and #panel:GetChild('deckView'):GetChildren()==0)\nassert(host.pointerBlocked(),'preparation must keep preview input covered')\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')",
    "after": "assert(deck.browserShell and not deck.pileView and not deck.pileKind and not deck.choiceToken and not deck.battle)\nassert(deck.run.readOnlyPreview and #deck.cards==info.deckSize and deckPanel:GetChild('pileGrid').visible)\nassert(not panel.visible and not panel:GetChild('deckView'))\nassert(host.pointerBlocked(),'preparation must keep preview input covered')\nassert(not host:openStarterDeck(),'covered/reentrant opening must fail')"
   }
  ]
 },
 "tests/helpers/copy-integration-source-closure.mjs": {
  "current": {
   "sha256": "341addbaa167e33168be0c719d15e53cb2bcd3ed0453d199e267e303d62b9a3a",
   "gitBlob": "6440e3cd5bfeba4670b541f07025c08e923e5e30"
  },
  "previous": {
   "sha256": "234548d4a91abc189059c5e83171e0118054b1f1b7e8844e47a7295b9c05d08a",
   "gitBlob": "52177644878b5cc24a36e4fe5ec0fecc65c34fd5"
  },
  "hunks": [
   {
    "at": 346,
    "before": "const entranceFiles=Object.freeze({\n ...currentReplayFiles,\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'8e0d432cd1ecf668bad14a614a61772e495e13cce67ab0168babcaac5bfda1e6',\n 'tests/helpers/release-ui-restore-source.mjs':'846781b9a6b31c7b85dfca9cdca0447d1880f9a220d1488c18278c4189d6ad48',\n 'tests/helpers/current-replay-fix-sources.mjs':'bfef80da2fc30501c3b2e82cd14bdb8130e4a089f2db231ff2587804fa83a08b',\n 'tests/helpers/character-preparation-source.mjs':'ae3b89b99224cf8bb86b8e569e6488db68ac2d30bf1233ed6652c90808df1984',\n 'tests/helpers/develop-release-backflow-source.mjs':'4ac2a7c073d78f0029d85e9834f6063a4a797f215a529e349bdfc4f19ab5484c',\n 'tests/helpers/refined-release-source.mjs':'cdc740ca1ab04e423eef6462d2c61f68161a9431955d17b098749e6d473ae303',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',\n 'tests/helpers/ui-entrance-source.mjs':'55bbaca21af744a48dff1c5b445160b993bcf0862f813ce328a630408247e315',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',",
    "after": "const entranceFiles=Object.freeze({\n ...currentReplayFiles,\n 'tests/helpers/rebased-release-source.mjs':'0a0b6d0d07cb36879450fa80165c74a54fa44be0070c1a0443289488ff550b1e',\n 'tests/helpers/release-integration-source.mjs':'74093921a53a94ba842afac199e579a622b60fea5abf2519d416ede77bbfa1a7',\n 'tests/fixtures/release-lazy-monster-art-source.json.gz':'211c3588a53b1f97c98d9f9b905349d82b244a2e81a940d4ebe48022381ca92e',\n 'tests/helpers/m7-core-final-source-inverse.mjs':'8e0d432cd1ecf668bad14a614a61772e495e13cce67ab0168babcaac5bfda1e6',\n 'tests/helpers/release-ui-restore-source.mjs':'846781b9a6b31c7b85dfca9cdca0447d1880f9a220d1488c18278c4189d6ad48',\n 'tests/helpers/current-replay-fix-sources.mjs':'cceed97f15f0f91ab37ea27d3bf6f5659d213c54dcf11225eaa0fed7adc8ccdf',\n 'tests/helpers/character-preparation-source.mjs':'754f65a35ca034c5c064ce6f3a784d0d584041b2cad9ec6d6b9e9019626dd788',\n 'tests/helpers/develop-release-backflow-source.mjs':'4ac2a7c073d78f0029d85e9834f6063a4a797f215a529e349bdfc4f19ab5484c',\n 'tests/helpers/refined-release-source.mjs':'cdc740ca1ab04e423eef6462d2c61f68161a9431955d17b098749e6d473ae303',\n 'tests/helpers/native-fixture-replay-source.mjs':'7dbd2ded60c5b155b958a5e6e2ff44537b2b62c15e113642aaf8f6194771832d',\n 'tests/helpers/native-flow-fixture-source.mjs':'8ad7157fd4f3973ffba4f17f9eba440731ddf952e859fee53970d6c3879968e3',\n 'tests/helpers/ui-entrance-source.mjs':'963de52e8eacb4473553fa6030ea2a15c9b7754e81d341cd58d58af117a683a9',\n 'tests/helpers/ui-entrance-approved-sources.mjs':'b5c903614eb19f512e365c8c4024e1c40c37f5ab5df790a016dbeecf7b0efdcb',\n 'tests/helpers/ui-entrance-approved-sources.json':'58ea26de5268bc427bce73ecfb1ff43930f54b987c97777f9843e74d3467fe6d',\n 'tests/helpers/exact-fixture-hunks.mjs':'83f9cb15d9d745c86c555a77875b6b2bfc283a12ec380bcd2af518aa6526a935',\n 'tests/fixtures/ui-entrance-source.json.gz':'7ac3f53b242819cdb569c0a1ebf60de0605b72297a1072ea612bfeb11b0597c9',"
   }
  ]
 },
 "tests/helpers/integrated-ci-source.mjs": {
  "current": {
   "sha256": "0ff94cf123d7afedfa8f08620c649be881f0ab294288c3fca9ebab31bff4a30e",
   "gitBlob": "7dfa9a8806ec79fb0dfd4452775cdbc1ecde4224"
  },
  "previous": {
   "sha256": "35c66b01602d1b6f956cda4863768f9c1fd7ecdd3f8965ffee6ebc597811b882",
   "gitBlob": "d5bc70a847df670c100c9fd0809537fdcee725e1"
  },
  "hunks": [
   {
    "at": 154,
    "before": "};}\nexport function assertIntegratedCurrent(read=readFileSync){\n assertReleaseBootstrapCiCurrent(read);\n const rawRead=read;\n read=preflightPriorRead(rawRead);\n for(const [path,row]of Object.entries(integratedCiProof.files)){",
    "after": "};}\nexport function assertIntegratedCurrent(read=readFileSync){\n const rawRead=assertReleaseBootstrapCiCurrent(read);\n read=preflightPriorRead(rawRead);\n for(const [path,row]of Object.entries(integratedCiProof.files)){"
   }
  ]
 }
});
const receipt=path=>Object.hasOwn(receipts,path)?receipts[path]:undefined;

export function beforeSelectionReceiptSource(path,source){
 const binding=receipt(path);
 if(!binding||!exactSourceMatches(source,binding.current))return source;
 const prior=binding.hunks?restoreExactFixtureHunks({path,beforeSha256:binding.previous.sha256,
  afterSha256:binding.current.sha256,hunks:binding.hunks},path,source):beforeOfficialCharacterBackflow(path,source);
 assert(exactSourceMatches(prior,binding.previous),'exact selection receipt predecessor: '+path);
 return source.includes('\r\n')?prior.replaceAll('\r\n','\n').replaceAll('\n','\r\n'):prior;
}

export function checkedSelectionReceiptRead(read){
 const checked=(path,encoding)=>{
  const raw=read(path,encoding),binding=receipt(path);
  if(binding){
   const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
   assert((!Buffer.isBuffer(raw)||Buffer.from(source).equals(raw))&&exactSourceMatches(source,binding.current),
    'fresh complete integration source: '+path);
  }
  return raw;
 };
 for(const path of Object.keys(receipts))checked(path,'utf8');
 return checked;
}
