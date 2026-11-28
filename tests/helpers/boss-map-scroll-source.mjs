import assert from 'node:assert/strict';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';

// Exact predecessor is Release 654d05824486680d994b860ce6e24ea30c43dcff.
// Current bytes are authenticated in full before taking the postimage lines.
const changes = {
 "scripts/build-ui.mjs": {
  "current": {
   "sha256": "70f9d021957f2e76898bc3621ac2d76821b102c7b74f99807a5ad5fe2c61db3c",
   "gitBlob": "4cfc4e3217257481966a329ea2a63b2f12277a39"
  },
  "previous": {
   "sha256": "fd387ceae0b70600cf3e58d82797b3b392261607e4967370e4cfe00358603d04",
   "gitBlob": "cf43e6b718de84eea64d7b7513e0241a487012d1"
  },
  "hunks": [
   {
    "at": 38,
    "count": 3,
    "before": "import {applyV25MapLayout} from './v25-map-layout.mjs';\nimport {applyV25MenuLayout} from './v25-menu-layout.mjs';"
   },
   {
    "at": 65,
    "count": 4,
    "before": "      checkFonts(control, childPath);\n      if (control.children?.length && control.kind !== 'container' && control.kind !== 'presetButton') {\n        throw new Error(`${childPath}: only a container or presetButton may hold child controls`);\n      }"
   }
  ]
 },
 "scripts/map-ui-layout.mjs": {
  "current": {
   "sha256": "3c42dcde38e1760fa5e44addf14ed7482dd45c1ff52ac1180648148856830a17",
   "gitBlob": "7438353e6966e2c9a3e634bf84221ca6dc1a2101"
  },
  "previous": {
   "sha256": "b88140d80cd34d8d6c668df1f787864a59c4d8c5b5e1c945a0fb0eb7baea0ed5",
   "gitBlob": "3cf04a55f79bd3fe8bc4281ddc9349ad374c64a2"
  },
  "hunks": [
   {
    "at": 23,
    "count": 13,
    "before": "  const firstY = -308 + 60, top = -308 + viewportHeight;\n  return { bossInk: mapBossInk, floors: 17, generatedRows: 15, lanes: 7, maxNodes: 92, maxEdges: 126,\n    viewport: { left: -460, right: 440, bottom: -308, top },"
   }
  ]
 },
 "scripts/v25-map-layout.mjs": {
  "current": {
   "sha256": "86579ae59597ac3e187d2bd461f4418381ed7a21a93b3b1b69cc22df861f669e",
   "gitBlob": "644139b9044a7fcad37d2c714fe78626dbf127ef"
  },
  "previous": {
   "sha256": "f289878acc7e9359e39141da685877379d6a3045d181b8e9c4640a95d56dbb59",
   "gitBlob": "a0680581fc3e8cec884e2f855f1e147f4d80943b"
  },
  "hunks": [
   {
    "at": 0,
    "count": 5,
    "before": "import { mapBossInkHost, mapLegendRows } from './map-ui-layout.mjs';\n\n// Independent native presentation from the authorized V25 map. Route generation,\n// graph pools, clipping, scrolling, RNG and command ownership remain untouched.\nexport const v25MapSource=Object.freeze({"
   },
   {
    "at": 15,
    "count": 12,
    "before": "\nfunction rounded(name,w,h,r,colour){"
   },
   {
    "at": 177,
    "count": 3,
    "before": " background.splice(background.indexOf(returnShade),1);\n panel.children.unshift(paper(theme,returnShade),mapBossInkHost());return layout;\n}"
   }
  ]
 },
 "src/lua/abyss_map_ui.lua": {
  "current": {
   "sha256": "698a22b388fa5a48c01a8a9cb4f918011142338380eeee626f3a819e36eb185b",
   "gitBlob": "32f1b508c1d4c3097764f8fc581cd4b17fab515b"
  },
  "previous": {
   "sha256": "b69bea854d53da119afd9ea0e8f28fca7d7b984600e3e4b0cedabaab046cb8e8",
   "gitBlob": "362d8add52d1c401c594850d58ffe263e1d6fa42"
  },
  "hunks": [
   {
    "at": 44,
    "count": 14,
    "before": "function M.paintRoom(fx)\n    local icon, ring = fx.box:GetChild(\"icon\"), fx.box:GetChild(\"ring\")\n    local iconSize = fx.size * MapLayout.sts.iconPerScale * M.drawScale(fx)\n    roomSize(fx,icon,iconSize)\n    -- oscillateColor drives color.a for reachable rooms.\n    local ink = fx.ink\n    if ink then\n        local alpha = fx.boss or fx.hovered or fx.pressed\n        icon.imageColor = fx.colour(ink.r, ink.g, ink.b, math.floor(ink.a * (alpha and 1 or .82 + .18 * fx.alpha) + .5))\n    end"
   },
   {
    "at": 77,
    "count": 28,
    "before": "end\n-- All artwork shares a bottom docking region. The approved projected\n-- badge contour is 68.20 px deep at the centre and 63.82 px at either\n-- 16 px port (1.46 × the fitting canvas). Between those points the\n-- conservative envelope is the lower of the circular edge and the\n-- bottom tip's diagonal. Extra incoming edges share the same span.\nfunction M.bossRoutePort(rank,count,width)\n    local dx = count <= 1 and 0 or ((rank-1)/(count-1)*2-1)*16\n    local ax=math.abs(dx)\n    local depth=math.max(math.sqrt((63.51)^2-ax*ax),68.20-ax*.27375)\n    return dx,depth+math.max(2.5,width/2+.5)\nend\nfunction M.bossRoutePoint(x1,y1,x2,y2,t)\n    local u,dx,dy=1-t,x2-x1,y2-y1\n    local w1,w2,w3=u*u*u,3*u*u*t,3*u*t*t\n    local w4=t*t*t\n    return w1*x1+w2*(x1+dx*.26)+(w3+w4)*x2,\n        w1*y1+w2*(y1+dy*.18)+w3*(y2-dy*.63)+w4*y2\nend\n-- Clip the actual dash chords rather than linearising the curved path\n-- across a scroll boundary. The viewport remains the existing map viewport.\nfunction M.clipBossDash(x1,y1,x2,y2,left,bottom,right,top)"
   },
   {
    "at": 116,
    "count": 11,
    "before": "end\nfunction M.roomInk(node, state, currentFloor)"
   },
   {
    "at": 224,
    "count": 5,
    "before": "end\nlocal function floorY(chapter, floor)\n    local y = MapLayout.firstY + math.max(0, floor - chapter.first) * Theme.layout.map.floorGap\n    if floor == chapter.boss then return y + Theme.layout.map.bossFloorLift end\n    if chapter.act == 3 and floor == chapter.last then return y + 2 * Theme.layout.map.bossFloorLift end"
   },
   {
    "at": 347,
    "count": 2,
    "before": "    local Layout=deviceLayout(options.hudTop)\n    local function scrollLimit(chapter)\n        return maxScroll(chapter)+MapLayout.viewport.top-Layout.viewport.top\n    end\n    local function available(owner)return options.available and options.available(owner)or Map.available(owner)end"
   },
   {
    "at": 362,
    "count": 15,
    "before": "    local stage,backdrop,panel=mapControls(root,embedded)\n    local bossHost = panel:GetChild(\"bossInkHost\")\n    local function fittedBoss(bossName)\n        return bossHost and MapLayout.bossInk and MapLayout.bossInk.variants[bossName]\n    end\n    local function bossInkInBounds(x,y)\n        local r,v = MapLayout.bossInk.size / 2,Layout.viewport\n        return x-r >= v.left and x+r <= v.right and y-r >= v.bottom and y+r <= v.top\n    end"
   },
   {
    "at": 399,
    "count": 3,
    "before": "        end\n        bossHost:SetAnchoredPosition(fx.x,fx.y)\n        bossHost:SetVisible(true)"
   },
   {
    "at": 410,
    "count": 11,
    "before": "        observedNodeId = view and view.currentNodeId, observedFloor = view and view.floor }\n    local updateReturnReveal"
   },
   {
    "at": 463,
    "count": 3,
    "before": "    -- STS MapEdge/MapRoomNode contract: taken ink, reachable bright, unreachable recessive.\n    local bossRouteInk = colour(35,50,55,214)\n    local pathColours = {"
   },
   {
    "at": 470,
    "count": 12,
    "before": "    }\n    local function bind(name, fn)"
   },
   {
    "at": 487,
    "count": 9,
    "before": "    end\n    local function position(node)\n        return (node.lane - (Layout.lanes + 1) / 2) * Theme.layout.map.columnGap,\n            floorY(self.chapter, node.floor) - self.scroll\n    end"
   },
   {
    "at": 502,
    "count": 3,
    "before": "        self.entryError=nil\n        self:cancelReturnReveal()"
   },
   {
    "at": 506,
    "count": 3,
    "before": "        self.navigationEnabled, self.time = atStart(current), 0\n        self.scroll = clamp(floorY(self.chapter, current.floor) - Layout.focusY, 0, scrollLimit(self.chapter))\n        return true"
   },
   {
    "at": 534,
    "count": 53,
    "before": "\n    local function paintBossRoute(control,firstDash,source,x1,y1,x2,y2,port,width,ink,currentNodeId)\n        local View=Layout.viewport\n        local dx,drop=M.bossRoutePort(port.rank,port.count,width)\n        local sourceInset,sourceOffset=routeInset(source,currentNodeId)\n        local rise=roomState(source,currentNodeId)=='locked' and 12 or math.max(12,sourceInset)\n        x2,y2,y1=x2+dx,y2-drop,y1+sourceOffset+rise\n        if y2<=y1 then control:SetVisible(false);return end\n        local count=clamp(math.ceil(math.sqrt((x2-x1)^2+(y2-y1)^2)/17),3,8)\n        local margin=width/2\n        local any=false\n        -- Existing route container and eight authored image slots only.\n        -- In local stage coordinates the same geometry scales with mobile/PC.\n        local cx,cy=clamp((x1+x2)/2,View.left,View.right),clamp((y1+y2)/2,View.bottom+margin,View.top-margin)\n        control:SetAnchoredPosition(cx,cy)\n        control:SetSizeDelta(1,width)\n        control.localRotationZ=0\n        for i=1,8 do\n            local dash=i==1 and firstDash or child(control,'routeInk'..i)\n            local ax,ay,bx,by\n            if i<=count then\n                local sx,sy=M.bossRoutePoint(x1,y1,x2,y2,(i-1)/(count-.30))\n                local ex,ey=M.bossRoutePoint(x1,y1,x2,y2,(i-.30)/(count-.30))\n                ax,ay,bx,by=M.clipBossDash(sx,sy,ex,ey,View.left+margin,View.bottom+margin,View.right-margin,View.top-margin)\n            end\n            dash:SetVisible(ax~=nil)\n            if ax then\n                any=true\n                dash:SetAnchoredPosition((ax+bx)/2-cx,(ay+by)/2-cy)\n                dash:SetSizeDelta(math.sqrt((bx-ax)^2+(by-ay)^2),width)\n                dash.localRotationZ=math.atan(by-ay,bx-ax)*180/math.pi\n                dash.imageColor=ink\n            end\n        end\n        control:SetVisible(any)\n    end\n\n    local function line(control, source, target, taken, reachable, far, currentNodeId,bossPort)\n        local x1, y1 = position(source)"
   },
   {
    "at": 590,
    "count": 2,
    "before": "        local firstDash = control:GetChild('routeInk1')\n        if firstDash and bossPort and bossInkInBounds(x2,y2) then\n            local width=M.pathWidth(taken,reachable)\n            local ink=taken and pathColours.taken or reachable and pathColours.next or bossRouteInk\n            return paintBossRoute(control,firstDash,source,x1,y1,x2,y2,bossPort,width,ink,currentNodeId)\n        end\n        local fullLength"
   },
   {
    "at": 609,
    "count": 3,
    "before": "        control.localRotationZ = math.atan(dy, dx) * 180 / math.pi\n        local ink=taken and pathColours.taken or reachable and pathColours.next or far and pathColours.far or pathColours.future\n        if firstDash then"
   },
   {
    "at": 617,
    "count": 3,
    "before": "        cancelDrag()\n        if bossHost then bossHost:SetVisible(false) end\n        self.navigationEnabled, self.slots, self.breathing = false, {}, {}"
   },
   {
    "at": 650,
    "count": 4,
    "before": "    end\n    local function paintMapEdges(current, nodes, taken, bossName)\n        local ports={}\n        if fittedBoss(bossName) then\n            local docks={}\n            for _,source in ipairs(current.nodes) do\n                for _,targetId in ipairs(source.nextIds) do\n                    local target=nodes[targetId]\n                    if target and target.type=='boss' and target.roomKind~='boss_treasure' then\n                        local from=docks[targetId] or {}\n                        docks[targetId]=from\n                        from[#from+1]=source\n                    end\n                end\n            end\n            for targetId,from in pairs(docks) do\n                table.sort(from,function(a,b)\n                    if a.lane==b.lane then return tostring(a.id)<tostring(b.id) end\n                    return a.lane<b.lane\n                end)\n                for i,source in ipairs(from) do ports[source.id..':'..targetId]={rank=i,count=#from} end\n            end\n        end\n        local edge = 0\n        for _, node in ipairs(current.nodes) do for _, id in ipairs(node.nextIds) do"
   },
   {
    "at": 657,
    "count": 17,
    "before": "                assert(edge <= Layout.maxEdges, \"map UI edge capacity exceeded\")\n                line(at(\"edge\" .. edge), node, target, taken[node.id .. \":\" .. id], node.id == current.currentNodeId and target.available, M.isFar(target.floor, current.floor), current.currentNodeId,ports[node.id..\":\"..id])\n            end\n        end end\n        for i = edge + 1, Layout.maxEdges do at(\"edge\" .. i):SetVisible(false) end\n    end\n    local bossInkVisible\n    local function paintVisibleRoom(i, node, fx, floor, bossName)\n        local box, state, size = fx.box, fx.state, fx.size"
   },
   {
    "at": 679,
    "count": 6,
    "before": "        local ring = child(box, \"ring\")\n        local circled = state == 'current' or state == 'visited'"
   },
   {
    "at": 687,
    "count": 3,
    "before": "        if circled then\n            local ink = state == 'current' and Theme.color.mapCanvas.currentRing or Theme.color.mapCanvas.visitedRing"
   },
   {
    "at": 693,
    "count": 7,
    "before": "        local iconId = fx.boss and Theme.icon.mapBoss[bossName] or Theme.icon.node[node.type]\n        local fit = fx.boss and fittedBoss(bossName)\n        local showFit = fit and bossInkInBounds(fx.x,fx.y)\n        icon:SetVisible(not showFit)\n        if showFit then\n            paintBossInk(fit, fx)\n            bossInkVisible = true\n        else\n            icon:SetImage(imageSource, iconId)\n        end\n        -- color: NOT_TAKEN for locked rooms, AVAILABLE ink for taken/current/available."
   },
   {
    "at": 707,
    "count": 25,
    "before": "        local hit = child(box, \"hit\")\n        hit:SetSizeDelta(size, size)\n        local clickable = state == \"available\" and self.navigationEnabled\n            and not self.choosing and not scrollAnimation\n        hit:SetVisible(clickable)\n        self.slots[i] = node.id\n        if clickable then self.breathing[#self.breathing + 1] = box end\n    end\n    local function paintMapRoom(i, current, bossName)\n        local box, node = at(\"node\" .. i), current.nodes[i]"
   },
   {
    "at": 734,
    "count": 5,
    "before": "            local size = node.type == \"boss\" and Theme.layout.map.bossNode or Theme.layout.map.node\n            local x, y = position(node)\n            local state = roomState(node, current.currentNodeId)"
   },
   {
    "at": 746,
    "count": 9,
    "before": "            fx.hovered,fx.pressed=false,false\n            visible=roomVisible(fx,Layout.viewport);fx.visible=visible\n            -- Hidden transitions still lerp to rest; otherwise a temporarily"
   },
   {
    "at": 758,
    "count": 4,
    "before": "            -- every child of all 17 floors during each pan animation frame.\n            if visible then paintVisibleRoom(i, node, fx, current.floor, bossName) end\n        end"
   },
   {
    "at": 785,
    "count": 5,
    "before": "        paintMapHeader(current, chapter)\n        local bossName = options.bossName and options.bossName(self.map)\n        paintMapEdges(current, nodes, taken, bossName)\n        assert(#current.nodes <= Layout.maxNodes, \"map UI node capacity exceeded\")"
   },
   {
    "at": 791,
    "count": 4,
    "before": "        bossInkVisible = false\n        for i = 1, Layout.maxNodes do paintMapRoom(i, current, bossName) end\n        if bossHost and not bossInkVisible then bossHost:SetVisible(false) end\n        self:update(0)"
   },
   {
    "at": 843,
    "count": 3,
    "before": "                if fx.visible and (fx.state==\"available\" or fx.scale~=previousScale) then M.paintRoom(fx)end\n                if dt>0 and roomVisible(fx,Layout.viewport)~=fx.visible then visibilityChanged=true end\n            end"
   },
   {
    "at": 894,
    "count": 3,
    "before": "        if self.chapter.terminal == 'boss_treasure' then floor = math.min(floor, self.chapter.boss) end\n        local target = floorY(self.chapter, floor) - Layout.focusY\n        if animated then return animateScrollTo(target) end"
   }
  ]
 },
 "tests/helpers/chapter-battle-scene-source.mjs": {
  "current": {
   "sha256": "e98323fd66d7fc37158c09b35f205035a05b0800b10bf2835f5ff6262d71880a",
   "gitBlob": "83a1bcc190495858eca8763fcb8612bee2d60cca"
  },
  "previous": {
   "sha256": "7888616f2fbc3f59b3545eb5441069380b453b91c80a7a3d4513e59193fa5696",
   "gitBlob": "28b2c25290691844c986dba49fb982eb326b8ba3"
  },
  "hunks": [
   {
    "at": 4,
    "count": 3,
    "before": "import {exactSourceMatches} from './source-fingerprint.mjs';\nimport {beforeProductionReadingBackflow,productionReadingBackflowOwns} from './master-backflow-source.mjs';"
   },
   {
    "at": 863,
    "count": 3,
    "before": "export function beforeChapterBattleScene(path, source) {\n  source = beforeResponsiveHand(path, source);"
   },
   {
    "at": 909,
    "count": 5,
    "before": "  const predecessor = row && {sha256: row.beforeSha256, gitBlob: row.beforeBlob};\n  const expected = hand ? {sha256: hand.afterSha256, gitBlob: hand.afterBlob}\n    : before !== handSource ? candidate : matches(handSource, predecessor) ? predecessor : undefined;"
   }
  ]
 }
};

export function bossMapScrollIdentity(path) {
 return Object.hasOwn(changes,path) ? changes[path].current : undefined;
}

export function beforeBossMapScroll(path,raw) {
 if (!Object.hasOwn(changes,path)) return raw;
 const buffer=Buffer.isBuffer(raw),source=buffer ? raw.toString('utf8') : raw;
 const {current,previous,hunks}=changes[path];
 if (!exactSourceMatches(source,current) || buffer&&!Buffer.from(source).equals(raw)) return raw;
 const lf=source.replaceAll('\r\n','\n');
 if (lf.includes('\r') || source!==lf && source!==lf.replaceAll('\n','\r\n')) return raw;
 const lines=lf.split('\n');
 const proof=hunks.map(({at,count,before})=>({at,before,after:lines.slice(at,at+count).join('\n')}));
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks:proof},path,lf);
 assert(exactSourceMatches(prior,previous),'exact pre-scroll Boss map source: '+path);
 const text=source===lf ? prior : prior.replaceAll('\n','\r\n');
 return buffer ? Buffer.from(text) : text;
}
