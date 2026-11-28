from pathlib import Path
from hashlib import sha256
import json
import subprocess
import sys

baseline_repo,after_repo,before,after,evidence=map(Path,sys.argv[1:6])
load=lambda root,name:json.loads((root/name).read_text())
hash_file=lambda file:sha256(file.read_bytes()).hexdigest()
git=lambda path,*args:subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
base_commit=git(baseline_repo,'rev-parse','HEAD')
files=git(after_repo,'diff','--name-only',base_commit,'--','src/lua','scripts','data/presentation').splitlines()

def side(source,path):
    blobs={f:hash_file(source/f) for f in files}
    identity=load(path,'identity.json')
    bounds=load(path,'measurements.json')
    receipts=load(path/'png','receipts.json')
    rows={}
    for name, frame in bounds.items():
        receipt=next(r for r in receipts if r['name']==name)
        powers={}
        for status,power in frame['powers'].items():
            powers[status]={'amount':power['value'],**{
                kind:{'boundsCenteredXYWH':[round(n,4) for n in v['boundsCenteredXYWH']],
                      'verticalClearance':round(v['firstPixelTopClearance'],4),
                      'overlapsHand':any(p>1e-4 for p in v['perCardOverlapArea'])}
                for kind,v in power.items() if kind!='value'}}
        rows[name]={
            'viewport':frame['viewport'],'contactY':round(frame['contactY'],4),'hpCenterY':round(frame['healthY'],4),
            'intentCenterY':round(frame['intentY'],4),'targetRectCenteredXYWH':[round(n,4) for n in frame['hitbox']],
            'handFaceTopY':round(frame['handTopY'],4),'handReceiverTopY':round(frame['handHitTopY'],4),
            'powersFirstActor':powers,
            'nameAndCostBoxesWithinViewport': all(v['name']['fullBoxInViewport'] and v['cost']['fullBoxInViewport']
                for v in frame['handTextBoxes'].values()),
            'outerTypeBoxCrossesViewport': not all(v['type']['fullBoxInViewport']
                for v in frame['handTextBoxes'].values()), 'pngSha256':receipt['sha256'],
            'snapshotSaveSha256':receipt['snapshotSaveSha256'],'assetWarnings':receipt['capture']['assetWarnings']}
    return {**identity,'productionFileSha256':blobs,'frames':rows}

results={'motionVersion':'same current capture harness per side',
        'geometrySpace':'center-origin XY in 1280×720 logical stage with +Y up; top-aligned amount line budgets 1.2×font',
        'rendering':'production GameUI Lua on Fengari + native fixture API; nested native control snapshots rendered as static scenes in Beyond Simulator 0.5.2',
        'sampledStressGeometry':'selects the first of five live canonical Lots of Slimes actors; combination suite covers all actors',
        'baseline':side(baseline_repo,before),'candidate':side(after_repo,after),
        'comparisonImagesSha256': {file.name:hash_file(file) for file in sorted(evidence.glob('*.webp'))}}
(evidence/'render-manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
