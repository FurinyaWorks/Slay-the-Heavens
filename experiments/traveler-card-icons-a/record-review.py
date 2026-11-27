#!/usr/bin/env python3
"""Bind an independent review to exact reviewed art; fail closed for production use."""
import argparse
import hashlib
import json
import re
from pathlib import Path

def load(path):
 def strict(pairs):
  obj={}
  for k,v in pairs:
   if k in obj: raise ValueError(f'duplicate field: {k}')
   obj[k]=v
  return obj
 return json.loads(path.read_text(),object_pairs_hook=strict)

def run(art, reviews, out, authored=False):
 semantic=load(art/'semantic.json')
 reviews=load(reviews)
 if not isinstance(reviews,dict) or set(reviews)-set(semantic):
  raise ValueError('review includes unknown images')
 result={}
 for id,row in semantic.items():
  if not re.fullmatch(r'[a-z][a-z0-9_]+',id):
   raise ValueError(f'invalid card ID: {id}')
  checksum=hashlib.sha256((art/(id+'.json')).read_bytes()).hexdigest()
  imagechecksum=hashlib.sha256((art/(id+'.png')).read_bytes()).hexdigest()
  review=reviews.get(id)
  if review:
   if review.get('sourceSha256')!=checksum or review.get('previewSha256')!=imagechecksum:
    raise ValueError(f'review refers to stale art for {id}')
   if not all(isinstance(review.get(k),str) and review[k].strip() for k in ('reviewer','freeRead','evidence')):
    raise ValueError(f'incomplete independent review for {id}')
   if review.get('smallArtVerdict') not in ('PASS','HOLD'):
    raise ValueError(f'invalid small art review for {id}')
   row.update(offlineReview=review)
   if review['smallArtVerdict']=='HOLD':
    row['reviewStatus']='pending'
   elif authored and row['reviewStatus']!='owner-sample-accepted':
    # A source review is not a release review; no mounts can be claimed
    # here and this deliberately keeps the native final-pack gate closed.
    row['reviewStatus']='pending'
  result[id]=row
 out.write_text(json.dumps(result,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n')
 print(f'Bound {len(reviews)} independent offline records to {len(semantic)} exact author inputs; no release approval changed')

def main():
 p=argparse.ArgumentParser();p.add_argument('art',type=Path);p.add_argument('reviews',type=Path);p.add_argument('out',type=Path);p.add_argument('--authoring-only',action='store_true');a=p.parse_args()
 run(a.art,a.reviews,a.out,a.authoring_only)

if __name__=='__main__':main()
