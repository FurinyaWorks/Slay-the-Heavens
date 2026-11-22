import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
if (!args.length) throw Error('Usage: node paint.mjs <evidence directory>...');
const esc = value => String(value ?? '').replace(/[<>&"']/g, char =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[char]));
const inline = text => text.split(/(<color=#[\da-f]{6}>|<\/color>)/gi).map(part => {
    if (part === '</color>') return '</span>';
    if (part.startsWith('<color=')) return '<span style="color:' + esc(part.slice(7, -1)) + '">';
    return esc(part);
}).join('');
const place = (kind, w, h, attr = '') => '<' + kind + ' x="' + -w / 2 + '" y="' + -h / 2
    + '" width="' + w + '" height="' + h + '" ' + attr + '/>';
const paint = (image, w, h, fill, colour) => {
    const id = Number(image);
    if (id === 100001) return place('rect', w, h);
    if (id === 100002) return '<ellipse rx="' + w / 2 + '" ry="' + h / 2 + '"/>';
    if (id === 100003) {
        const corners = [[0, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]];
        if (fill?.amount === .5 && fill?.shape === 'horizontal') {
            corners[fill.from === 'right' ? 1 : 2][0] = 0;
        }
        return '<polygon points="' + corners.map(point => point.join(',')).join(' ') + '"/>';
    }
    if ([106028, 106029, 106056, 106057, 106091, 106095].includes(id)) {
        const stops = '<stop offset="0" stop-color="' + esc(colour) + '"/><stop offset="1" stop-color="' + esc(colour) + '" stop-opacity="0"/>';
        const radial = [106028, 106029, 106056, 106057].includes(id);
        const gradient = radial ? 'radialGradient' : 'linearGradient';
        const key = 'gradient' + id + colour.replace(/[^a-z0-9]/gi, '');
        const definition = '<defs><' + gradient + ' id="' + key + '"' + (radial ? '' : ' x2="0" y2="100%"') + '>' + stops + '</' + gradient + '></defs>';
        const shape = radial ? '<ellipse rx="' + w / 2 + '" ry="' + h / 2 + '" fill="url(#' + key + ')"/>' : place('rect', w, h, 'fill="url(#' + key + ')"');
        return definition + shape;
    }
    if (id === 100004) return '<polygon points="0,' + -h / 2 + ' ' + w / 2 + ',0 0,' + h / 2 + ' ' + -w / 2 + ',0"/>';
    if (w < 2 || h < 2) return '';
    return '<g opacity=".72">' + place('rect', w, h, 'fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width=".7" rx="2"') +
        (w > 30 && h > 16 ? '<text class="asset" text-anchor="middle" y="4" fill="currentColor" font-size="' +
            Math.min(12, Math.max(8, w / 10)) + '">' + id + '</text>' : '') + '</g>';
};
function render(control) {
    if (control.visible === false || control.kind === 'cursorArea') return '';
    const [x, y] = control.position ?? [0, 0], [w, h] = control.size ?? [1280, 720], [sx, sy] = control.scale ?? [1, 1];
    const [px, py] = control.pivot ?? [.5, .5];
    const tr = 'translate(' + x + ' ' + -y + ') rotate(' + -(control.rotation ?? 0) + ') scale(' + sx + ' ' + sy + ') translate(' + ((.5 - px) * w) + ' ' + ((py - .5) * h) + ')';
    const attributes = ' transform="' + tr + '" opacity="' + (control.opacity ?? 1) + '"';
    let body = '';
    if (control.kind === 'image') {
        const colour = control.colour ?? '#D7CDA9';
        body = '<g style="color:' + esc(colour) + ';fill:' + esc(colour) + '">' + paint(control.image, w, h, control.fill, colour) + '</g>';
    } else if (control.kind === 'text' && control.text?.content) {
        const t = control.text;
        body = '<foreignObject x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h +
            '"><div xmlns="http://www.w3.org/1999/xhtml" class="text" data-min="' + t.minFontSize +
            '" style="color:' + esc(t.colour) + ';font-size:' + t.fontSize + 'px;text-align:' + (t.align === 'left' ? 'left' : 'center') +
            ';justify-content:' + (t.align === 'left' ? 'flex-start' : 'center') + ';align-items:' + (t.valign === 'top' ? 'flex-start' : 'center') +
            '"><span>' + inline(t.content) + '</span></div></foreignObject>';
    } else if (Array.isArray(control.children)) {
        body = control.children.map(render).join('');
    }
    return '<g' + attributes + '>' + body + '</g>';
}
function find(control, name) {
    if (control.name === name) return control;
    for (const child of Array.isArray(control.children) ? control.children : []) {
        const result = find(child, name);
        if (result) return result;
    }
}
const css = 'body{margin:0;background:#0B0F10;color:#EEE7D6;font-family:"Noto Sans CJK SC",sans-serif}header{height:42px;padding:0 14px;display:flex;align-items:center;color:#DAD0B8;background:#211F1F;font-size:14px}svg.canvas{display:block}.asset{font-family:monospace}.text{margin:0;width:100%;height:100%;display:flex;overflow:hidden;white-space:pre-wrap;line-height:1.27}.text span{max-width:100%;overflow-wrap:anywhere}';
for (const arg of args) {
    const directory = resolve(arg);
    const scenes = JSON.parse(readFileSync(join(directory, 'scenes.json')));
    for (const scene of scenes) {
        const screen = find(scene.tree, 'nodePanel');
        if (!screen) throw Error('shop capture omitted nodePanel');
        const label = 'OFFLINE · ' + scene.name + ' · Fengari runtime geometry · library textures shown as labelled placeholders';
        const html = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><header>' + esc(label) + '</header>' +
            '<svg class="canvas" width="1280" height="720" viewBox="-640 -360 1280 720">' + render(screen) + '</svg>' +
            '<script>for(const e of document.querySelectorAll(".text")){let size=parseFloat(e.style.fontSize),min=+e.dataset.min;while(e.firstChild.scrollHeight>e.clientHeight&&size>min)e.style.fontSize=(--size)+"px";}</script>';
        writeFileSync(join(directory, scene.name + '.html'), html);
    }
}
