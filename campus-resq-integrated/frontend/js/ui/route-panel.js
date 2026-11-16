// Campus RESQ UI · Route tab: Dijkstra / BFS / compare
"use strict";
/* ---- routing views ---- */
function backendRouteSignature() {
  return JSON.stringify({ from: state.from, to: state.to, algo: state.algo, evac: state.evac,
    a: state.a, b: state.b, g: state.g,
    hazards: emergencies.filter(e => e.status !== "RESOLVED").map(e => [e.type, e.loc, e.sev]).sort((x,y) => x[1]-y[1]) });
}
function planRoutes() {
  const signature = backendRouteSignature();
  if (state.backendRouteSignature === signature && state.backendRoutes) return state.backendRoutes;
  const o = currentOpt(), algos = state.algo === "compare" ? ["dijkstra", "bfs"] : [state.algo], out = {};
  algos.forEach(al => {
    const fn = al === "dijkstra" ? (s, d) => dijkstra(s, d, o) : (s, d) => bfs(s, d, { evac: state.evac });
    out[al] = state.to === 0 ? bestExit(fn, state.from) : fn(state.from, state.to);
  });
  return out;
}

function stepsHtml(path) {
  return `<ol class="steps">` + path.map((id, i) => {
    const n = nodeById.get(id), tags = [];
    if (i > 0) tags.push(`<span class="tag">+${fmt(adj.get(path[i - 1]).find(e => e.to === id).w)} m</span>`);
    if (i > 0 && floorOf(path[i - 1]) !== floorOf(id)) tags.unshift(`<span class="tag warn">${floorOf(id) < floorOf(path[i - 1]) ? "↓" : "↑"} ${FLOOR_NAME[floorOf(id)]}</span>`);
    if (n.risk > 0.4) tags.push(`<span class="tag ${n.risk > 4 ? "bad" : "warn"}">risk ${fmt(n.risk)}</span>`);
    if (n.congestion > 0.4) tags.push(`<span class="tag warn">crowd ${fmt(n.congestion)}</span>`);
    if (isExit(n)) tags.push(`<span class="tag good">exit</span>`);
    return `<li class="${n.risk > 4 ? "hot" : ""}">${esc(n.name)}${tags.join("")}</li>`;
  }).join("") + `</ol>`;
}
function statsHtml(r) {
  return `<div class="stats">
    <div class="stat"><b>${fmt(r.distance)} m</b><span>distance</span></div>
    <div class="stat"><b>${Math.round(r.distance / WALK)} s</b><span>walk time</span></div>
    <div class="stat"><b>${r.hops}</b><span>hops</span></div>
    <div class="stat"><b>${fmt(r.risk)}</b><span>risk</span></div>
    <div class="stat"><b>${fmt(weighted(r, currentOpt()))}</b><span>cost</span></div></div>`;
}

function requestCppBackendRoutes() {
  const signature = backendRouteSignature();
  if (state.backendRequestSignature === signature || state.backendRouteSignature === signature) return;
  state.backendRequestSignature = signature;
  const algos = state.algo === "compare" ? ["dijkstra", "bfs"] : [state.algo];
  const hazards = emergencies.filter(e => e.status !== "RESOLVED" && (e.type === "fire" || e.type === "security"))
    .map(e => `${e.type}:${e.loc}:${e.sev}`).join(",");
  Promise.all(algos.map(async algorithm => {
    const params = new URLSearchParams({ from: String(state.from), to: String(state.to), algorithm,
      evac: state.evac ? "1" : "0", a: String(state.a), b: String(state.b), g: String(state.g), hazards });
    const response = await fetch(`/api/route?${params.toString()}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`C++ API returned ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return [algorithm, data.route];
  })).then(entries => {
    if (backendRouteSignature() !== signature) return;
    state.backendRoutes = Object.fromEntries(entries);
    state.backendRouteSignature = signature;
    state.backendRequestSignature = null;
    state.backendConnected = true;
    renderRoute();
  }).catch(() => {
    if (state.backendRequestSignature === signature) state.backendRequestSignature = null;
    state.backendConnected = false;
    // The existing JavaScript engine remains available as an offline fallback.
  });
}

function renderRoute() {
  state.view = "route";
  const res = planRoutes(), o = currentOpt(), draw = [], html = [];
  const primary = res.dijkstra || res.bfs || null;
  Object.entries(res).forEach(([al, r]) => {
    const label = al === "dijkstra" ? "Dijkstra · risk-aware" : "BFS · fewest hops";
    if (!r) { html.push(`<div class="card bad"><h4>${label}</h4>No safe route exists. Every path is blocked or leads through a lift in evacuation mode.</div>`); return; }
    draw.push({ path: r.path, color: COLORS[al] });
    html.push(`<div class="card"><h4><i class="swatch" style="background:#${COLORS[al].toString(16).padStart(6, "0")}"></i>${label}</h4>${statsHtml(r)}${stepsHtml(r.path)}</div>`);
  });
  if (res.dijkstra && res.bfs) {
    const d = res.dijkstra, b = res.bfs, cd = weighted(d, o), cb = weighted(b, o);
    const win = (x, y) => (x < y ? ["win", ""] : x > y ? ["", "win"] : ["", ""]);
    const rows = [["Distance (m)", d.distance, b.distance], ["Risk", d.risk, b.risk], ["Crowd", d.congestion, b.congestion], ["Weighted cost", cd, cb]]
      .map(([k, x, y]) => { const [wx, wy] = win(x, y); return `<tr><td>${k}</td><td class="${wx}">${fmt(x)}</td><td class="${wy}">${fmt(y)}</td></tr>`; }).join("");
    html.push(`<div class="card"><h4>Head-to-head (same weights)</h4><table><tr><th></th><th>Dijkstra</th><th>BFS</th></tr>${rows}</table>
      <p class="note">${cd < cb - 1e-9 ? `Dijkstra is ${fmt(cb - cd)} cost units cheaper here${d.distance < b.distance ? ` and ${fmt(b.distance - d.distance)} m shorter, even though BFS uses fewer hops` : ""}.` : cd === cb ? "Both routes cost the same in this scenario." : "BFS happens to win on this metric."}</p></div>`);
  }
  $("routeOut").innerHTML = (state.backendConnected ? `<p class="note" style="margin:0 0 8px">● Live C++ backend connected</p>` : "") + (html.join("") || `<p class="empty">Pick a start room.</p>`);

  // react to hazard-driven changes
  const key = primary ? primary.path.join(">") : "none";
  if (state.hazardTouch) {
    if (state.prevKey && state.prevKey !== "none" && key === "none") toast("No safe route remains from here.", "bad");
    else if (state.prevKey && state.prevKey !== "none" && key !== state.prevKey) toast("Route updated to avoid the hazard.", "good");
    state.hazardTouch = false;
  }
  state.prevKey = key;
  requestCppBackendRoutes();
  if (view) {
    view.setRoutes(draw);
    view.setSel(state.from, primary ? primary.path[primary.path.length - 1] : (state.to || null), state.selected);
  }
}
