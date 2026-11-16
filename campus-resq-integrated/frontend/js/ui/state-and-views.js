// Campus RESQ UI · Shared helpers, app state, creation of the Map/Graph/3D views, view and floor switching
"use strict";
/* ===================== APP / UI ===================== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nm = id => nodeById.get(id).name + (floorOf(id) ? ` (${FLOOR_SHORT[floorOf(id)]})` : "");
const fmt = v => (Math.round(v * 10) / 10).toString();
const COLORS = { dijkstra: 0x4de1ff, bfs: 0xffb020, evac: 0x4de1ff, responder: 0xffb020 };
const EXIT_COLORS = [0x3ddc97, 0x4de1ff, 0xffb020, 0xff6b9a, 0xb08cff];

let view3d = null;
try { view3d = createView($("gl")); } catch (err) { console.error(err); view3d = null; }
const make2d = (kind, f) => { try { return createMap2D($("app"), kind, f); } catch (err) { console.error(err); return null; } };
const FLAT = { "2d": FLOORS.map(f => make2d("map", f)), graph: FLOORS.map(f => make2d("graph", f)) };   // one SVG per view per floor
const map2d = FLAT["2d"][0], graph2d = FLAT.graph[0];
// hash: #map, #graph, #3d, optionally with a floor: #map-1f
const parseHash = h => { const m = /^#(map|graph|3d)(?:-(\d)f)?$/.exec(h || ""); return m ? { mode: m[1] === "map" ? "2d" : m[1], floor: Math.min(+(m[2] || 0), FLOORS.length - 1) } : { mode: "2d", floor: 0 }; };
const hashOf = (m, f) => "#" + (m === "2d" ? "map" : m) + (f ? `-${f}f` : "");
let { mode, floor } = parseHash(location.hash);
if (mode === "3d" && !view3d) mode = "2d";
if (!view3d && !map2d && !graph2d) $("nogl").hidden = false;

// One interface that forwards to both views, so they always show the same scenario.
const view = (view3d || map2d) ? (() => {
  const all = () => [view3d, ...FLAT["2d"], ...FLAT.graph].filter(Boolean);
  const act = () => (mode === "3d" ? view3d : FLAT[mode][floor]) || map2d || graph2d || view3d;
  const m = {};
  ["setRoutes", "setAgents", "refresh", "setSel", "applyTheme", "preset", "frame"].forEach(k => (m[k] = (...args) => all().forEach(v => v[k](...args))));
  m.cycleLabels = () => act().cycleLabels();
  m.toggleSpin = () => act().toggleSpin();
  Object.defineProperty(m, "onPick", { set: f => all().forEach(v => (v.onPick = f)) });
  Object.defineProperty(m, "onHover", { set: f => all().forEach(v => (v.onHover = f)) });
  return m;
})() : null;

const HINTS = { "2d": "drag to pan · scroll or pinch to zoom · double-click to zoom in · click a room", graph: "drag to pan · scroll or pinch to zoom · click a node", "3d": "drag orbit · right-drag pan · scroll zoom · click a room" };
const flatView = () => FLAT[mode === "graph" ? "graph" : "2d"][floor];
function setMode(m, quiet) {
  if (m === "3d" && !view3d) { if (!quiet) toast("3D needs WebGL, which is not available here."); m = mode === "3d" ? "2d" : mode; }
  if (m === "2d" && !map2d) m = graph2d ? "graph" : "3d";
  if (m === "graph" && !graph2d) m = map2d ? "2d" : "3d";
  mode = m;
  applyViews();
}
function setFloor(f, quiet) {
  if (!FLOORS.includes(f) || f === floor) return;
  floor = f; applyViews();
  if (!quiet) toast(`Showing the ${FLOOR_NAME[f].toLowerCase()}.`);
}
function applyViews() {
  const m = mode;
  const app = $("app");
  app.classList.toggle("flat", m !== "3d"); app.classList.toggle("mode2d", m === "2d"); app.classList.toggle("modegraph", m === "graph");
  $("modeSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === m));
  $("hint").textContent = HINTS[m];
  ["2d", "graph"].forEach(k => FLAT[k].forEach((v, f) => v && v.setActive(m === k && f === floor)));
  if (view3d) { view3d.setActive(m === "3d"); view3d.setFloor(floor); }
  $("floorSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.v === floor));
  $("tip").style.display = "none";
  if (location.hash !== hashOf(m, floor)) location.hash = hashOf(m, floor);
}

const state = {
  from: 10, to: 0, algo: "dijkstra", evac: false, a: 1, b: 2, g: 1.5,
  tab: "help", view: "help", selected: null, nextPick: "from", helpPick: "you", help: null,
  strat: "aware", type: "fire", hazardTouch: false, planFor: null, prevKey: null, crowdSeed: 7
};
const emergencies = []; let emSeq = 1;

/* ---- tiny helpers ---- */
function toast(msg, kind) {
  const t = document.createElement("div"); t.className = "toast glass " + (kind || ""); t.textContent = msg;
  $("toasts").appendChild(t); setTimeout(() => t.remove(), 3800);
  while ($("toasts").children.length > 3) $("toasts").firstChild.remove();
}
function seg(id, cb) {
  const el = $(id);
  el.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    el.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); cb(b.dataset.v);
  });
  return v => el.querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.v === v));
}
const opts = nodes => FLOORS.map(f => `<optgroup label="${FLOOR_NAME[f]}">` +
  nodes.filter(n => (n.floor || 0) === f).map(n => `<option value="${n.id}">${f ? FLOOR_SHORT[f] + " · " : ""}${f ? n.id - 100 : n.id} · ${esc(n.name)}</option>`).join("") + `</optgroup>`).join("");
const weighted = (r, o) => o.a * r.units + o.b * r.risk;          // backend cost (units); congestion is 0
const currentOpt = () => ({ a: state.a, b: state.b, g: state.g, avoidLifts: state.evac });

/* ---- populate ---- */
$("selFrom").innerHTML = opts(GRAPH.nodes);
$("selTo").innerHTML = `<option value="0">⚑ Nearest safe exit (auto)</option>` + opts(GRAPH.nodes);
$("selLoc").innerHTML = opts(GRAPH.nodes);
$("hYou").innerHTML = `<option value="">Choose your room…</option>` + opts(GRAPH.nodes);
$("hAt").innerHTML = `<option value="0">Here, where I am</option>` + opts(GRAPH.nodes);
$("selFrom").value = state.from; $("selLoc").value = 34;
$("chipNodes").textContent = `${GRAPH.nodes.length} nodes · ${GRAPH.edges.length} links`;
