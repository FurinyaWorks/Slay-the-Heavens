import { nativeShape } from './v25-battle-scene.mjs';

// Editable contours traced from the owner's opening-screen design. Points are
// in the reference image's 1672 × 941 coordinate space, in back-to-front order.
const dark = '#1C2929';
const stone = '#535A51';
const lightStone = '#74786B';
const trim = '#867B60';
const gold = '#BFA877';

const throneBack = [
  ['leftBackOutline', dark, [[1287, 209], [1390, 168], [1390, 472], [1287, 472]]],
  ['leftBack', stone, [[1295, 214], [1382, 180], [1382, 464], [1295, 464]]],
  ['leftBackBevel', lightStone, [[1295, 215], [1382, 181], [1382, 190], [1295, 225]]],
  ['spireOutline', dark, [[1376, 107], [1464, 74], [1464, 399], [1376, 399]]],
  ['spire', stone, [[1385, 113], [1455, 86], [1455, 390], [1385, 390]]],
  ['spireBevel', trim, [[1385, 113], [1455, 86], [1455, 97], [1385, 126]]],
  ['spireMotif', trim, [1408, 124, 27, 25]],
  ['spireInset', stone, [1416, 131, 11, 11]],
  ['rightBackOutline', dark, [[1495, 242], [1574, 270], [1574, 472], [1495, 472]]],
  ['rightBack', stone, [[1503, 254], [1565, 276], [1565, 472], [1503, 472]]],
  ['rightBackBevel', trim, [[1503, 254], [1565, 276], [1565, 289], [1503, 267]]],
];

const throneSides = [
  ['leftPillarOutline', dark, [[1114, 450], [1197, 420], [1197, 688], [1114, 688]]],
  ['leftPillar', stone, [[1123, 456], [1189, 433], [1189, 679], [1123, 679]]],
  ['leftPillarBevel', trim, [[1123, 456], [1189, 433], [1189, 445], [1123, 468]]],
  ['leftMotif', trim, [1145, 468, 27, 26]],
  ['leftInset', stone, [1152, 475, 13, 12]],
  ['rightPillarOutline', dark, [[1537, 445], [1579, 445], [1624, 468], [1624, 678], [1537, 678]]],
  ['rightPillar', stone, [[1546, 454], [1616, 475], [1616, 669], [1546, 669]]],
  ['rightMotif', trim, [1566, 494, 34, 38]],
  ['rightInset', stone, [1574, 502, 26, 22]],
];

const foundation = [
  ['baseOutline', dark, [[1037, 778], [1070, 674], [1081, 674], [1081, 590], [1230, 590], [1250, 669], [1638, 669], [1649, 778]]],
  ['leftStep', stone, [[1049, 770], [1077, 683], [1162, 683], [1162, 770]]],
  ['leftSeat', lightStone, [1089, 599, 86, 74]],
  ['rightStep', stone, [[1545, 675], [1629, 675], [1640, 769], [1545, 769]]],
];

const drape = [
  ['lowerOutline', dark, [[1197, 482], [1332, 511], [1507, 471], [1582, 696], [1573, 787], [1157, 787], [1117, 773], [1123, 699]]],
  ['leftDrape', '#454E48', [[1200, 493], [1332, 525], [1384, 510], [1337, 777], [1127, 777], [1131, 694]]],
  ['leftDrapeLight', '#777B70', [[1199, 496], [1239, 490], [1352, 535], [1225, 516], [1198, 668], [1130, 706]]],
  ['hem', gold, [[1378, 509], [1385, 516], [1294, 615], [1294, 737], [1241, 777], [1224, 777], [1282, 731], [1282, 611]]],
];

const leg = [
  ['rightDrape', '#6A7064', [[1438, 490], [1496, 482], [1567, 678], [1547, 689], [1466, 643], [1374, 690]]],
  ['rightDrapeShade', '#494F48', [[1480, 518], [1496, 482], [1567, 678], [1547, 689], [1466, 643]]],
  ['rightFoot', '#727669', [[1421, 673], [1462, 651], [1452, 698], [1464, 733], [1404, 733]]],
  ['footStep', lightStone, [[1351, 742], [1499, 742], [1507, 778], [1339, 778]]],
];

const torso = [
  ['robeOutline', dark, [[1282, 437], [1325, 376], [1395, 347], [1484, 355], [1549, 449], [1334, 534], [1255, 494]]],
  ['robe', '#4D5750', [[1291, 438], [1332, 383], [1396, 355], [1478, 364], [1540, 452], [1332, 525], [1265, 492]]],
  ['robeLight', '#656B60', [[1332, 383], [1389, 403], [1377, 494], [1331, 524], [1296, 508]]],
  ['robeShade', '#293631', [[1457, 392], [1518, 443], [1479, 447], [1428, 476], [1433, 432]]],
  ['collar', gold, [[1332, 382], [1344, 377], [1391, 406], [1466, 363], [1479, 365], [1396, 424], [1386, 496], [1377, 501], [1384, 420]]],
  ['clasp', gold, [[1390, 390], [1407, 411], [1390, 433], [1374, 411]]],
];

const head = [
  ['hoodOutline', dark, [[1315, 320], [1331, 269], [1348, 241], [1383, 219], [1418, 231], [1480, 362], [1420, 349], [1366, 373]]],
  ['hood', '#797D70', [[1324, 317], [1338, 272], [1354, 247], [1384, 229], [1414, 240], [1469, 352], [1361, 272]]],
  ['hoodInterior', '#293631', [[1325, 321], [1361, 272], [1459, 358], [1402, 380], [1371, 365]]],
  ['face', '#60685C', [[1355, 318], [1365, 325], [1400, 308], [1413, 320], [1384, 355], [1366, 345]]],
  ['neck', '#6D7467', [[1384, 352], [1398, 345], [1401, 373], [1391, 399]]],
];

const hands = [
  ['raisedArmOutline', dark, [[1189, 322], [1247, 339], [1263, 389], [1300, 427], [1316, 498], [1215, 482], [1233, 394], [1194, 371]]],
  ['raisedArm', '#767C70', [[1197, 330], [1212, 351], [1224, 357], [1222, 342], [1236, 346], [1260, 397], [1296, 433], [1306, 492], [1223, 477], [1239, 392], [1208, 369]]],
  ['raisedArmShade', '#49544D', [[1239, 392], [1260, 463], [1266, 489], [1223, 477]]],
  ['restingArm', '#83877A', [[1531, 453], [1509, 482], [1436, 483], [1417, 532], [1387, 539], [1410, 464]]],
  ['restingArmBevel', '#A0A08D', [[1494, 440], [1531, 453], [1504, 463], [1430, 467]]],
];

const cube = [
  ['cubeOutline', dark, [[1203, 296], [1232, 282], [1263, 297], [1263, 334], [1232, 351], [1203, 334]]],
  ['cubeTop', '#DAC08C', [[1210, 302], [1232, 291], [1255, 302], [1232, 315]]],
  ['cubeLeft', '#C7A871', [[1210, 302], [1232, 315], [1232, 341], [1210, 329]]],
  ['cubeRight', '#A98450', [[1232, 315], [1255, 302], [1255, 329], [1232, 341]]],
];

const scaleX = 1280 / 1672;
const scaleY = 720 / 941;

function stoneGroup(name, faces, theme) {
  const children = faces.flatMap(([face, colour, geometry]) => {
    const shape = typeof geometry[0] === 'number'
      ? { type: 'rect', box: geometry.map((value, index) => value * (index % 2 ? scaleY : scaleX)) }
      : { type: 'polygon', points: geometry.map(([x, y]) => [x * scaleX, y * scaleY]) };
    return nativeShape({ name: face, colour, opacity: 1, ...shape },
      theme, { edgeBleed: 0.25, earSelection: 'balanced' })
      .map(control => ({ ...control, colour }));
  });
  return { name, kind: 'container', position: [0, 0], size: [1280, 720], children };
}

export function geoStatue(theme) {
  // The battle shape adapter's origin is 22 px below the full UI origin.
  return {
    name: 'geoStatue', kind: 'container', position: [0, 22], size: [1280, 720],
    children: [
      stoneGroup('throneBack', throneBack, theme),
      stoneGroup('throneSides', throneSides, theme),
      stoneGroup('foundation', foundation, theme),
      stoneGroup('drape', drape, theme),
      stoneGroup('leg', leg, theme),
      stoneGroup('torso', torso, theme),
      stoneGroup('head', head, theme),
      stoneGroup('hands', hands, theme),
      stoneGroup('cube', cube, theme),
    ],
  };
}
