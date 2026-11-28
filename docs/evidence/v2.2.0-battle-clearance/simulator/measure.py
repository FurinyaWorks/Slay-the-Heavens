import json
import math
import re
import sys
from pathlib import Path

def polygon(cx,cy,w,h,a=0,s=1):
    cos,sin=math.cos(math.radians(a)),math.sin(math.radians(a))
    return [(cx+s*(x*cos-y*sin),cy+s*(x*sin+y*cos))
            for x,y in [(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]]

def restrict(poly,index,threshold,sign):
    result=[]
    for previous,current in zip(poly[-1:]+poly[:-1],poly):
        on_previous=(previous[index]-threshold)*sign>=0
        on_current=(current[index]-threshold)*sign>=0
        if on_previous!=on_current:
            t=(threshold-previous[index])/(current[index]-previous[index])
            result.append(tuple(a+t*(b-a) for a,b in zip(previous,current)))
        if on_current: result.append(current)
    return result

def overlap(rect,poly):
    x,y,w,h=rect
    for index,threshold,sign in [(0,x-w/2,1),(0,x+w/2,-1),(1,y-h/2,1),(1,y+h/2,-1)]:
        poly=restrict(poly,index,threshold,sign)
    return abs(sum(ax*by-ay*bx for (ax,ay),(bx,by) in zip(poly,poly[1:]+poly[:1]))/2)

def top(poly):
    return max(y for _,y in poly)

def measure(scene):
    g=scene['geometry']
    body=g['body']
    cards=g['cards']
    visual=[polygon(c['x'],c['y'],c['w'],c['h'],c['angle'],c['scale']) for c in cards]
    receivers=[]
    for card in cards:
        h=card['hit']; angle=math.radians(card['angle']); cos,sin=math.cos(angle),math.sin(angle)
        x=card['x']+card['scale']*(h['x']*cos-h['y']*sin)
        y=card['y']+card['scale']*(h['x']*sin+h['y']*cos)
        receivers.append(polygon(x,y,h['w'],h['h'],s=card['scale']))
    visual_top=max(map(top,visual))
    hit_top=max(map(top,receivers))
    items={}
    for p in g['powers']:
        count_box=p['count']
        line_height=1.2*p['font']
        glyph_bounds=[*count_box[:2],count_box[2],line_height]
        glyph_bounds[1]+=(count_box[3]-line_height)/2
        rows={}
        for name,rect,hand,hand_top in [('icon',p['icon'],visual,visual_top),('countLine',glyph_bounds,visual,visual_top),('hit',p['hit'],receivers,hit_top)]:
            rows[name]={'boundsCenteredXYWH':rect,'firstPixelTopClearance':rect[1]-rect[3]/2-hand_top,
                        'perCardOverlapArea': [overlap(rect,card) for card in hand]}
        items[p['id']]={'value':p['amount'],**rows}
    titles={}
    for c in scene['controls']:
        match=re.search(r'/battlePanel/card(10|[1-9])/(name|cost|type|label)$',c['path'])
        if match and c['kind']=='text':
            a,b,e,d=c['matrix']
            extent=(abs(e)*c['w']+abs(d)*c['h'])/2
            titles.setdefault(match[1],{})[match[2]]={
                'text':c.get('text'),'viewportBoxY':[c['y']-extent,c['y']+extent],
                'fullBoxInViewport':c['y']-extent>=0 and c['y']+extent<=scene['height']}
    return {'viewport':[scene['width'],scene['height']], 'stageCoordinates':'center-origin XY, +Y up, 1280×720 baseline',
            'contactY':body.get('groundY',0)+body['y'],'healthY':body['healthY']+body['y'],
            'hitbox':[body['hitX'],body['hitY'],body['hitWidth'],body['hitHeight']],
            'intentY':body['intentY']+body['y'],'handTopY':visual_top,'handHitTopY':hit_top,
            'powers':items,'handTextBoxes':titles,'body':body}

for name in sys.argv[1:]:
    out=Path(name)
    scenes=json.loads((out/'scenes.json').read_text())
    measurements={s['name']:measure(s) for s in scenes}
    (out/'measurements.json').write_text(json.dumps(measurements,indent=2,ensure_ascii=False)+'\n')
    for name,m in measurements.items():
        print(out.name,name,'contact/HP/hand-top/hit-top',*(round(m[key],3) for key in ['contactY','healthY','handTopY','handHitTopY']))
        for power, parts in m['powers'].items():
            print(power,parts['value'],{k: (round(r['firstPixelTopClearance'],3),[round(a,1) for a in r['perCardOverlapArea']]) for k, r in parts.items() if k!='value'})
        print('labels fully on screen:',[i for i,r in m['handTextBoxes'].items() if all(r[k]['fullBoxInViewport'] for k in ['name','cost','type'])])
