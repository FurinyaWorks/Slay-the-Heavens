import { nativeControls } from './native-ui-theme.mjs';

export function cardKeywordTip(theme) {
  const { plate, text } = nativeControls(theme);
  const { width, padding, font, fill, border } = theme.layout.powerTips;
  const height = theme.layout.nativeText.lineHeight;
  const copy = text('copy', [0, 0, width - 2 * padding, height], '', font, theme.color.text);
  copy.text = { ...copy.text, align: 'left', valign: 'top', autoSize: false };
  return { name: 'cardKeywordTip', kind: 'container', size: [width, height], visible: false, children: [
    { ...plate('border', [0, 0, width, height], border), raycastTarget: false },
    { ...plate('plate', [0, 0, width - 2, height - 2], fill), raycastTarget: false },
    { ...copy, raycastTarget: false },
  ] };
}
