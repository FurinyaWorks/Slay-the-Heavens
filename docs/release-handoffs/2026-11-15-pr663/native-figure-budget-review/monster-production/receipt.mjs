import assert from 'node:assert/strict';

export function checkPortraitReceipt(layout, receipt, expected) {
  const rows = Array.isArray(layout.rows) ? layout.rows : Object.values(layout.imageRows).flat();
  assert(rows.length > 0);
  for (const row of rows) {
    assert([20,21].includes(row.length) && row.every(Number.isFinite), 'invalid numeric primitive row');
    assert([100001,100002,100003].includes(row[0]), 'primitive ID must be from native geometry palette');
    assert(row[3]>0 && row[4]>0, 'bounds must be positive');
    assert(row.slice(14,18).every(n=>Number.isInteger(n)&&n>=0&&n<=255), 'invalid native color');
    assert(row.length===20||row[20]===0||row[20]===1&&row[0]===100003, 'invalid mask selector');
  }
  assert.equal(rows.length, receipt.images, 'compiled images diverge from mounted images');
  assert.equal(receipt.controls, receipt.images+receipt.containers, 'containers must be counted');
  assert.equal(receipt.controls, expected);
  assert.equal(receipt.pass, true);
  assert.equal(receipt.staticPoseFrames, 120);
  assert.equal(receipt.imageWrites, 0);
  assert.equal(receipt.recreatedControls, 0);
  assert.equal(receipt.liveAfterRelease, 0);
  assert.match(receipt.scope,/standalone actual controller mock/);
  return {images:receipt.images,containers:receipt.containers,controls:receipt.controls,scope:'offline-art-only'};
}
