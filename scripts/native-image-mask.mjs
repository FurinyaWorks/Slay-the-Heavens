// Native image 100001 can clip descendants with its rectangular mask even
// at alpha zero (BeyondSimulator 0.5.2 native PC probe, 2026-10-11).
export function isNativeRectMask(control){
 return control.kind==='image'&&control.image===100001&&control.mask===true&&control.opacity===0
  &&!control.fill&&!control.feather&&!control.invertMask;
}
