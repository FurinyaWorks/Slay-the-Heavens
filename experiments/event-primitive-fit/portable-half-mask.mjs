import assert from 'node:assert/strict';

// The GIA lab writer emits left fill only. On the symmetric isosceles line
// art, a negative horizontal scale reflects Left/.5 into the original Right/.5.
export function portableHalfMasks(control) {
  if (control.children) return {...control,children:control.children.map(portableHalfMasks)};
  if (!control.fill) return control;
  assert.equal(control.image,100003,'only the symmetric native triangle may be mirrored');
  assert.equal(control.pivot?.[0],.5,'half-mask needs a horizontally centered pivot');
  assert.equal(control.fill.shape,'horizontal');
  assert.equal(control.fill.from,'right');
  assert.equal(control.fill.amount,.5);
  const [x=1,y=1]=control.scale??[];
  assert(Number.isFinite(x)&&x!==0&&Number.isFinite(y)&&y!==0);
  return {...control,scale:[-x,y],fill:{...control.fill,from:'left'}};
}
