// Campus RESQ · 3D campus view, built with three.js (WebGL)
"use strict";
/* ===================== 3D VIEW (three.js r128) ===================== */
const S = 1.5;                                          // layout metres -> world units
const ROOMS = {"1":[-76.0,10.1,18.6,9.3],"2":[-72.7,25.6,17.05,12.4],"3":[-79.6,47.9,27.900000000000002,21.7],"4":[-87.2,67.4,10.85,7.75],"5":[-69.0,69.9,15.5,12.4],"6":[-53.9,32.1,10.85,9.3],"7":[-40.8,55.6,31.0,20.150000000000002],"8":[-27.9,29.6,31.0,21.7],"9":[-7.5,5.6,10.85,10.85],"10":[-4.0,-12.2,20.150000000000002,15.5],"11":[12.1,6.5,17.05,12.4],"12":[19.2,-10.5,17.05,12.4],"13":[-0.9,24.3,9.3,13.950000000000001],"14":[32.2,5.3,9.3,9.3],"15":[20.7,-26.0,9.3,9.3],"16":[55.4,11.6,23.25,17.05],"17":[82.1,29.6,10.85,9.3],"18":[103.2,12.9,10.85,9.3],"19":[97.5,28.8,10.85,7.75],"20":[82.5,12.5,20.150000000000002,15.5],"21":[81.8,-7.8,20.150000000000002,15.5],"22":[81.3,-28.3,20.150000000000002,15.5],"23":[70.6,-48.4,20.150000000000002,15.5],"24":[91.2,-47.2,10.85,7.75],"25":[79.0,-66.1,10.85,9.3],"26":[94.3,-61.3,10.85,9.3],"27":[44.1,-39.2,23.25,17.05],"28":[49.4,-14.8,34.1,21.7],"29":[-42.7,-36.0,31.0,21.7],"30":[-89.3,-5.4,17.05,12.4],"31":[-83.7,-33.5,10.85,9.3],"32":[-68.2,-30.1,10.85,9.3],"33":[-71.4,-8.0,9.3,13.950000000000001],"34":[-40.4,-3.4,43.4,34.1],"35":[-95.0,23.4,9.3,13.950000000000001],"36":[-86.4,-20.2,10.85,7.75],"101":[-48.5,-126.2,15.95,11.6],"102":[-87.7,-116.0,29.0,20.3],"103":[-22.7,-124.1,8.7,13.05],"104":[31.7,-120.4,8.7,13.05],"105":[58.6,-116.7,15.95,11.6],"106":[88.3,-111.6,21.75,15.95],"107":[41.6,-100.7,8.7,8.7],"108":[94.5,-83.0,14.5,11.6],"109":[91.3,-65.0,10.15,8.7],"110":[59.3,-37.8,18.85,14.5],"111":[53.6,-56.1,8.7,13.05],"112":[34.6,-14.3,18.85,14.5],"113":[-6.9,-2.8,10.15,10.15],"114":[25.0,19.8,8.7,8.7],"115":[21.2,5.6,14.5,11.6],"116":[-3.0,28.0,8.7,13.05],"117":[-38.1,21.9,8.7,8.7],"118":[37.4,44.4,21.75,15.95],"119":[-32.6,3.1,15.95,11.6],"120":[43.8,69.4,18.85,14.5],"121":[66.7,71.8,18.85,14.5],"122":[99.2,68.9,8.7,13.05],"123":[69.8,94.6,10.15,8.7],"124":[88.1,88.2,10.15,8.7],"125":[102.6,85.1,10.15,8.7],"126":[7.9,79.1,18.85,14.5],"127":[-24.0,84.0,18.85,14.5],"128":[-59.5,88.1,18.85,14.5],"129":[-106.8,93.4,8.7,13.05],"130":[-62.3,114.2,15.95,11.6],"131":[-79.7,116.9,10.15,8.7],"132":[-98.4,116.4,10.15,8.7],"133":[-54.0,59.7,21.75,15.95],"134":[-50.9,-13.9,18.85,14.5],"135":[-88.7,-54.6,18.85,14.5],"136":[-87.6,-78.5,10.15,8.7],"137":[-105.3,-74.8,10.15,8.7],"138":[-58.5,-56.0,8.7,13.05]}; // id -> [x, z, width, depth] (schematic floor plan)
const FLOOR_H = 13;                                     // height between floors in the 3D view
const FY = n => (n.floor || 0) * FLOOR_H;
const W = n => new THREE.Vector3(ROOMS[n.id][0], FY(n), ROOMS[n.id][1]);
const TYPE = {
  ENTRANCE:{c:0x3ddc97,w:3.4,h:2.2}, EXIT:{c:0x3ddc97,w:3.2,h:1.6}, STAIRS:{c:0x7aa2ff,w:2.6,h:5},
  LIFT:{c:0x8a94ad,w:2.4,h:4.6}, TOILET:{c:0xb08cff,w:2.2,h:2}, CLASS:{c:0x5ec8ff,w:2.8,h:3},
  LAB:{c:0xff9f5e,w:2.8,h:3.2}, HALL:{c:0xffd166,w:3.8,h:4}, OFFICE:{c:0x6ee7d7,w:2.6,h:2.6},
  ROOM:{c:0x9aa7bd,w:2.4,h:2.4}, JUNCTION:{c:0xdfe6ff,w:1.8,h:0.7}
};
const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function makePoly(pts) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const total = cum[cum.length - 1];
  return { total, at(d, out) {
    d = Math.max(0, Math.min(total, d));
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const seg = cum[i] - cum[i - 1] || 1;
    return out.copy(pts[i - 1]).lerp(pts[i], (d - cum[i - 1]) / seg);
  } };
}

function createView(canvas) {
  if (typeof THREE === "undefined") return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
  catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 2500);
  const clock = new THREE.Clock();
  const api = { onPick: null, onHover: null };

  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x141c36, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 0.85); sun.position.set(90, 170, 70); scene.add(sun);
  const glow = new THREE.PointLight(0x4de1ff, 0.7, 420); glow.position.set(0, 70, 0); scene.add(glow);

  /* ---- environment ---- */
  const HGT = { ENTRANCE: 2.4, EXIT: 1.2, STAIRS: 7, LIFT: 8, TOILET: 3.6, CLASS: 4.6, LAB: 4.8, HALL: 6, OFFICE: 4.2, ROOM: 4, JUNCTION: 0.5 };
  const rv = GRAPH.nodes.map(n => ROOMS[n.id]);
  const minX = Math.min(...rv.map(r => r[0] - r[2] / 2)) - 12, maxX = Math.max(...rv.map(r => r[0] + r[2] / 2)) + 12;
  const minZ = Math.min(...rv.map(r => r[1] - r[3] / 2)) - 12, maxZ = Math.max(...rv.map(r => r[1] + r[3] / 2)) + 12;
  const R0 = Math.max(maxX - minX, maxZ - minZ) * 1.15;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 1, maxZ - minZ), new THREE.MeshStandardMaterial({ color: 0x0d1630, roughness: 0.85, metalness: 0.1 }));
  slab.position.set((minX + maxX) / 2, -0.55, (minZ + maxZ) / 2); scene.add(slab);
  const slabEdge = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: 0x4de1ff, transparent: true, opacity: 0.55 }));
  slabEdge.position.copy(slab.position); scene.add(slabEdge);
  const upperSlabs = [];
  FLOORS.filter(f => f > 0).forEach(f => {
    const fr = GRAPH.nodes.filter(n => (n.floor || 0) === f).map(n => ROOMS[n.id]);
    const ux0 = Math.min(...fr.map(r => r[0] - r[2] / 2)) - 10, ux1 = Math.max(...fr.map(r => r[0] + r[2] / 2)) + 10;
    const uz0 = Math.min(...fr.map(r => r[1] - r[3] / 2)) - 10, uz1 = Math.max(...fr.map(r => r[1] + r[3] / 2)) + 10;
    const us = new THREE.Mesh(new THREE.BoxGeometry(ux1 - ux0, 0.6, uz1 - uz0), new THREE.MeshStandardMaterial({ color: 0x1a2a4d, transparent: true, opacity: 0.35, depthWrite: false }));
    us.position.set((ux0 + ux1) / 2, f * FLOOR_H - 0.35, (uz0 + uz1) / 2); scene.add(us);
    const ue = new THREE.LineSegments(new THREE.EdgesGeometry(us.geometry), new THREE.LineBasicMaterial({ color: 0x8b6cff, transparent: true, opacity: 0.7 }));
    ue.position.copy(us.position); scene.add(ue); upperSlabs.push(us);
  });
  let grid = null;
  const dustGeo = new THREE.BufferGeometry(), dp = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) { dp[i*3] = (Math.random() - .5) * 340; dp[i*3+1] = 10 + Math.random() * 90; dp[i*3+2] = (Math.random() - .5) * 280; }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.8, color: 0x4de1ff, transparent: true, opacity: 0.45, depthWrite: false }));
  scene.add(dust);

  /* ---- corridors: flat strips clipped at the room walls, with door markers ---- */
  const edges = [];
  GRAPH.edges.forEach(([a, b]) => {
    const na = nodeById.get(a), nb = nodeById.get(b);
    if ((na.floor || 0) !== (nb.floor || 0)) {          // stairs / lift shaft between floors
      const A = W(na), B = W(nb); A.y += 1; B.y += 1;
      const dir = B.clone().sub(A), len = dir.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, len, 10), new THREE.MeshStandardMaterial({ color: 0x8b6cff, emissive: 0x8b6cff, emissiveIntensity: 0.4, transparent: true, opacity: 0.75 }));
      m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      scene.add(m); edges.push({ m, a, b, doors: [], shaft: true }); return;
    }
    const fy = FY(na);
    const ra = ROOMS[a], rb = ROOMS[b], dx = rb[0] - ra[0], dz = rb[1] - ra[1];
    const lim = (w, d) => Math.min(Math.abs(dx) > 1e-6 ? w / 2 / Math.abs(dx) : Infinity, Math.abs(dz) > 1e-6 ? d / 2 / Math.abs(dz) : Infinity);
    let t0 = lim(ra[2], ra[3]), t1 = 1 - lim(rb[2], rb[3]);
    if (t1 - t0 < 0.03) { const mid = (t0 + t1) / 2; t0 = mid - 0.015; t1 = mid + 0.015; }
    const L = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx);
    const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.5, L * (t1 - t0)), 0.14, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x4a78c2, emissive: 0x4a78c2, emissiveIntensity: 0.3, roughness: 0.7, transparent: true, opacity: 0.8 }));
    m.position.set(ra[0] + dx * (t0 + t1) / 2, fy + 0.07, ra[1] + dz * (t0 + t1) / 2); m.rotation.y = ang; scene.add(m);
    const doors = [t0, t1].map(t => {
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 3.4), new THREE.MeshBasicMaterial({ color: 0x4de1ff, transparent: true, opacity: 0.85 }));
      d.position.set(ra[0] + dx * t, fy + 1.2, ra[1] + dz * t); d.rotation.y = ang; scene.add(d); return d;
    });
    edges.push({ m, a, b, doors });
  });

  /* ---- rooms ---- */
  const objs = new Map(), tops = new Map(), bodies = [];
  const RED = new THREE.Color(0xff3b57);
  const crowdGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.8, 6), dummy = new THREE.Object3D();
  GRAPH.nodes.forEach(n => {
    const T = TYPE[n.type], R = ROOMS[n.id], w = R[2], d = R[3], h = HGT[n.type], junction = n.type === "JUNCTION";
    const g = new THREE.Group(); g.position.set(R[0], FY(n), R[1]); scene.add(g);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), new THREE.MeshStandardMaterial({ color: T.c, emissive: T.c, emissiveIntensity: 0.18, roughness: 0.8, transparent: true, opacity: 0.6 }));
    floor.position.y = 0.15; g.add(floor);
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const body = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ color: T.c, emissive: T.c, emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.1, transparent: true, opacity: junction ? 0.06 : 0.16, depthWrite: false, side: THREE.DoubleSide }));
    body.position.y = h / 2; body.userData.id = n.id; g.add(body); bodies.push(body);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(wallGeo), new THREE.LineBasicMaterial({ color: T.c, transparent: true, opacity: junction ? 0.4 : 0.95 }));
    outline.position.y = h / 2; g.add(outline);
    const o = { g, body, floor, outline, T, n, h, w, d, junction, base: new THREE.Color(T.c) };
    if (n.type === "STAIRS") for (let i = 0; i < 5; i++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, (i + 1) * h / 6, d / 6), new THREE.MeshStandardMaterial({ color: T.c, roughness: 0.6 }));
      st.position.set(0, (i + 1) * h / 12, d / 2 - d / 12 - i * d / 6); g.add(st);
    }
    if (n.type === "LIFT") { const sh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.9, d * 0.5), new THREE.MeshStandardMaterial({ color: 0xc8d0e4, metalness: 0.6, roughness: 0.3 })); sh.position.y = h * 0.45; g.add(sh); }
    if (isExit(n)) {
      o.beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 22, 8), new THREE.MeshBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
      o.beacon.position.y = 11; g.add(o.beacon);
      const r0 = Math.min(w, d) * 0.42;
      o.pulse = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.5, 40), new THREE.MeshBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      o.pulse.rotation.x = -Math.PI / 2; o.pulse.position.y = 0.36; g.add(o.pulse);
    }
    o.heat = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0xff2d4a, transparent: true, opacity: 0.3, depthWrite: false }));
    o.heat.rotation.x = -Math.PI / 2; o.heat.position.y = 0.04; o.heat.visible = false; g.add(o.heat);
    let seed = n.id * 7919 + 13; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    o.crowd = new THREE.InstancedMesh(crowdGeo, new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xffb020, emissiveIntensity: 0.45 }), 24);
    for (let i = 0; i < 24; i++) { dummy.position.set((rnd() - 0.5) * (w - 2.5), 1.2, (rnd() - 0.5) * (d - 2.5)); dummy.updateMatrix(); o.crowd.setMatrixAt(i, dummy.matrix); }
    o.crowd.count = 0; o.crowd.visible = false; g.add(o.crowd);
    o.block = new THREE.Group();
    const xl = Math.max(w, d) * 0.85;
    [Math.PI / 4, -Math.PI / 4].forEach(r => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, xl), new THREE.MeshBasicMaterial({ color: 0xff2d4a, depthTest: false })); b.rotation.y = r; b.renderOrder = 9; o.block.add(b); });
    o.block.position.y = h + 1.6; o.block.visible = false; g.add(o.block);
    o.fire = new THREE.Group();
    [[0, 0, 1.1, 0xff7a1a], [1.6, 0.9, 0.8, 0xffc23a], [-1.4, -0.9, 0.9, 0xff4d1a], [0.4, -1.8, 0.7, 0xffc23a]].forEach(([x, z, sc, c]) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(1.5 * sc, 5.6 * sc, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false }));
      f.position.set(x, 2.8 * sc, z); o.fire.add(f);
    });
    o.fire.position.y = 0.3; o.fire.visible = false; g.add(o.fire);
    const rr = Math.min(w, d) * 0.42;
    o.med = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.25, 8, 40), new THREE.MeshBasicMaterial({ color: 0x4da6ff, transparent: true, opacity: 0.9 }));
    o.med.rotation.x = Math.PI / 2; o.med.position.y = h + 1.2; o.med.visible = false; g.add(o.med);
    o.sec = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.28, 6, 6), new THREE.MeshBasicMaterial({ color: 0xb06cff, transparent: true, opacity: 0.95 }));
    o.sec.rotation.x = Math.PI / 2; o.sec.position.y = h + 2; o.sec.visible = false; g.add(o.sec);
    objs.set(n.id, o); tops.set(n.id, new THREE.Vector3(R[0], FY(n) + h, R[1]));
  });

  /* ---- labels: name painted on each room floor + floating tags for highlighted rooms ---- */
  let labelMode = "key", highlight = new Set(), selIds = new Set(), alertIds = new Set();
  function makeLabel(n) {
    const c = document.createElement("canvas"), x = c.getContext("2d");
    const font = "600 30px " + (cssVar("--sans") || "sans-serif");
    x.font = font; const text = n.id + "  " + n.name, w = Math.ceil(x.measureText(text).width) + 36;
    c.width = w; c.height = 64; x.font = font; x.textBaseline = "middle";
    x.fillStyle = cssVar("--labelbg") || "rgba(8,13,26,.8)"; x.beginPath();
    (x.roundRect ? x.roundRect(0, 4, w, 56, 14) : x.rect(0, 4, w, 56)); x.fill();
    x.fillStyle = cssVar("--label") || "#fff"; x.fillText(text, 18, 33);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.set(4.2 * w / 64, 4.2, 1); sp.renderOrder = 20; return sp;
  }
  function makeFloorLabel(o) {
    const c = document.createElement("canvas"), x = c.getContext("2d"), n = o.n;
    const font = "700 44px " + (cssVar("--sans") || "sans-serif");
    x.font = font; const tw = Math.ceil(x.measureText(n.name).width);
    c.width = tw + 40; c.height = 100; x.font = font; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = cssVar("--label") || "#fff"; x.globalAlpha = 0.92; x.fillText(n.name, c.width / 2, 40);
    x.font = "600 26px " + (cssVar("--mono") || "monospace"); x.globalAlpha = 0.55; x.fillText("#" + n.id, c.width / 2, 80);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const aspect = c.width / c.height; let pw = o.w * 0.86, ph = pw / aspect;
    if (ph > o.d * 0.6) { ph = o.d * 0.6; pw = ph * aspect; }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.34; return m;
  }
  function buildLabels() {
    objs.forEach(o => {
      [o.label, o.flabel].forEach(l => { if (l) { o.g.remove(l); l.material.map.dispose(); l.material.dispose(); l.geometry && l.geometry.dispose(); } });
      o.label = makeLabel(o.n); o.label.position.y = o.h + 4; o.g.add(o.label);
      o.flabel = makeFloorLabel(o); o.g.add(o.flabel);
    });
    updateLabels();
  }
  function updateLabels() {
    objs.forEach((o, id) => {
      if (!o.label) return;
      o.label.visible = labelMode === "all" || (labelMode === "key" && (highlight.has(id) || selIds.has(id) || alertIds.has(id)));
      o.flabel.visible = labelMode !== "off" && (o.n.floor || 0) === focusFloor;
    });
  }

  /* ---- selection markers ---- */
  function marker(color) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.28, 8, 40), new THREE.MeshBasicMaterial({ color, depthTest: false })); ring.rotation.x = Math.PI / 2; ring.renderOrder = 11;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 12), new THREE.MeshBasicMaterial({ color, depthTest: false })); cone.rotation.x = Math.PI; cone.position.y = 10; cone.renderOrder = 11;
    g.add(ring, cone); g.visible = false; scene.add(g); return g;
  }
  const mFrom = marker(0x3ddc97), mTo = marker(0x4de1ff), mSel = marker(0xffffff);

  /* ---- routes + agents ---- */
  const routeGroup = new THREE.Group(), agentGroup = new THREE.Group(); scene.add(routeGroup, agentGroup);
  let runners = [], agents = [], agentWait = 0;
  function clearGroup(g) {
    while (g.children.length) { const c = g.children.pop(); c.geometry && c.geometry.dispose(); c.material && c.material.dispose(); }
  }
  api.setRoutes = list => {
    clearGroup(routeGroup); runners = []; highlight = new Set();
    list.forEach((r, i) => {
      r.path.forEach(id => highlight.add(id));
      const pts = r.path.map(id => { const p = W(nodeById.get(id)); p.y += 0.6 + i * 0.4; return p; });
      if (pts.length > 1) {
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05), pts.length * 14, 0.4, 8, false),
          new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.92, depthTest: false }));
        tube.renderOrder = 10; routeGroup.add(tube);
      }
      pts.forEach(p => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), new THREE.MeshBasicMaterial({ color: r.color, depthTest: false })); s.position.copy(p); s.renderOrder = 10; routeGroup.add(s); });
      if (pts.length > 1) {
        const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); head.renderOrder = 12; routeGroup.add(head);
        const trail = [];
        for (let k = 0; k < 5; k++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.95 - k * 0.14, 10, 8), new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.85 - k * 0.14, depthTest: false })); t.renderOrder = 12; routeGroup.add(t); trail.push(t); }
        runners.push({ poly: makePoly(pts), head, trail, d: -i * 6 });
      }
    });
    updateLabels();
  };
  api.setAgents = list => {
    clearGroup(agentGroup); agents = []; agentWait = 0;
    list.forEach(a => {
      const pts = a.path.map(id => { const p = W(nodeById.get(id)); p.y += 1.2; return p; });
      if (pts.length < 2) return;
      const m = new THREE.Mesh(new THREE.SphereGeometry(a.size, 14, 10), new THREE.MeshBasicMaterial({ color: a.color, transparent: true, opacity: 0.95, depthTest: false }));
      m.renderOrder = 13; agentGroup.add(m); agents.push({ m, poly: makePoly(pts), d: 0, speed: 16 + Math.random() * 4 });
    });
  };
  const tmp = new THREE.Vector3();

  /* ---- node/edge appearance ---- */
  api.refresh = emergencies => {
    alertIds = new Set();
    objs.forEach((o, id) => {
      const nd = nodeById.get(id), heat = Math.min(1, nd.risk / 10);
      const col = o.base.clone().lerp(RED, Math.min(1, nd.risk / 8) * 0.85);
      o.floor.material.color.copy(col); o.floor.material.emissive.copy(col); o.floor.material.emissiveIntensity = 0.18 + heat * 0.7;
      o.body.material.color.copy(col); o.body.material.emissive.copy(col);
      o.body.material.opacity = nd.blocked ? 0.42 : (o.junction ? 0.06 : 0.16 + heat * 0.12);
      o.outline.material.color.copy(nd.blocked ? RED : col);
      o.heat.visible = nd.risk > 0.05; o.heat.scale.setScalar(Math.max(o.w, o.d) * 0.7 + nd.risk * 1.6); o.heat.material.opacity = heat * 0.4;
      o.crowd.count = Math.round(Math.min(10, nd.congestion) * 2.4); o.crowd.visible = o.crowd.count > 0;
      o.block.visible = nd.blocked;
      o.fire.visible = o.med.visible = o.sec.visible = false;
    });
    emergencies.forEach(e => {
      if (e.status === "RESOLVED") return;
      const o = objs.get(e.loc); alertIds.add(e.loc);
      if (e.type === "fire") o.fire.visible = true; else if (e.type === "medical") o.med.visible = true; else o.sec.visible = true;
    });
    const edgeCol = new THREE.Color(cssVar("--edge") || "#4a78c2"), doorCol = new THREE.Color(cssVar("--accent") || "#4de1ff");
    edges.forEach(e => {
      const a = nodeById.get(e.a), b = nodeById.get(e.b), r = Math.max(a.risk, b.risk), blocked = a.blocked || b.blocked;
      e.m.material.color.copy(edgeCol).lerp(RED, Math.min(1, r / 7)); e.m.material.emissive.copy(e.m.material.color);
      e.m.material.opacity = blocked ? 0.3 : 0.8;
      e.doors.forEach(d => { d.material.color.copy(blocked ? RED : doorCol); });
    });
    updateLabels();
  };
  api.setSel = (from, to, sel) => {
    [[mFrom, from], [mTo, to], [mSel, sel]].forEach(([m, id]) => { m.visible = !!id; if (id) m.position.set(tops.get(id).x, FY(nodeById.get(id)) + 0.4, tops.get(id).z); });
    selIds = new Set([from, to, sel].filter(Boolean)); updateLabels();
  };

  /* ---- theme ---- */
  function applyTheme() {
    const bg = new THREE.Color(cssVar("--scene-bg") || "#060912"), light = bg.r + bg.g + bg.b > 1.5;
    scene.background = bg; scene.fog = new THREE.FogExp2(bg.getHex(), light ? 0.0016 : 0.0022);
    slab.material.color.set(light ? 0xf4f7ff : 0x0d1630); slabEdge.material.color.set(cssVar("--accent") || "#4de1ff");
    dust.material.color.set(cssVar("--accent") || "#4de1ff"); dust.material.opacity = light ? 0.25 : 0.45;
    if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
    grid = new THREE.GridHelper(520, 52, new THREE.Color(cssVar("--grid1") || "#27406f"), new THREE.Color(cssVar("--grid2") || "#111b34"));
    grid.position.y = 0.02; grid.material.transparent = true; grid.material.opacity = 0.7; scene.add(grid);
    buildLabels();
  }
  api.applyTheme = applyTheme;

  /* ---- camera (own orbit controls) ---- */
  const cam = { th: 0.5, ph: 0.95, r: R0, tx: (minX + maxX) / 2, tz: (minZ + maxZ) / 2, ty: 0 }, des = Object.assign({}, cam);
  const sph = new THREE.Spherical(), target = new THREE.Vector3();
  let spin = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rotate = (dx, dy) => { des.th -= dx * 0.0055; des.ph = clamp(des.ph - dy * 0.0055, 0.12, 1.5); };
  const zoom = f => { des.r = clamp(des.r * f, 35, 620); };
  const pan = (dx, dy) => {
    const k = des.r * 0.0016, rx = Math.cos(des.th), rz = -Math.sin(des.th), fx = -Math.sin(des.th), fz = -Math.cos(des.th);
    des.tx += -rx * dx * k + fx * dy * k; des.tz += -rz * dx * k + fz * dy * k;
    des.tx = clamp(des.tx, minX, maxX); des.tz = clamp(des.tz, minZ, maxZ);
  };
  api.preset = name => {
    spin = false;
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    if (name === "iso") Object.assign(des, { th: 0.5, ph: 0.95, r: R0, tx: cx, tz: cz });
    if (name === "top") Object.assign(des, { th: 0, ph: 0.12, r: R0 * 1.05, tx: cx, tz: cz });
    if (name === "side") Object.assign(des, { th: 0, ph: 1.3, r: R0 * 0.95, tx: cx, tz: cz });
  };
  api.frame = ids => {
    if (!ids || !ids.length) return api.preset("iso");
    let cx = 0, cz = 0, ext = 0; const ps = ids.map(id => W(nodeById.get(id)));
    ps.forEach(p => { cx += p.x; cz += p.z; }); cx /= ps.length; cz /= ps.length;
    ps.forEach(p => { ext = Math.max(ext, Math.hypot(p.x - cx, p.z - cz)); });
    Object.assign(des, { tx: cx, tz: cz, r: clamp(ext * 2.6 + 80, 80, 460), ph: 0.95 });
  };
  let focusFloor = 0;
  api.setFloor = f => { focusFloor = f; des.ty = f * FLOOR_H; updateLabels(); };
  api.toggleSpin = () => (spin = !spin && !calm);
  api.cycleLabels = () => { labelMode = labelMode === "key" ? "all" : labelMode === "all" ? "off" : "key"; updateLabels(); return labelMode; };

  /* ---- pointer input ---- */
  const ptrs = new Map(); let down = null, pinch = null;
  const v2 = new THREE.Vector3();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickAt(cx, cy, maxPx) {
    const r = canvas.getBoundingClientRect();
    ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(bodies, false)[0];
    return hit ? hit.object.userData.id : nearest(cx, cy, maxPx);
  }
  function nearest(cx, cy, maxPx) {
    const r = canvas.getBoundingClientRect(); let best = null, bd = maxPx;
    tops.forEach((p, id) => {
      v2.copy(p).project(camera); if (v2.z > 1) return;
      const sx = (v2.x + 1) / 2 * r.width + r.left, sy = (1 - v2.y) / 2 * r.height + r.top, d = Math.hypot(sx - cx, sy - cy);
      if (d < bd) { bd = d; best = id; }
    });
    return best;
  }
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("wheel", e => { e.preventDefault(); zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  canvas.addEventListener("pointerdown", e => {
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, shift: e.shiftKey, type: e.pointerType });
    down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; spin = false;
    if (ptrs.size === 2) pinch = null;
  });
  canvas.addEventListener("pointermove", e => {
    const p = ptrs.get(e.pointerId);
    if (!p) { if (e.pointerType === "mouse" && api.onHover) { const id = pickAt(e.clientX, e.clientY, 24); api.onHover(id, e.clientX, e.clientY); } return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (down) down.moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 1) { if (p.b === 2 || p.b === 1 || p.shift) pan(dx, dy); else rotate(dx, dy); }
    else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      if (pinch) { zoom(pinch.d / Math.max(d, 1)); pan(cx - pinch.cx, cy - pinch.cy); }
      pinch = { d, cx, cy };
    }
  });
  const end = e => {
    const p = ptrs.get(e.pointerId);
    if (p && ptrs.size === 1 && down && down.moved < 7 && performance.now() - down.t < 600 && e.type === "pointerup") {
      const id = pickAt(e.clientX, e.clientY, p.type === "touch" ? 38 : 26); if (id && api.onPick) api.onPick(id);
    }
    ptrs.delete(e.pointerId); pinch = null; if (!ptrs.size) down = null;
  };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", () => { if (api.onHover && !ptrs.size) api.onHover(null); });

  /* ---- resize + loop ---- */
  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const tmpV = new THREE.Vector3();
  let activeView = true;
  api.setActive = on => { activeView = on; if (on) resize(); };
  function loop() {
    requestAnimationFrame(loop);
    if (!activeView) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, k = 1 - Math.exp(-dt * 9);
    if (spin) des.th += dt * 0.12;
    cam.th += (des.th - cam.th) * k; cam.ph += (des.ph - cam.ph) * k; cam.r += (des.r - cam.r) * k;
    cam.tx += (des.tx - cam.tx) * k; cam.tz += (des.tz - cam.tz) * k;
    cam.ty += (des.ty - cam.ty) * k; target.set(cam.tx, cam.ty, cam.tz); sph.set(cam.r, cam.ph, cam.th);
    camera.position.setFromSpherical(sph).add(target); camera.lookAt(target);
    glow.position.set(cam.tx, 70, cam.tz);

    const amp = calm ? 0 : 1;
    objs.forEach((o, id) => {
      if (o.pulse) { const s = 1 + ((t * 0.9 + id * 0.13) % 1) * 1.1 * amp; o.pulse.scale.setScalar(s); o.pulse.material.opacity = 0.65 * (1 - ((t * 0.9 + id * 0.13) % 1) * amp); }
      if (o.fire.visible) o.fire.children.forEach((f, i) => { const s = 1 + 0.28 * Math.sin(t * 9 + i * 2 + id) * amp; f.scale.set(1, s, 1); });
      if (o.block.visible) o.block.rotation.y = t * 0.8 * amp;
      if (o.med.visible) { const s = 1 + 0.18 * Math.sin(t * 4 + id) * amp; o.med.scale.set(s, s, s); }
      if (o.sec.visible) o.sec.rotation.z = t * 1.4 * amp;
    });
    mFrom.children[1].position.y = 10 + Math.sin(t * 4) * 0.6 * amp; mTo.children[1].position.y = 10 + Math.sin(t * 4 + 1) * 0.6 * amp; mSel.children[1].position.y = 10 + Math.sin(t * 4 + 2) * 0.6 * amp;
    dust.rotation.y = t * 0.01 * amp;

    runners.forEach(r => {
      r.d += dt * 22; if (r.d > r.poly.total + 14) r.d = -4;
      const d = Math.max(0, Math.min(r.d, r.poly.total));
      r.poly.at(d, tmpV); r.head.position.copy(tmpV); r.head.visible = r.d >= 0;
      r.trail.forEach((s, i) => { const dd = r.d - (i + 1) * 2.6; s.visible = dd >= 0 && r.d >= 0; if (s.visible) { r.poly.at(Math.min(dd, r.poly.total), tmpV); s.position.copy(tmpV); } });
    });
    if (agents.length) {
      let alive = 0;
      agents.forEach(a => { a.d += dt * a.speed; const done = a.d >= a.poly.total; a.m.visible = !done; if (!done) { alive++; a.poly.at(a.d, a.m.position); } });
      if (!alive) { agentWait += dt; if (agentWait > 1.4) { agentWait = 0; agents.forEach(a => { a.d = 0; }); } }
    }
    renderer.render(scene, camera);
  }
  applyTheme(); loop();
  return api;
}
