import { nativeControls } from './native-ui-theme.mjs';

// Single flat information-window surface shared with the potion use/discard
// popup. "face" preserves each existing Lua control path; no action or hit
// target is introduced for read-only relic/shop/treasure information.
export function compactPopupSurface(theme, size, { face = 'plate', readOnly = false } = {}) {
  const [width, height] = size;
  if (!(width > 2 && height > 2)) throw new Error('Compact popup requires a positive inner surface');
  const { plate } = nativeControls(theme);
  const rim = plate('border', [0, 0, width, height], theme.color.goldDim);
  const fill = plate(face, [0, 0, width - 2, height - 2], theme.color.panel);
  if (readOnly) {
    rim.raycastTarget = false;
    fill.raycastTarget = false;
  }
  return [rim, fill];
}
