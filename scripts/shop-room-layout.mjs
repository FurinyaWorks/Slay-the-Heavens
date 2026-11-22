import { nativeControls } from './native-ui-theme.mjs';
import { shopMerchantTarget } from './cinematic-ui-layout.mjs';
import { polygon } from './v25-node-layout.mjs';

const group = (name, children, position = [0, 0], size = [1280, 720]) =>
  ({ name, kind: 'container', size, position, children });
const art = (name, x, y, w, h, image, colour, extra) =>
  ({ name, kind: 'image', position: [x, y], size: [w, h], image, colour, ...extra });
const rect = (name, x, y, w, h, colour, extra) => art(name, x, y, w, h, 100001, colour, extra);
const oval = (name, x, y, w, h, colour, extra) => art(name, x, y, w, h, 100002, colour, extra);
const slope = (name, points, colour) => polygon(name, points.map(([x, y]) => [x + 640, 360 - y]), colour);

function line(name, x1, y1, x2, y2, width, colour) {
  const dx = x2 - x1, dy = y2 - y1;
  return rect(name, (x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(dx, dy), width, colour,
    { rotation: Math.atan2(dy, dx) * 180 / Math.PI });
}

function stoneFloor(image) {
  const courses = [-83, -109, -147, -197, -264, -357];
  return group('stoneFloor', [
    rect('slate', 0, -221, 1280, 278, '#394747'),
    art('depth', 0, -222, 1280, 276, 106095, '#151E20', { opacity: .55 }),
    rect('terraceEdge', 0, -77, 1280, 12, '#81745F'),
    ...courses.slice(0, -1).flatMap((y, row) => [
      rect(`course${row}`, 0, y, 1280, 1 + row * .5, '#263236'),
      ...[-.76, -.26, .27, .69].map((offset, col) => {
        const x = offset * 625 + (row % 2) * 42;
        return line(`joint${row}_${col}`, x, y, x + offset * (10 + row * 16), courses[row + 1], 1 + row * .35, '#2A3539');
      }),
    ]),
    art('stallLight', 200, -193, 665, 257, image.glowWide, '#D8A155', { opacity: .26 }),
  ]);
}

function column(x, i) {
  return group(`column${i}`, [
    rect('stone', 0, 121, 65, 375, '#3A3936'),
    rect('litFace', -13, 121, 34, 375, i % 2 ? '#665347' : '#54473E'),
    rect('bevel', -30, 121, 5, 375, '#907255', { opacity: .62 }),
    rect('capital', 0, 288, 84, 24, '#594A42'),
    rect('plinth', 0, -64, 90, 16, '#4E4942'),
    rect('foot', 0, -74, 100, 6, '#302B2A'),
  ], [x, 0]);
}

function lantern(image, x, y, name) {
  return group(name, [
    art('halo', 0, 0, 185, 210, image.glow, '#F6A958', { opacity: .58 }),
    rect('hanger', 0, 37, 2, 44, '#B88751'),
    oval('shade', 0, 0, 42, 32, '#A94D36'),
    oval('paper', 0, 0, 30, 29, '#F2AF5A'),
    rect('rib', 0, 0, 3, 29, '#FCD793'),
    rect('tassel', 0, -19, 3, 13, '#BF6643'),
  ], [x, y]);
}

function seatedVendor(x, y) {
  return group('vendor', [
    oval('contactShadow', 1, -49, 139, 24, '#17302C', { opacity: .8 }),
    oval('seat', 1, -43, 105, 27, '#AD614B'),
    oval('foldedLeftLeg', -25, -34, 78, 35, '#25484B', { rotation: -23 }),
    oval('foldedRightLeg', 29, -36, 82, 32, '#315C5C', { rotation: 19 }),
    oval('farBoot', 34, -50, 30, 14, '#302A2A', { rotation: 7 }),
    oval('nearBoot', -22, -50, 33, 13, '#4B3B33', { rotation: -11 }),
    slope('coat', [[-36, 29], [23, 32], [42, -25], [17, -37], [-43, -25]], '#36706D'),
    slope('coatLight', [[-32, 25], [-6, 27], [-13, -20], [-41, -25]], '#4D8B7D'),
    oval('farSleeve', 33, 3, 25, 55, '#245451', { rotation: 20 }),
    oval('nearSleeve', -37, 1, 28, 54, '#428279', { rotation: -29 }),
    line('collar', -24, 27, 10, 7, 9, '#E1BC7F'),
    line('lapel', 19, 29, 5, 6, 7, '#785343'),
    line('sash', -27, -19, 26, -24, 8, '#AA5945'),
    oval('farHand', 26, -20, 17, 13, '#BE8861', { rotation: 13 }),
    oval('nearHand', -23, -18, 19, 13, '#F3BD89', { rotation: -15 }),
    oval('hair', -5, 43, 46, 53, '#3A2C28'),
    oval('face', -11, 42, 34, 41, '#E0AB7F'),
    oval('nose', -26, 40, 9, 8, '#EABB8B'),
    rect('brow', -20, 46, 9, 2, '#51332D', { rotation: 10 }),
    oval('beard', -10, 28, 26, 16, '#6A5546', { rotation: -6 }),
    art('strawCrown', -6, 69, 62, 34, 100003, '#D3A55F', { rotation: 7 }),
    oval('hatBrim', -7, 56, 87, 13, '#724C37', { rotation: 7 }),
    oval('hatRim', -6, 60, 84, 8, '#E5BE78', { rotation: 7 }),
  ], [x, y], [148, 176]);
}

export function shopRoom(theme) {
  const { image, icon } = theme;
  const [x, y] = shopMerchantTarget;
  const { text } = nativeControls(theme);
  return { ...group('shopRoom', [
    rect('sky', 0, 122, 1280, 390, '#182D39'),
    art('mist', -97, 117, 1080, 360, image.glowWide, '#496777', { opacity: .6 }),
    ...[[-470, 105, 325, 299], [-260, 134, 294, 333], [22, 91, 342, 250], [343, 136, 325, 343]]
      .map(([sx, sy, sw, sh], i) => art(`karst${i}`, sx, sy, sw, sh, 100003, i % 2 ? '#304755' : '#243C48', { rotation: i % 2 ? 7 : -5 })),
    rect('distantWall', 0, -37, 1280, 70, '#1E3038'),
    ...[-386, 121, 391].map((p, i) => group(`distantPavilion${i}`, [
      rect('house', 0, -28, 66, 74, '#28343B'),
      art('roof', 0, 15, 114, 35, 100003, '#192B33'),
      rect('window', -10, -19, 12, 18, '#C09A65', { opacity: .66 }),
    ], [p, i % 2 ? 13 : 43])),
    stoneFloor(image),
    ...[-563, -331, -60, 530].map(column),
    rect('overheadBeam', 0, 309, 1280, 23, '#312B2B'),
    rect('beamEdge', 0, 297, 1280, 3, '#635044'),
    lantern(image, -474, 168, 'westLantern'), lantern(image, 443, 156, 'eastLantern'),
    oval('rugShadow', 194, -224, 489, 69, '#273835', { opacity: .72 }),
    slope('rugHem', [[20, -158], [357, -156], [433, -242], [-38, -245]], '#AA8D57'),
    slope('jadeRug', [[23, -160], [354, -158], [424, -237], [-30, -240]], '#416C63'),
    ...[33, 68, 340, 374].map((sx, i) => art(`weave${i}`, sx, -226, 17, 6, image.diamond, '#D2AB6F', { opacity: .8 })),
    art('travelCoffer', 52, -185, 79, 62, image.coffer, '#D0AE79'),
    art('rolledParchment', 104, -208, 39, 27, image.scroll, '#E3C891', { rotation: -14 }),
    art('sealedJar', 324, -185, 40, 52, icon.potion.energy_potion, '#E8C887'),
    art('foldedCards', 373, -211, 36, 34, icon.deck.id ?? icon.deck, '#DDD3A8', { rotation: 14 }),
    seatedVendor(x, y),
    rect('actionPlate', x, -250, 146, 40, '#243C39'),
    rect('actionRule', x, -230, 146, 2, '#B99E65'),
    text('shopPrompt', [x, -250, 140, 40], '查看商品', 17, '#F6E4B4'),
  ]), visible: false };
}
