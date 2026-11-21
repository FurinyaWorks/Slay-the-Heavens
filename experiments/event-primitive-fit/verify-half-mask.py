"""Validate neutral simulator pixel equality and updated 49-export ledger."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image

def check(probe, receipt=None, baseline=None):
    scenarios = []
    for case in ('straight', 'rotated', 'rotated-mirror-y'):
        read = lambda variant: np.asarray(Image.open(probe / f'{case}-{variant}.png'))
        truth = read('truth')
        bad, good = (int(np.count_nonzero(np.any(read(v) != truth, axis=2)))
                     for v in ('past','mirror'))
        assert bad > 0 and good == 0, (case, bad, good)
        # In the neutral GIA, the only byte differences with the old Left
        # variant must be the sign bit of the 1.0 x-scale in four platform transforms.
        left, mirror = ((probe / f'{case}-{v}.gia').read_bytes() for v in ('past','mirror'))
        assert len(left) == len(mirror)
        diff = [i for i,(a,b) in enumerate(zip(left,mirror)) if a != b]
        assert len(diff) == 4, (case,diff)
        assert all(left[i-3:i+1]==b'\x00\x00\x80\x3f' and mirror[i-3:i+1]==b'\x00\x00\x80\xbf' for i in diff)
        scenarios.append(dict(case=case,old_different_pixels=bad,mirrored_different_pixels=good,
                              gia_bytes=len(mirror),signed_x_scale_records=len(diff)))
    result=dict(simulator='beyond-simulator-mcp@0.5.2',scope='neutral pixels and actual GIA sign bytes; no official import or device evidence',
                neutral=scenarios)
    if receipt and baseline:
        old={r['event']:r for r in json.loads(baseline.read_text())['events']}
        new=json.loads(receipt.read_text())['cases']
        assert len(new)==len(old)==49
        rows=[]
        for row in new:
            assert row['simulator']=='PASS' and not row.get('error') and not row.get('exportError')
            event=row['id'].removesuffix('-60')
            asset,=row['exports']
            expected=old[event]
            assert row['samples'][0]['created']==expected['controls_60']
            assert row['samples'][0]['images']==expected['images_60']
            assert asset['bytes']==expected['gia_bytes']
            rows.append(dict(event=event,controls=expected['controls_60'],gia_bytes=asset['bytes'],
                             gia_sha256=asset['sha256']))
        result['regenerated']=dict(count=len(rows),unchanged_gia_bytes=sum(x['gia_bytes'] for x in rows),
                                   unchanged_controls_min=min(x['controls'] for x in rows),
                                   unchanged_controls_max=max(x['controls'] for x in rows),rows=rows)
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('probe',type=Path)
    p.add_argument('--receipt',type=Path)
    p.add_argument('--baseline',type=Path)
    a=p.parse_args()
    assert bool(a.receipt)==bool(a.baseline)
    print(json.dumps(check(a.probe,a.receipt,a.baseline),ensure_ascii=False,indent=2))
