import { nativeControls, nativeTheme } from './native-ui-theme.mjs';
import { readFileSync } from 'node:fs';
const liyueReference = JSON.parse(readFileSync(new URL('../data/presentation/liyue_transition_reference.json', import.meta.url), 'utf8'));

// Presentation-only controls for the title vista and the opening cinematic.
// Every picture is a tinted shape from the platform picture library;
// Lua moves, scales and recolours them and never reads rules from here.
function helpers(theme) {
  const controls = nativeControls(theme);
  const picture = (name, values, image, colour, extra = {}) => ({ name, kind: 'image',
    position: values.slice(0, 2), size: values.slice(2, 4), image, colour, ...extra });
  return { ...controls, picture };
}

export function vistaControl(theme = nativeTheme, name = 'vista') {
  const { picture, plate } = helpers(theme);
  const v = theme.layout.vista, c = theme.color, im = theme.image, tone = c.vista;
  const [sx, sy] = v.seal, centre = [0, 0];
  const seal = { name: 'seal', kind: 'container', position: [sx, sy], size: v.seal.slice(2), children: [
    picture('core', [...centre, v.seal[2] * 0.9, v.seal[3] * 0.9], im.glow, c.goldBright, { opacity: 0.55 }),
    picture('ring', [...centre, ...v.seal.slice(2)], im.ring, c.gold, { opacity: 0.8 }),
    picture('heart', [...centre, ...v.sealCore.slice(2)], im.disc, c.goldBright),
  ] };
  return { name, kind: 'container', size: v.cover.slice(2), children: [
    plate('sky', v.cover, tone.sky),
    picture('halo', v.halo, im.glowWide, c.geoDeep, { opacity: 0.32 }),
    ...v.beams.map((frame, i) => picture(`beam${i + 1}`, frame, im.beam, c.goldDim, { opacity: 0.16 })),
    picture('towerBack', v.towerBack, im.ruin, tone.far),
    picture('tower', v.tower, im.ruin, tone.mid),
    seal,
    ...v.shards.map((frame, i) => picture(`shard${i + 1}`, frame, im.shards, c.goldDim)),
    ...v.pillars.map((frame, i) => picture(`pillar${i + 1}`, frame, im.ruin, tone.near)),
    picture('wall', v.wall, im.ruinWall, tone.near),
    plate('ground', v.ground, tone.ground),
    picture('horizon', v.horizon, im.fadeLine, c.geoDeep, { opacity: 0.45 }),
    ...v.motes.map((at, i) => picture(`mote${i + 1}`, [...at, v.mote, v.mote], im.disc, c.goldBright)),
    picture('vignette', v.vignette, im.vignette, tone.shade, { opacity: 0.85 }),
  ] };
}

function liyueSeal(picture, p) {
  const scale = p.seal[2] / p.symbolBase;
  const shapes = liyueReference.controls.map(s => picture(`part${s.sourceIndex}`,
    [...s.position.map(v => v * scale), ...s.size.map(v => v * scale)], s.image, s.colour, { rotation: s.rotation }));
  // Fixed source geometry. Two groups respect the native 60-direct-child limit.
  const groups = [shapes.slice(0, 48), shapes.slice(48)].map((children, i) => ({
    name: `parts${i + 1}`, kind: 'container', size: p.seal.slice(2), children,
  }));
  return { name: 'seal', kind: 'container', position: p.seal.slice(0, 2), size: p.seal.slice(2), children: groups };
}

function liyueElements(picture, p, colour) {
  return p.elements.images.map((image, i) => picture(`element${i + 1}`,
    [(i - 3) * p.elements.step, p.elements.y, p.elements.size, p.elements.size], image, colour));
}

export function styleLiyuePageReveal(cover, theme) {
  const { picture } = helpers(theme), p = theme.layout.prologue;
  const part = name => cover.children.find(node => node.name === name);
  const veil = part('veil'), message = part('message'), cancel = part('cancel');
  veil.colour = p.shade;
  message.text.colour = p.ink;
  message.position = p.title.slice(0, 2);
  cancel.position = [0, -318];
  cover.children.splice(cover.children.indexOf(veil) + 1, 0, liyueSeal(picture, p), ...liyueElements(picture, p, p.ink));
}

export function prologueControl(theme = nativeTheme) {
  const { picture, plate, text } = helpers(theme), p = theme.layout.prologue;
  return { name: 'prologuePanel', kind: 'container', size: [...theme.canvas.base], visible: false, children: [
    { name: 'scene', kind: 'container', size: [...theme.canvas.base], children: [
      plate('shade', [0, 0, ...theme.canvas.base], p.shade),
      liyueSeal(picture, p),
      text('title', p.title, '璃月', theme.font.heading, p.ink),
      text('line', p.line, '岩层深处传来了异常的共鸣。', theme.font.body, p.ink),
      ...liyueElements(picture, p, p.dim),
    ] },
    plate('fade', [0, 0, ...theme.canvas.base], p.shade),
    { name: 'blocker', kind: 'cursorArea', size: [...theme.canvas.base], focusable: false },
  ] };
}

export const shopMerchantTarget = Object.freeze([195, -154, 220, 236]);

// The static room owns the full figure. This overlay owns only its receiver and
// the brief purchase response, which sits above the cards and below the HUD.
export function merchantControl(theme = nativeTheme) {
  const { plate, text, hit } = helpers(theme);
  const [x, y, w, h] = shopMerchantTarget;
  const feedback = [505, 302, 146, 40];
  const hidden = control => ({ ...control, visible: false });
  const style = theme.layout.merchant.bubble;
  return { name: 'merchant', kind: 'container', position: [0, 0], size: [...theme.canvas.base], visible: false, children: [
    hidden({ name: 'bubble', kind: 'container', position: feedback.slice(0, 2), size: feedback.slice(2), children: [
      plate('trim', [0, 0, 146, 40], style.edge), plate('paper', [0, 0, 142, 36], style.fill),
    ] }),
    hidden(text('line', feedback, '', 17, style.ink)),
    { name: 'talk', kind: 'container', position: [x, y], size: [w, h], children: [hit([w, h])] },
  ] };
}
