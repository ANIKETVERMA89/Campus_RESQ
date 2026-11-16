// Campus RESQ UI · Alerts tab: priority queue, dispatch and response plans
"use strict";
/* ---- alerts ---- */
const SEV_COLOR = s => (s >= 8 ? "#ff4d6d" : s >= 5 ? "#ffb020" : "#ffd166");
const TYPE_LABEL = { fire: "Fire", medical: "Medical", security: "Security" };
const active = () => emergencies.filter(e => e.status !== "RESOLVED");
// Same rule as EmergencyManager.cpp: priority = severity + dispatches since reported / 3; ties: reported first.
// The backend's EmergencyManager: std::priority_queue ordered by severity (see StdPriorityQueue).
let queue = new StdPriorityQueue();
const pendingOrder = () => queue.order();

function renderQueue() {
  const list = pendingOrder(); save();
  $("queue").innerHTML = list.length ? list.map((e, i) => `<li class="${i === 0 ? "next" : ""}">
    <span class="sev" style="background:${SEV_COLOR(e.sev)}">${e.sev}</span>
    <span class="meta"><b>${TYPE_LABEL[e.type]} · ${esc(nm(e.loc))}</b><span>#${e.id}${i === 0 ? " · next to dispatch" : " · waiting"}</span></span></li>`).join("")
    : `<li class="empty">No pending emergencies.</li>`;
  const n = active().length; $("badge").hidden = !n; $("badge").textContent = n;
  $("chipStatus").classList.toggle("alert", n > 0); $("statusTxt").textContent = n ? `${n} ACTIVE` : "ALL CLEAR";
  const handling = emergencies.filter(e => e.status === "HANDLING");
  $("responseOut").innerHTML = handling.length ? handling.map(e => {
    const p = makePlan(e), line = r => r ? r.path.map(nm).join(" → ") : "No safe route";
    const resp = !p.responder ? "No safe way in from any outside door."
      : p.responder.path.length === 1 ? (p.staged ? `Enter and wait at ${esc(nm(p.entry))}, right next to the scene.` : `Enter at ${esc(nm(p.entry))}; it opens onto the scene.`)
      : `Enter at ${esc(nm(p.entry))}, then ${esc(p.responder.path.slice(1).map(nm).join(" → "))}`;
    return `<div class="card ${p.evac || e.type !== "fire" ? "" : "bad"}"><h4><span class="sev" style="background:${SEV_COLOR(e.sev)};width:24px;height:24px;font-size:11px">${e.sev}</span>${TYPE_LABEL[e.type]} · ${esc(nm(e.loc))}</h4>
      ${p.staged ? `<p class="note" style="margin:0 0 8px">The scene is blocked, so responders stop at ${esc(nm(p.staging))}, next to it.</p>` : ""}
      <p style="margin:0 0 6px"><b style="color:var(--accent)">${p.medical ? "Patient to exit" : "Evacuation from the scene"}:</b> ${esc(line(p.evac))}${p.evac ? ` <span class="tag">${fmt(p.evac.distance)} m</span>` : ""}</p>
      ${e.type !== "fire" ? `<p style="margin:0 0 6px"><b style="color:var(--warn)">Responders:</b> ${resp}${p.responder ? ` <span class="tag">${fmt(p.responder.distance)} m inside</span>` : ""}</p>` : ""}
      <div class="btns"><button class="btn small" data-act="show" data-id="${e.id}">Show on map</button><button class="btn small primary" data-act="resolve" data-id="${e.id}">Resolve</button></div></div>`;
  }).join("") : `<p class="empty">Nothing dispatched yet.</p>`;
}

function showPlan(e) {
  state.view = "plan"; state.planFor = e.id; setFloor(floorOf(e.loc), true);
  const applyPlan = p => {
    const list = [];
    if (p.evac) list.push({ path: p.evac.path, color: COLORS.evac });
    if (p.responder) list.push({ path: p.responder.path, color: COLORS.responder });
    if (view) {
      view.setRoutes(list); view.setSel(p.responder ? p.entry : p.scene, p.evac ? p.evac.path[p.evac.path.length - 1] : null, e.loc);
      view.frame([...new Set([e.loc, ...list.flatMap(l => l.path)])]);
    }
  };
  applyPlan(makePlan(e)); // instant offline fallback while the C++ API responds
  const params = new URLSearchParams({ type: e.type, loc: String(e.loc), severity: String(e.sev) });
  fetch(`/api/plan?${params.toString()}`).then(r => { if (!r.ok) throw new Error("API unavailable"); return r.json(); })
    .then(data => {
      if (data.error || state.view !== "plan" || state.planFor !== e.id) return;
      applyPlan({ scene: data.scene, staging: data.staging, entry: data.entry, staged: data.staged,
        evac: data.evac, responder: data.responder });
      state.backendConnected = true;
    }).catch(() => { state.backendConnected = false; });
}
