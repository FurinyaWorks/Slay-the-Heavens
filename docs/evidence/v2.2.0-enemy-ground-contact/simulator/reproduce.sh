#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 4 ]; then
    printf 'Usage: bash %s <baseline-checkout> <hotfix-checkout> <work-directory> <atlas-output>\n' "$0" >&2
    exit 2
fi
: "${ART_LAB_MCP_ENTRY:?Set ART_LAB_MCP_ENTRY to the absolute beyond-simulator-mcp 0.5.2 dist/index.js path}"
capture_tools=$(cd -- "$(dirname -- "$0")" && pwd)
old_repo=$(cd -- "$1" && pwd)
new_repo=$(cd -- "$2" && pwd)
mkdir -p -- "$3" "$4"
capture_work=$(cd -- "$3" && pwd)
atlas_output=$(cd -- "$4" && pwd)
base=$(git -C "$old_repo" rev-parse HEAD)
if [ "$base" != 5ccff59e9df396849216fb3f790be8852974c769 ]; then
    printf 'The baseline checkout is %s and must be release commit 5ccff59e.\n' "$base" >&2
    exit 1
fi

capture_checkout() (
    local source_checkout=$1
    local captures=$2
    cd -- "$source_checkout"
    mkdir -p -- "$captures/lua"
    node --input-type=module - "$captures/lua" <<'JS'
import {buildUI} from './scripts/build-ui.mjs';
import {buildLuaData} from './scripts/build-lua-data.mjs';
import {join} from 'node:path';
const output = process.argv[2];
buildUI(output, undefined, {officialAssets:true, refinedReleaseMonsterArt:true, nativePageLifecycle:true});
buildLuaData('data', join(output, 'abyss_data.lua'));
JS
    LUA_PATH="$captures/lua/?.lua;./src/lua/?.lua;;" \
        node node_modules/fengari-node-cli/src/lua-cli.js -e 'dofile(os.getenv("GROUNDING_CAPTURE_SCRIPT"))' \
        > "$captures/scenes.ndjson"
    node --input-type=module - "$captures" <<'JS'
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const output = process.argv[2];
const lines = readFileSync(join(output,'scenes.ndjson'),'utf8').split('\n').filter(line=>line.startsWith('SCENE '));
const gallery=lines.filter(line=>JSON.parse(line.slice(6)).name.startsWith('monster-'));
const focus=lines.filter(line=>!JSON.parse(line.slice(6)).name.startsWith('monster-'));
if(gallery.length!==42 || focus.length!==12) throw Error('Unexpected capture inventory');
writeFileSync(join(output,'gallery.ndjson'),gallery.join('\n')+'\n');
writeFileSync(join(output,'focus.ndjson'),focus.join('\n')+'\n');
JS
    node "$capture_tools/render.mjs" "$source_checkout" "$captures/focus.ndjson"
    SIM_OUTPUT_SUBDIR=gallery node "$capture_tools/render.mjs" "$source_checkout" "$captures/gallery.ndjson"
)
export GROUNDING_CAPTURE_SCRIPT="$capture_tools/capture.lua"
export XDG_CACHE_HOME="$capture_work/simulator-cache"
capture_checkout "$old_repo" "$capture_work/before"
capture_checkout "$new_repo" "$capture_work/after"
python "$capture_tools/atlas.py" "$capture_work/before" "$capture_work/after" "$atlas_output" --repo "$new_repo"
