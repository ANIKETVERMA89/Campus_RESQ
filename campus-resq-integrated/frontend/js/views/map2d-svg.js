// Campus RESQ · 2D campus map and node-link graph, drawn with SVG (one instance per view and floor)
"use strict";
/* ===================== 2D CAMPUS MAP (SVG) ===================== */
function poly2(pts) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1];
  return { total, at(d) {
    d = Math.max(0, Math.min(total, d)); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const f = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
  } };
}

// Node centres traced from the hand-labelled "Campus Navigation Graph" photo (pixels).
const GPOS = {1:[340.1,100.7],2:[246.9,129.1],3:[153.8,138.4],4:[87.0,158.1],5:[135.9,194.4],6:[124.9,234.3],7:[220.3,290.3],8:[310.7,295.0],9:[404.0,296.0],10:[490.8,296.8],11:[315.4,357.5],12:[530.0,384.0],13:[432.1,400.4],14:[327.8,400.6],15:[557.0,409.0],16:[248.9,461.2],17:[182.6,509.6],18:[125.0,546.9],19:[125.6,600.7],20:[276.2,537.3],21:[383.9,546.5],22:[471.1,546.6],23:[562.8,544.9],24:[638.9,523.3],25:[578.0,479.0],26:[606.0,503.0],27:[529.8,474.0],28:[411.3,476.0],29:[554.7,239.1],30:[513.7,139.5],31:[597.1,153.3],32:[618.3,177.5],33:[447.9,112.5],34:[373.3,191.6],35:[252.2,88.4],36:[595.2,67.2]};
// First floor: node centres traced from the first-floor drawing (IMG-20261113-WA0003.jpg, pixels).
const GPOS1 = {101:[246,262],102:[100,301],103:[340,267],104:[541,282],105:[642,296],106:[752,314],107:[577,357],108:[774,421],109:[764,489],110:[645,587],111:[622,520],112:[551,676],113:[398,716],114:[517,795],115:[501,754],116:[414,832],117:[283,809],118:[562,892],119:[304,734],120:[590,985],121:[667,993],122:[793,985],123:[683,1077],124:[753,1055],125:[800,1041],126:[452,1020],127:[337,1038],128:[207,1055],129:[30,1073],130:[195,1151],131:[131,1160],132:[59,1160],133:[225,951],134:[233,679],135:[96,526],136:[99,436],137:[34,451],138:[206,521]};
// Graph-view colours follow the photo's legend.
const GCOL = { ENTRANCE: "#7bc47f", EXIT: "#7bc47f", OFFICE: "#f2cf66", HALL: "#f2cf66", ROOM: "#f2cf66", CLASS: "#7fb2e6",
               LAB: "#c39bd9", STAIRS: "#f0a35e", LIFT: "#f0a35e", TOILET: "#bdbdbd", JUNCTION: "#ffffff" };

// kind "map": campus map with room blocks; kind "graph": the node-link graph from the photo.
function createMap2D(host, kind, floorNo) {
  const graph = kind === "graph", FL = floorNo || 0, GS = FL ? 0.36 : 0.45, NR = 6;
  const FNODES = GRAPH.nodes.filter(n => (n.floor || 0) === FL);                 // this floor only
  const FEDGES = GRAPH.edges.filter(([a, b]) => floorOf(a) === FL && floorOf(b) === FL);
  const LINKS = GRAPH.edges.filter(([a, b]) => (floorOf(a) === FL) !== (floorOf(b) === FL))  // stairs/lifts to other floors
                           .map(([a, b]) => (floorOf(a) === FL ? [a, b] : [b, a]));
  const BOX = {};                                  // id -> [x, z, width, depth]
  FNODES.forEach(n => { BOX[n.id] = graph ? [(FL ? GPOS1 : GPOS)[n.id][0] * GS, (FL ? GPOS1 : GPOS)[n.id][1] * GS, NR * 2, NR * 2] : ROOMS[n.id]; });
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const hex = c => "#" + c.toString(16).padStart(6, "0");
  const f2 = v => (Math.round(v * 100) / 100).toString();
  const svg = mk("svg", { id: (graph ? "graph2d" : "map2d") + (FL ? "-" + FL : ""), class: "m2svg" + (graph ? " graph" : "") + (FL ? " upper" : ""), role: "img",
                         "aria-label": (graph ? "Campus navigation graph, " : "Campus map, ") + FLOOR_NAME[FL], preserveAspectRatio: "xMidYMid meet" });
  host.insertBefore(svg, host.querySelector("#nogl"));
  const UID = svg.getAttribute("id") + "-";        // ids inside this SVG must be unique on the page
  const api = { onPick: null, onHover: null };

  /* ---- extents ---- */
  const rv = Object.values(BOX);
  const B = { x0: Math.min(...rv.map(r => r[0] - r[2] / 2)) - 7, x1: Math.max(...rv.map(r => r[0] + r[2] / 2)) + 7,
              z0: Math.min(...rv.map(r => r[1] - r[3] / 2)) - 7, z1: Math.max(...rv.map(r => r[1] + r[3] / 2)) + 7 };
  const RING = 26;
  const RR = { x0: B.x0 - RING, x1: B.x1 + RING, z0: B.z0 - RING, z1: B.z1 + RING };
  const E = { x0: RR.x0 - 75, x1: RR.x1 + 75, z0: RR.z0 - 65, z1: RR.z1 + 65 };
  const NORMAL = { W: [-1, 0], E: [1, 0], N: [0, -1], S: [0, 1] }, TANGENT = { W: [0, 1], E: [0, 1], N: [1, 0], S: [1, 0] };
  const OPP = { W: "E", E: "W", N: "S", S: "N" };
  function side(id) { const r = BOX[id], d = { W: r[0] - B.x0, E: B.x1 - r[0], N: r[1] - B.z0, S: B.z1 - r[1] }; return Object.keys(d).reduce((a, b) => (d[a] <= d[b] ? a : b)); }
  function edgePoint(id, off) { const r = BOX[id], s = side(id); return s === "W" ? [B.x0 - off, r[1]] : s === "E" ? [B.x1 + off, r[1]] : s === "N" ? [r[0], B.z0 - off] : [r[0], B.z1 + off]; }

  /* ---- defs ---- */
  const defs = mk("defs", null, svg);
  const hatch = mk("pattern", { id: UID + "hatch", width: 2.4, height: 2.4, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  mk("rect", { width: 2.4, height: 2.4, fill: "#ff3b57", "fill-opacity": 0.18 }, hatch);
  mk("line", { x1: 0, y1: 0, x2: 0, y2: 2.4, stroke: "#ff3b57", "stroke-width": 1 }, hatch);
  const grad = mk("radialGradient", { id: UID + "heat" }, defs);
  [["0%", "#ff3b57", 0.8], ["55%", "#ff6b3d", 0.35], ["100%", "#ff6b3d", 0]].forEach(([o, c, a]) => mk("stop", { offset: o, "stop-color": c, "stop-opacity": a }, grad));
  const shf = mk("filter", { id: UID + "shadow", x: "-5%", y: "-5%", width: "110%", height: "110%" }, defs);
  mk("feDropShadow", { dx: 0, dy: 1.2, stdDeviation: 1.6, "flood-color": "#000", "flood-opacity": 0.28 }, shf);

  const L = {};
  ["ground", "building", "corr", "rooms", "heat", "crowd", "labels", "wts", "icons", "routes", "agents", "marks", "hz"].forEach(k => (L[k] = mk("g", { class: "m2-" + k }, svg)));

  if (graph) {
    mk("rect", { x: B.x0 - 500, y: B.z0 - 500, width: B.x1 - B.x0 + 1000, height: B.z1 - B.z0 + 1000, class: "g-bg" }, L.ground);
    mk("text", { x: B.x0, y: B.z0 - 4, class: "m2-title" }, L.ground).textContent = `${FLOOR_NAME[FL]} · navigation graph · weight on each edge (1 = 10 m)${FL ? " · estimated weights" : ""}`;
  } else if (FL) {
    mk("rect", { x: B.x0 - 500, y: B.z0 - 500, width: B.x1 - B.x0 + 1000, height: B.z1 - B.z0 + 1000, class: "m2-void" }, L.ground);
  } else {
  /* ---- ground: grass, ring road, gate, parking, sports ground, trees ---- */
    mk("rect", { x: E.x0 - 500, y: E.z0 - 500, width: E.x1 - E.x0 + 1000, height: E.z1 - E.z0 + 1000, class: "m2-grass" }, L.ground);
    const gs = side(MAIN_ENTRANCE), gn = NORMAL[gs], gt = TANGENT[gs], gate = edgePoint(MAIN_ENTRANCE, RING);
    const gateFar = [gate[0] + gn[0] * 600, gate[1] + gn[1] * 600];
    const ringD = `M${RR.x0 + 10} ${RR.z0} H${RR.x1 - 10} Q${RR.x1} ${RR.z0} ${RR.x1} ${RR.z0 + 10} V${RR.z1 - 10} Q${RR.x1} ${RR.z1} ${RR.x1 - 10} ${RR.z1} H${RR.x0 + 10} Q${RR.x0} ${RR.z1} ${RR.x0} ${RR.z1 - 10} V${RR.z0 + 10} Q${RR.x0} ${RR.z0} ${RR.x0 + 10} ${RR.z0} Z`;
    const gateD = `M${f2(gate[0])} ${f2(gate[1])} L${f2(gateFar[0])} ${f2(gateFar[1])}`;
    [ringD, gateD].forEach(d => mk("path", { d, class: "m2-road-edge" }, L.ground));
    [ringD, gateD].forEach(d => mk("path", { d, class: "m2-road" }, L.ground));
    [ringD, gateD].forEach(d => mk("path", { d, class: "m2-lane" }, L.ground));
    const gl = [gate[0] + gn[0] * 48, gate[1] + gn[1] * 48];
    const gateBar = mk("g", { transform: `translate(${f2(gl[0])} ${f2(gl[1])})` }, L.ground);
    mk("rect", { x: -6, y: -6, width: 12, height: 12, rx: 2, class: "m2-gate" }, gateBar);
    mk("text", { x: 0, y: 1.3, class: "m2-gate-t" }, gateBar).textContent = "GATE";
    const gtl = mk("text", { x: f2(gl[0] + gt[0] * 14), y: f2(gl[1] + gt[1] * 14 + 1), class: "m2-label" }, L.ground); gtl.textContent = "Main Gate";
  
    // parking beside the gate road, outside the ring
    const pc = [gate[0] + gn[0] * 30 + gt[0] * 30, gate[1] + gn[1] * 30 + gt[1] * 30];
    const pw = gn[0] ? 24 : 40, ph = gn[0] ? 40 : 24;
    const P = { x0: pc[0] - pw / 2, z0: pc[1] - ph / 2, x1: pc[0] + pw / 2, z1: pc[1] + ph / 2 };
    mk("rect", { x: P.x0, y: P.z0, width: pw, height: ph, rx: 1.5, class: "m2-park" }, L.ground);
    for (let i = 1; i < 10; i++) {
      if (gn[0]) mk("line", { x1: P.x0 + 1, x2: P.x1 - 1, y1: P.z0 + i * ph / 10, y2: P.z0 + i * ph / 10, class: "m2-stripe" }, L.ground);
      else mk("line", { y1: P.z0 + 1, y2: P.z1 - 1, x1: P.x0 + i * pw / 10, x2: P.x0 + i * pw / 10, class: "m2-stripe" }, L.ground);
    }
    mk("text", { x: f2(pc[0]), y: f2(pc[1] + 1.4), class: "m2-park-t" }, L.ground).textContent = "P";
  
    // sports ground on the far side of the ring road
    const os = OPP[gs], on = NORMAL[os];
    const mid = [(RR.x0 + RR.x1) / 2, (RR.z0 + RR.z1) / 2];
    const fc = [os === "W" ? RR.x0 - 40 : os === "E" ? RR.x1 + 40 : mid[0], os === "N" ? RR.z0 - 36 : os === "S" ? RR.z1 + 36 : mid[1]];
    const fw = on[0] ? 46 : 74, fh = on[0] ? 74 : 46;
    const F = { x0: fc[0] - fw / 2, z0: fc[1] - fh / 2, x1: fc[0] + fw / 2, z1: fc[1] + fh / 2 };
    mk("rect", { x: F.x0, y: F.z0, width: fw, height: fh, rx: 2, class: "m2-field" }, L.ground);
    if (on[0]) mk("line", { x1: F.x0, x2: F.x1, y1: fc[1], y2: fc[1], class: "m2-field-l" }, L.ground);
    else mk("line", { y1: F.z0, y2: F.z1, x1: fc[0], x2: fc[0], class: "m2-field-l" }, L.ground);
    mk("circle", { cx: fc[0], cy: fc[1], r: 7, class: "m2-field-l" }, L.ground);
    mk("text", { x: f2(fc[0]), y: f2((on[0] ? F.z1 : F.z1) + 5), class: "m2-label" }, L.ground).textContent = "Sports ground";
  
    // trees (deterministic)
    let seed = 20261102; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const inRect = (x, z, r, m) => x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m;
    const ringDist = (x, z) => {
      const inside = inRect(x, z, RR, 0);
      if (inside) return Math.min(x - RR.x0, RR.x1 - x, z - RR.z0, RR.z1 - z);
      const dx = Math.max(RR.x0 - x, 0, x - RR.x1), dz = Math.max(RR.z0 - z, 0, z - RR.z1); return Math.hypot(dx, dz);
    };
    const exitPts = FNODES.filter(isExit).map(n => ({ id: n.id, a: edgePoint(n.id, 13) }));
    for (let i = 0; i < 520; i++) {
      const x = E.x0 + rnd() * (E.x1 - E.x0), z = E.z0 + rnd() * (E.z1 - E.z0), r = 1.8 + rnd() * 1.8;
      if (inRect(x, z, B, 4) || ringDist(x, z) < 8 || inRect(x, z, P, 5) || inRect(x, z, F, 5)) continue;
      const rel = [x - gate[0], z - gate[1]], along = rel[0] * gn[0] + rel[1] * gn[1], across = rel[0] * gt[0] + rel[1] * gt[1];
      if (along > -3 && Math.abs(across) < 9) continue;
      if (exitPts.some(e => Math.hypot(x - e.a[0], z - e.a[1]) < 9)) continue;
      mk("circle", { cx: f2(x), cy: f2(z), r: f2(r), class: "m2-tree" }, L.ground);
    }
    // footpaths + assembly points outside each exit
    exitPts.forEach(e => {
      const r = ROOMS[e.id];
      mk("path", { d: `M${r[0]} ${r[1]} L${f2(e.a[0])} ${f2(e.a[1])}`, class: "m2-path" }, L.ground);
      const g = mk("g", { transform: `translate(${f2(e.a[0])} ${f2(e.a[1])})` }, L.ground);
      mk("circle", { r: 4, class: "m2-asm" }, g);
      mk("text", { y: 1.3, class: "m2-asm-t" }, g).textContent = "A";
      mk("text", { y: 7.4, class: "m2-small" }, g).textContent = "Assembly point";
    });
  }

  /* ---- building, corridors ---- */
  if (!graph) {
    mk("rect", { x: B.x0, y: B.z0, width: B.x1 - B.x0, height: B.z1 - B.z0, rx: 3, class: "m2-bld", filter: `url(#${UID}shadow)` }, L.building);
    mk("text", { x: B.x0 + 1, y: B.z0 - 3, class: "m2-title" }, L.building).textContent = "Academic Block · " + FLOOR_NAME[FL] + (FL ? " (estimated corridor lengths)" : "");
  }
  const corrs = FEDGES.map(([a, b]) => ({ a, b, el: mk("line", { x1: BOX[a][0], y1: BOX[a][1], x2: BOX[b][0], y2: BOX[b][1], class: graph ? "m2-corr g-edge" : "m2-corr" }, L.corr) }));
  // corridor weight pills, placed on the visible part of each corridor (between the two room walls)
  const UNIT = GRAPH.metresPerUnit || 1;
  const pills = FEDGES.map(([a, b, w]) => {
    const ra = BOX[a], rb = BOX[b], dx = rb[0] - ra[0], dz = rb[1] - ra[1];
    const lim = (W, D) => Math.min(Math.abs(dx) > 1e-6 ? W / 2 / Math.abs(dx) : Infinity, Math.abs(dz) > 1e-6 ? D / 2 / Math.abs(dz) : Infinity);
    const t0 = lim(ra[2], ra[3]), t1 = 1 - lim(rb[2], rb[3]), t = t1 > t0 ? (t0 + t1) / 2 : 0.5;
    const g = mk("g", { transform: `translate(${f2(ra[0] + dx * t)} ${f2(ra[1] + dz * t)})${graph ? " scale(1.65)" : ""}`, class: "m2-w" }, L.wts);
    const label = String(Math.round(w / UNIT * 10) / 10);
    mk("rect", { x: f2(-1.1 - label.length * 0.55), y: -1.35, width: f2(2.2 + label.length * 1.1), height: 2.7, rx: 1.35 }, g);
    mk("text", { y: 0.8 }, g).textContent = label;
    return g;
  });

  /* ---- rooms ---- */
  const ICON = {
    STAIRS: g => mk("path", { d: "M-1.1 0.9 h0.75 v-0.6 h0.7 v-0.6 h0.75 v-0.6", class: "ig" }, g),
    LIFT: g => mk("path", { d: "M-0.5 -0.2 L0 -1 L0.5 -0.2 Z M-0.5 0.2 L0 1 L0.5 0.2 Z", class: "ig", fill: "currentColor" }, g),
    TOILET: g => (mk("text", { y: 0.55, class: "igt" }, g).textContent = "WC"),
    ROOM: g => mk("path", { d: "M-0.35 -1 h0.7 v0.65 h0.65 v0.7 h-0.65 v0.65 h-0.7 v-0.65 h-0.65 v-0.7 h0.65 Z", fill: "#e5484d" }, g),
    OFFICE: g => (mk("text", { y: 0.6, class: "igt" }, g).textContent = "i"),
    EXIT: g => mk("path", { d: "M-1 0 H0.8 M0.2 -0.6 L0.9 0 L0.2 0.6", class: "ig", stroke: "#fff" }, g),
    ENTRANCE: g => mk("path", { d: "M-1 0 H0.8 M0.2 -0.6 L0.9 0 L0.2 0.6", class: "ig", stroke: "#fff" }, g),
    LAB: g => mk("path", { d: "M-0.3 -1 V-0.2 L-0.9 0.9 H0.9 L0.3 -0.2 V-1", class: "ig" }, g)
  };
  const rooms = new Map();
  FNODES.forEach(n => {
    const [x, z, w, d] = BOX[n.id], c = graph ? GCOL[n.type] : hex(TYPE[n.type].c), ex = isExit(n);
    const g = mk("g", { class: "room" + (ex ? " exit" : "") + (n.type === "JUNCTION" && !graph ? " junction" : ""), "data-id": n.id,
                         tabindex: 0, role: "button", "aria-label": `${n.name}, room ${n.id}` }, L.rooms);
    const box = { x: f2(x - w / 2), y: f2(z - d / 2), width: f2(w), height: f2(d), rx: 1.2 };
    const shape = graph ? (a, p) => mk("circle", Object.assign({ cx: f2(x), cy: f2(z), r: NR }, a), p) : (a, p) => mk("rect", Object.assign({}, box, a), p);
    const base = shape({ fill: c, stroke: graph ? "" : c, class: graph ? "rb gnode" : "rb" }, g);
    const risk = shape({ fill: "#ff3b57", "fill-opacity": 0, class: "rr" }, g);
    const hat = shape({ fill: `url(#${UID}hatch)`, visibility: "hidden" }, g);
    const sel = graph ? mk("circle", { cx: f2(x), cy: f2(z), r: NR + 1.8, class: "rsel", visibility: "hidden" }, L.marks)
                      : mk("rect", { x: f2(x - w / 2 - 1.3), y: f2(z - d / 2 - 1.3), width: f2(w + 2.6), height: f2(d + 2.6), rx: 2.2, class: "rsel", visibility: "hidden" }, L.marks);
    const heat = mk("circle", { cx: x, cy: z, r: 1, fill: `url(#${UID}heat)`, visibility: "hidden" }, L.heat);
    let s2 = n.id * 7919 + 13; const r2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    const dots = []; for (let i = 0; i < 24; i++) {
      const ang = r2() * Math.PI * 2, rad = NR + 1.2 + r2() * 3.2;
      const cx = graph ? x + Math.cos(ang) * rad : x + (r2() - 0.5) * (w - 2.4), cy = graph ? z + Math.sin(ang) * rad : z + (r2() - 0.5) * (d - 2.4);
      dots.push(mk("circle", { cx: f2(cx), cy: f2(cy), r: graph ? 0.6 : 0.75, class: "dot", visibility: "hidden" }, L.crowd));
    }

    // label (wrapped to two lines when long)
    const name = ex ? "EXIT" : n.name; let lines = [name];
    if (name.length > 11 && name.includes(" ")) {
      const m = name.length / 2; let best = -1;
      for (let i = 0; i < name.length; i++) if (name[i] === " " && (best < 0 || Math.abs(i - m) < Math.abs(best - m))) best = i;
      lines = [name.slice(0, best), name.slice(best + 1)];
    }
    const longest = Math.max(...lines.map(l => l.length));
    const fs = Math.max(1.3, Math.min(3.4, (w * 0.86) / (longest * 0.6), d / (lines.length * 1.3 + 1.4)));
    let t;
    if (graph) {
      mk("text", { x: f2(x), y: f2(z + 1.45), class: "gnum" }, L.labels).textContent = n.id;
      t = mk("text", { x: f2(x), y: f2(z + NR + 3), class: "gname" }, L.labels); t.textContent = n.name;
    } else {
      t = mk("text", { x: f2(x), y: f2(z), "font-size": f2(fs), class: "rl" + (ex ? " ex" : "") }, L.labels);
      lines.forEach((l, i) => { const ts = mk("tspan", { x: f2(x), dy: f2(i === 0 ? fs * 0.36 - (lines.length - 1) * fs * 0.55 : fs * 1.1) }, t); ts.textContent = l; });
    }

    if (!graph && ICON[n.type] && Math.min(w, d) >= 7) {
      const ig = mk("g", { transform: `translate(${f2(x - w / 2 + 2.3)} ${f2(z - d / 2 + 2.3)}) scale(1.15)` }, L.icons);
      mk("circle", { r: 1.55, class: "ib" + (ex ? " ibx" : "") }, ig); ICON[n.type](ig);
    }

    // hazard icons
    const sc = graph ? 0.9 : Math.max(0.8, Math.min(1.7, Math.min(w, d) / 11));
    const hz = mk("g", { transform: `translate(${f2(graph ? x + NR * 0.9 : x)} ${f2(graph ? z - NR * 0.9 : z - d / 2)}) scale(${f2(sc)})` }, L.hz);  // badge on the top edge, clear of the name
    const fire = mk("g", { visibility: "hidden" }, hz);
    mk("path", { d: "M0 3.2 C-2.6 3.2 -3.2 0.8 -2 -1 C-1.6 0.2 -0.8 0.4 -0.6 -0.2 C-1 -1.8 0 -3.4 1 -4 C0.8 -2.4 2.6 -1.4 2.6 0.6 C2.6 2.2 1.6 3.2 0 3.2 Z", fill: "#ff6a1a", stroke: "#fff", "stroke-width": 0.35, class: "flame" }, fire);
    mk("path", { d: "M0 2.8 C-1.2 2.8 -1.5 1.6 -0.9 0.6 C-0.6 1.2 0 1.2 0.1 0.7 C0 0 0.4 -0.6 0.9 -1 C0.9 0 1.4 0.6 1.4 1.5 C1.4 2.3 0.8 2.8 0 2.8 Z", fill: "#ffd23a", class: "flame" }, fire);
    const med = mk("g", { visibility: "hidden" }, hz);
    mk("circle", { r: 3.2, class: "pulse", stroke: "#4da6ff" }, med);
    mk("circle", { r: 2.6, fill: "#fff", stroke: "#4da6ff", "stroke-width": 0.5 }, med);
    mk("path", { d: "M-0.45 -1.6 h0.9 v1.15 h1.15 v0.9 h-1.15 v1.15 h-0.9 v-1.15 h-1.15 v-0.9 h1.15 Z", fill: "#e5484d" }, med);
    const sec = mk("g", { visibility: "hidden" }, hz);
    mk("circle", { r: 3.4, class: "pulse", stroke: "#b06cff" }, sec);
    mk("path", { d: "M0 -2.9 L2.5 -1.45 L2.5 1.45 L0 2.9 L-2.5 1.45 L-2.5 -1.45 Z", fill: "#8b5cf6", stroke: "#fff", "stroke-width": 0.4 }, sec);
    mk("text", { y: 1.15, class: "m2-sec-t" }, sec).textContent = "!";

    rooms.set(n.id, { n, x, z, w, d, base, risk, hat, sel, heat, dots, t, fire, med, sec });
  });

  // consecutive stretches of a path that are on this floor
  function runsOnFloor(path) {
    const runs = []; let cur = [];
    path.forEach(id => { if (BOX[id]) cur.push(id); else if (cur.length) { runs.push(cur); cur = []; } });
    if (cur.length) runs.push(cur);
    return runs;
  }
  // stairs / lifts: show where they lead (or that they are not linked yet)
  if (FLOORS.length > 1) FNODES.filter(n => n.type === "STAIRS" || n.type === "LIFT").forEach(n => {
    const to = LINKS.filter(([a]) => a === n.id).map(([, b]) => floorOf(b));
    const [x, z, w, d] = BOX[n.id];
    const label = to.length ? to.map(f => (f < FL ? "↓ " : "↑ ") + FLOOR_SHORT[f]).join(" ") : "not linked";
    const g = mk("g", { transform: `translate(${f2(x + (graph ? NR + 1 : w / 2))} ${f2(z + (graph ? NR + 1 : d / 2))})`, class: "m2-link" + (to.length ? "" : " none") }, L.icons);
    mk("rect", { x: -0.6, y: -1.4, width: f2(label.length * 1.15 + 1.8), height: 2.8, rx: 1.4 }, g);
    mk("text", { x: 0.3, y: 0.75 }, g).textContent = label;
  });

  /* ---- pins ---- */
  function pin(color, letter) {
    const g = mk("g", { class: "m2-pin", visibility: "hidden" }, L.marks);
    mk("path", { d: "M0 0 C-1.6 -2.6 -3.4 -4 -3.4 -6.2 A3.4 3.4 0 1 1 3.4 -6.2 C3.4 -4 1.6 -2.6 0 0 Z", fill: color, stroke: "#fff", "stroke-width": 0.6 }, g);
    mk("text", { y: -5.1 }, g).textContent = letter;
    return g;
  }
  const pinA = pin("#16a36b", "A"), pinB = pin("#0b8fd6", "B");

  /* ---- labels ---- */
  let labelMode = "all", highlight = new Set(), selIds = new Set(), alertIds = new Set();
  function updateLabels() {
    rooms.forEach((o, id) => {
      const show = labelMode === "all" || (labelMode === "key" && (isExit(o.n) || o.n.type === "HALL" || highlight.has(id) || selIds.has(id) || alertIds.has(id)));
      o.t.setAttribute("visibility", show ? "visible" : "hidden");
    });
    pills.forEach(p => p.setAttribute("visibility", labelMode === "off" ? "hidden" : "visible"));
  }
  api.cycleLabels = () => { labelMode = labelMode === "all" ? "key" : labelMode === "key" ? "off" : "all"; updateLabels(); return labelMode; };
  api.toggleSpin = () => false;
  api.applyTheme = () => {};

  /* ---- state ---- */
  api.refresh = emergencies => {
    alertIds = new Set();
    rooms.forEach((o, id) => {
      const nd = nodeById.get(id), heat = Math.min(1, nd.risk / 10);
      o.risk.setAttribute("fill-opacity", f2(heat * 0.55));
      o.hat.setAttribute("visibility", nd.blocked ? "visible" : "hidden");
      o.base.classList.toggle("blocked", nd.blocked);
      o.heat.setAttribute("visibility", nd.risk > 0.05 ? "visible" : "hidden");
      o.heat.setAttribute("r", f2(Math.max(o.w, o.d) * 0.55 + nd.risk * 2.6)); o.heat.setAttribute("opacity", f2(heat));
      const k = Math.round(Math.min(10, nd.congestion) * 2.4);
      o.dots.forEach((c, i) => c.setAttribute("visibility", i < k ? "visible" : "hidden"));
      [o.fire, o.med, o.sec].forEach(h => h.setAttribute("visibility", "hidden"));
    });
    emergencies.forEach(e => {
      if (e.status === "RESOLVED") return;
      const o = rooms.get(e.loc); if (!o) return; alertIds.add(e.loc);
      (e.type === "fire" ? o.fire : e.type === "medical" ? o.med : o.sec).setAttribute("visibility", "visible");
    });
    corrs.forEach(c => {
      const a = nodeById.get(c.a), b = nodeById.get(c.b), r = Math.max(a.risk, b.risk);
      c.el.classList.toggle("blk", a.blocked || b.blocked);
      if (r > 0.4) c.el.style.stroke = `rgba(255,59,87,${f2(0.25 + Math.min(1, r / 8) * 0.6)})`; else c.el.style.stroke = "";
    });
    updateLabels();
  };
  api.setSel = (from, to, sel) => {
    [[pinA, from], [pinB, to]].forEach(([p, id]) => {
      p.setAttribute("visibility", id ? "visible" : "hidden");
      if (id && !BOX[id]) { p.setAttribute("visibility", "hidden"); return; }     // that place is on another floor
      if (id) p.setAttribute("transform", `translate(${f2(BOX[id][0])} ${f2(BOX[id][1])})`);
    });
    rooms.forEach((o, id) => o.sel.setAttribute("visibility", id === sel ? "visible" : "hidden"));
    selIds = new Set([from, to, sel].filter(Boolean)); updateLabels();
  };

  /* ---- routes + drill agents ---- */
  let runners = [], agents = [], agentWait = 0;
  api.setRoutes = list => {
    while (L.routes.firstChild) L.routes.removeChild(L.routes.firstChild);
    runners = []; highlight = new Set();
    list.forEach((r, i) => {
      r.path.forEach(id => highlight.add(id));
      const col = hex(r.color);
      runsOnFloor(r.path).forEach(run => {
        const pts = run.map(id => [BOX[id][0] + i * 1.6, BOX[id][1] + i * 1.6]);
        if (pts.length > 1) {
          const d = "M" + pts.map(p => f2(p[0]) + " " + f2(p[1])).join(" L");
          mk("path", { d, class: "rcase" }, L.routes);
          mk("path", { d, class: "rline", stroke: col }, L.routes);
          mk("path", { d, class: "rflow" }, L.routes);
        }
        pts.forEach(p => mk("circle", { cx: f2(p[0]), cy: f2(p[1]), r: 1, fill: col, stroke: "#fff", "stroke-width": 0.4 }, L.routes));
        if (pts.length > 1) runners.push({ poly: poly2(pts), dot: mk("circle", { r: 1.7, class: "rdot", fill: col }, L.routes), d: -i * 12 });
      });
      // where the route leaves this floor: a badge saying which way to go
      for (let k = 0; k + 1 < r.path.length; k++) {
        const a = r.path[k], b = r.path[k + 1];
        if (floorOf(a) === floorOf(b) || !(BOX[a] || BOX[b])) continue;
        const here = BOX[a] ? a : b, other = here === a ? b : a, down = floorOf(other) < FL;
        const g = mk("g", { transform: `translate(${f2(BOX[here][0])} ${f2(BOX[here][1] - (graph ? NR + 5 : BOX[here][3] / 2 + 4))})`, class: "m2-floorgo" }, L.routes);
        const txt = here === a ? `${down ? "↓ Go down to" : "↑ Go up to"} ${FLOOR_NAME[floorOf(other)]}` : `Arrive from ${FLOOR_NAME[floorOf(other)]}`;
        mk("rect", { x: f2(-txt.length * 0.75 - 1.5), y: -2.4, width: f2(txt.length * 1.5 + 3), height: 4.4, rx: 2.2, fill: col }, g);
        mk("text", { y: 0.85 }, g).textContent = txt;
      }
    });
    updateLabels();
  };
  api.setAgents = list => {
    while (L.agents.firstChild) L.agents.removeChild(L.agents.firstChild);
    agents = []; agentWait = 0;
    list.forEach(a => runsOnFloor(a.path).forEach(run => {
      if (run.length < 2) return;
      agents.push({ poly: poly2(run.map(id => [BOX[id][0], BOX[id][1]])), d: 0, speed: 26 + Math.random() * 6,
        c: mk("circle", { r: f2(a.size * 1.15), fill: hex(a.color), class: "agent" }, L.agents) });
    }));
  };

  /* ---- view box: pan / zoom ---- */
  const FIT = graph ? { x: B.x0 - 6, y: B.z0 - 12, w: B.x1 - B.x0 + 12, h: B.z1 - B.z0 + 18 } : FL ? { x: B.x0 - 8, y: B.z0 - 12, w: B.x1 - B.x0 + 16, h: B.z1 - B.z0 + 20 } : { x: RR.x0 - 24, y: RR.z0 - 24, w: RR.x1 - RR.x0 + 48, h: RR.z1 - RR.z0 + 48 };
  const MAXW = (E.x1 - E.x0) * 1.5, MINW = 28;
  let vb = { x: FIT.x, y: FIT.y, w: FIT.w, h: FIT.h }, tgt = Object.assign({}, vb), fitted = false;
  const rect = () => svg.getBoundingClientRect();
  // Free screen area not covered by the side panel (desktop) or bottom sheet (phone) and top bar.
  function freeArea(r) {
    const pe = document.getElementById("panel"), pr = pe && pe.getBoundingClientRect ? pe.getBoundingClientRect() : null;
    const te = document.getElementById("top"), tr = te && te.getBoundingClientRect ? te.getBoundingClientRect() : null;
    let l = 0, t = tr && tr.height && tr.height < r.height * 0.4 ? Math.max(0, tr.bottom - r.top + 6) : 64, bt = 0;
    if (pr && pr.width && pr.width < r.width * 0.6) l = Math.max(0, pr.right - r.left + 8);
    else if (pr && pr.height && pr.top > r.top + r.height * 0.3) bt = Math.max(0, r.bottom - pr.top + 8);
    // in the graph view keep the nodes clear of the open legend as well
    let rt = 12;
    const lg = graph && document.getElementById("legend"), lr = lg && lg.open && lg.getBoundingClientRect ? lg.getBoundingClientRect() : null;
    if (lr && lr.width && lr.width < r.width * 0.4) rt = Math.max(rt, r.right - lr.left + 8);
    return { l, t, aw: Math.max(80, r.width - l - rt), ah: Math.max(80, r.height - t - bt - 8) };
  }
  function shape(b) {
    const r = rect(); if (!r.width || !r.height) return Object.assign({}, b);
    const fa = freeArea(r), s = Math.max(b.w / fa.aw, b.h / fa.ah), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    return { x: cx - (fa.l + fa.aw / 2) * s, y: cy - (fa.t + fa.ah / 2) * s, w: r.width * s, h: r.height * s };
  }
  function clampBox(b) {
    const cx = Math.max(E.x0, Math.min(E.x1, b.x + b.w / 2)), cy = Math.max(E.z0, Math.min(E.z1, b.y + b.h / 2));
    b.x = cx - b.w / 2; b.y = cy - b.h / 2; return b;
  }
  function zoomAt(f, cx, cy, animate) {
    const r = rect(); if (!r.width) return;
    const base = animate ? tgt : vb;
    const px = base.x + (cx - r.left) / r.width * base.w, py = base.y + (cy - r.top) / r.height * base.h;
    const nw = Math.max(MINW, Math.min(MAXW, base.w * f)), k = nw / base.w;
    const nb = clampBox({ x: px - (px - base.x) * k, y: py - (py - base.y) * k, w: nw, h: base.h * k });
    if (animate) tgt = nb; else { vb = nb; tgt = Object.assign({}, nb); }
  }
  function pan(dx, dy) {
    const r = rect(); if (!r.width) return;
    vb.x -= dx * vb.w / r.width; vb.y -= dy * vb.h / r.height; clampBox(vb); tgt = Object.assign({}, vb);
  }
  api.preset = () => { tgt = shape(FIT); };
  api.zoomBy = f => { const r = rect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2, true); };
  api.frame = ids => {
    ids = (ids || []).filter(id => BOX[id]);                 // only places on this floor
    if (!ids.length) return api.preset();
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    ids.forEach(id => { const r = BOX[id]; x0 = Math.min(x0, r[0] - r[2] / 2); x1 = Math.max(x1, r[0] + r[2] / 2); z0 = Math.min(z0, r[1] - r[3] / 2); z1 = Math.max(z1, r[1] + r[3] / 2); });
    const m = graph ? 12 : 16; tgt = shape({ x: x0 - m, y: z0 - m, w: Math.max(graph ? 120 : 170, x1 - x0 + 2 * m), h: Math.max(graph ? 70 : 100, z1 - z0 + 2 * m) });
  };
  function resize() {
    const r = rect(); if (!r.width || !r.height) return;
    if (!fitted) { vb = shape(FIT); tgt = Object.assign({}, vb); fitted = true; }
    [vb, tgt].forEach(b => { const cy = b.y + b.h / 2; b.h = b.w * r.height / r.width; b.y = cy - b.h / 2; });
    svg.setAttribute("viewBox", `${f2(vb.x)} ${f2(vb.y)} ${f2(vb.w)} ${f2(vb.h)}`);
  }
  new ResizeObserver(resize).observe(svg);

  /* ---- pointer input ---- */
  const ptrs = new Map(); let down = null, pinch = null;
  const roomId = el => { const g = el && el.closest ? el.closest(".room") : null; return g ? +g.getAttribute("data-id") : null; };
  svg.addEventListener("wheel", e => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * 0.0015), e.clientX, e.clientY, false); }, { passive: false });
  svg.addEventListener("dblclick", e => zoomAt(0.55, e.clientX, e.clientY, true));
  svg.addEventListener("keydown", e => {                  // Enter / Space on a focused room selects it
    if (e.key !== "Enter" && e.key !== " ") return;
    const id = roomId(e.target); if (!id || !api.onPick) return;
    e.preventDefault(); api.onPick(id);
  });
  svg.addEventListener("focusin", e => {                  // keep the focused room in view
    const id = roomId(e.target); if (!id) return;
    const b = BOX[id], r = rect(); if (!r.width) return;
    if (b[0] < vb.x || b[0] > vb.x + vb.w || b[1] < vb.y || b[1] > vb.y + vb.h) api.frame([id]);
  });
  svg.addEventListener("pointerdown", e => {
    try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
    down = { t: performance.now(), moved: 0, id: roomId(e.target) }; pinch = null;
  });
  svg.addEventListener("pointermove", e => {
    const p = ptrs.get(e.pointerId);
    if (!p) { if (e.pointerType === "mouse" && api.onHover) api.onHover(roomId(e.target), e.clientX, e.clientY); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 1) pan(dx, dy);
    else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      if (pinch) { zoomAt(pinch.d / Math.max(d, 1), cx, cy, false); pan(cx - pinch.cx, cy - pinch.cy); }
      pinch = { d, cx, cy };
    }
  });
  const end = e => {
    if (e.type === "pointerup" && ptrs.size === 1 && down && down.moved < 7 && performance.now() - down.t < 600 && down.id && api.onPick) api.onPick(down.id);
    ptrs.delete(e.pointerId); pinch = null; if (!ptrs.size) down = null;
  };
  svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
  svg.addEventListener("pointerleave", () => { if (api.onHover && !ptrs.size) api.onHover(null); });

  /* ---- animation loop (only while visible) ---- */
  let raf = 0, last = 0;
  function tick(ts) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016); last = ts;
    const k = 1 - Math.exp(-dt * 10);
    vb.x += (tgt.x - vb.x) * k; vb.y += (tgt.y - vb.y) * k; vb.w += (tgt.w - vb.w) * k; vb.h += (tgt.h - vb.h) * k;
    svg.setAttribute("viewBox", `${f2(vb.x)} ${f2(vb.y)} ${f2(vb.w)} ${f2(vb.h)}`);
    runners.forEach(r => {
      r.d += dt * 34; if (r.d > r.poly.total + 18) r.d = -6;
      const p = r.poly.at(r.d); r.dot.setAttribute("cx", f2(p[0])); r.dot.setAttribute("cy", f2(p[1]));
      r.dot.setAttribute("visibility", r.d >= 0 ? "visible" : "hidden");
    });
    if (agents.length) {
      let alive = 0;
      agents.forEach(a => {
        a.d += dt * a.speed; const done = a.d >= a.poly.total;
        a.c.setAttribute("visibility", done ? "hidden" : "visible");
        if (!done) { alive++; const p = a.poly.at(a.d); a.c.setAttribute("cx", f2(p[0])); a.c.setAttribute("cy", f2(p[1])); }
      });
      if (!alive) { agentWait += dt; if (agentWait > 1.4) { agentWait = 0; agents.forEach(a => (a.d = 0)); } }
    }
  }
  api.floor = FL;
  api.setActive = on => {
    svg.classList.toggle("active", !!on);
    if (on && !raf) { resize(); last = 0; raf = requestAnimationFrame(tick); }
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  return api;
}
