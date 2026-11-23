import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const file = 'src/lua/abyss_silent_final_cards.lua';
const currentHash = '4f0d02b7a1f8d45b95cc210b5482f8566f61ba35b63ccd33c9c1d89ce34db60c';
const predecessorHash = '21766502d620d7fb9885cc3884d79c557739bac3bf750b5105fe34aa18bf8fdb';
const currentBlock = `  if n>0 then
   -- Draw hooks can insert actions before the discard selection is built.
   actions().enqueue(s,{op='draw',value=n})
   actions().enqueue(s,{op='requestDiscard',value=n})
  end`;
const predecessorBlock = `  if n>0 then actions().enqueue(s,{op='silentFinal',kind='tools',value=n})end`;
const hash = source => createHash('sha256').update(source).digest('hex');

export function isSilentToolsDrawSuccessor(path, source) {
    return path === file && typeof source === 'string' && hash(source.replaceAll('\r\n', '\n')) === currentHash;
}

export function beforeSilentToolsDrawSource(path, source) {
    if (!isSilentToolsDrawSuccessor(path, source)) return source;
    const predecessor = source.replaceAll('\r\n', '\n').replace(currentBlock, predecessorBlock);
    assert.equal(hash(predecessor), predecessorHash, 'exact Silent Tools of the Trade predecessor');
    return source.includes('\r\n') ? predecessor.replaceAll('\n', '\r\n') : predecessor;
}
