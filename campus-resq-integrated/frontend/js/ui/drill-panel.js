// Campus RESQ UI · Drill tab: evacuation plan for every room
"use strict";
/* ---- drill ---- */
let drillResults = null;
function renderDrill() {
  const cur = planDrill(); drillResults = cur;
  const rows = [["Exits used", "exitsUsed", ""], ["Peak exit load", "peakExit", "people"], ["Peak corridor load", "peakTransit", "people"], ["Est. clearing time", "est", "s"], ["Avg walk", "avgDist", "m"]]
    .map(([k, f, u]) => `<tr><td>${k}</td><td>${Math.round(cur[f])} ${u}</td></tr>`).join("");
  const max = Math.max(1, ...cur.exitLoad.values());
  const bars = exitIds().map((id, i) => { const v = cur.exitLoad.get(id) || 0; return `<div class="bar"><span>${id} · ${esc(nm(id).slice(0, 12))}</span><span class="track"><i style="width:${v / max * 100}%;background:#${EXIT_COLORS[i % 5].toString(16).padStart(6, "0")}"></i></span><b>${v}</b></div>`; }).join("");
  $("drillOut").innerHTML = `<div class="card"><h4>Evacuation plan</h4><table>${rows}</table>
    <p class="note">${GRAPH.nodes.filter(n => OCC[n.type]).reduce((s, n) => s + OCC[n.type], 0)} occupants (${Object.entries(OCC).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ")}). Illustrative model: walking ${WALK} m/s, ${FLOW} people/s per doorway, ${cur.stranded} stranded.</p></div>
    <div class="card"><h4>Exit load</h4>${bars}</div>`;
  if (view) {
    const exitIdx = new Map(exitIds().map((id, i) => [id, i]));
    view.setAgents(cur.rows.map(r => ({ path: r.route.path, color: EXIT_COLORS[exitIdx.get(r.exit) % 5], size: 0.7 + Math.sqrt(r.g.people) * 0.18 })));
    view.setRoutes([]); view.setSel(null, null, state.selected);
  }
}
function setDrill(on) {
  $("btnDrill").textContent = on ? "Stop drill" : "Run drill";
  if (on) { state.view = "drill"; renderDrill(); if (view) view.preset("iso"); }
  else { state.view = "route"; $("drillOut").innerHTML = ""; if (view) view.setAgents([]); refreshView(); }
}
