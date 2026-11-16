// Campus RESQ UI · Central state updates and all event handlers (tabs, buttons, map clicks, keyboard)
"use strict";
/* ---- central state handling ---- */
function toRoute() { if (state.view === "drill") setDrill(false); else { state.view = "route"; renderRoute(); } }
function refreshView() {
  if (state.view === "help") return renderHelp(false);
  if (state.view === "plan") { const e = emergencies.find(x => x.id === state.planFor && x.status === "HANDLING"); if (e) return showPlan(e); state.view = "route"; }
  if (state.view === "drill") return renderDrill();
  renderRoute();
}
function changed(hazard) {
  if (hazard) state.hazardTouch = true;
  syncState();
  if (view) view.refresh(emergencies);
  renderQueue(); refreshView();
}
function hazardsChanged() { applyHazards(emergencies); if (view) view.refresh(emergencies); renderQueue(); state.hazardTouch = true; refreshView(); }

/* ---- events ---- */
$("selFrom").addEventListener("change", e => { state.from = +e.target.value; setFloor(floorOf(state.from), true); toRoute(); });
$("selTo").addEventListener("change", e => { state.to = +e.target.value; toRoute(); });
$("btnSwap").addEventListener("click", () => {
  if (state.to === 0) return toast("Choose a specific destination to swap.");
  [state.from, state.to] = [state.to, state.from]; $("selFrom").value = state.from; $("selTo").value = state.to; toRoute();
});
const setAlgo = seg("algoSeg", v => { state.algo = v; toRoute(); });
function setWeights(a, b, g) { state.a = a; state.b = b; state.g = g; $("sa").value = a; $("sb").value = b; $("oa").textContent = a.toFixed(1); $("ob").textContent = b.toFixed(1); }
$("chkEvac").addEventListener("change", e => { state.evac = e.target.checked; e.target.checked ? setWeights(1, 5, 1.5) : setWeights(1, 2, 1.5); toRoute(); });
[["sa", "oa", "a"], ["sb", "ob", "b"]].forEach(([s, o, k]) => $(s).addEventListener("input", e => { state[k] = +e.target.value; $(o).textContent = state[k].toFixed(1); toRoute(); }));

seg("typeSeg", v => (state.type = v));
state.helpType = "fire";
const setHelpType = seg("hType", v => { state.helpType = v; save(); });
$("hGo").addEventListener("click", () => { startHelp(); if (innerWidth <= 860) $("helpOut").scrollIntoView({ behavior: "smooth", block: "start" }); });
$("hYou").addEventListener("change", () => { if (view && !state.help) view.setSel(+$("hYou").value || null, null, null); });
const armPick = which => { state.helpPick = which; $("hPickYou").classList.toggle("armed", which === "you"); $("hPickAt").classList.toggle("armed", which === "at"); toast(which === "you" ? "Tap the room you are in." : "Tap the room where it is happening."); if (innerWidth <= 860) $("panel").classList.add("collapsed"); };
$("hPickYou").addEventListener("click", () => armPick("you"));
$("hPickAt").addEventListener("click", () => armPick("at"));
$("helpOut").addEventListener("click", ev => {
  const b = ev.target.closest("[data-act]"); if (!b || !state.help) return;
  if (b.dataset.act === "frame") { const g = guidePerson(state.help.you, state.help.type, state.help.at); if (view && g.route) view.frame([...new Set([...g.route.path, state.help.at])]); if (innerWidth <= 860) $("panel").classList.add("collapsed"); }
  if (b.dataset.act === "safe") { state.help = null; renderHelp(false); toast("Glad you are safe. The alert stays open for the command team.", "good"); }
});
$("sev").addEventListener("input", e => ($("sevOut").textContent = e.target.value));
$("btnReport").addEventListener("click", () => {
  const sev = Math.round(+$("sev").value);
  if (!(sev >= 1 && sev <= 10) || !nodeById.has(+$("selLoc").value)) return toast("Choose a room and a severity from 1 to 10.");
  const e = { id: emSeq++, type: state.type, loc: +$("selLoc").value, sev, status: "PENDING" };
  emergencies.push(e); queue.push(e);
  if (!state.evac && e.type !== "medical") { $("chkEvac").checked = true; state.evac = true; setWeights(1, 5, 1.5); toast("Evacuation profile switched on.", "good"); }
  toast(`${TYPE_LABEL[e.type]} reported at ${nm(e.loc)} (severity ${e.sev}).`, "bad");
  hazardsChanged();
  setFloor(floorOf(e.loc), true);
  if (view) view.frame([e.loc, ...adj.get(e.loc).map(x => x.to)]);
});
$("btnDispatch").addEventListener("click", () => {
  const e = queue.pop(); if (!e) return toast("No pending emergencies.");
  e.status = "HANDLING"; renderQueue(); showPlan(e); toast(`Dispatched: ${TYPE_LABEL[e.type]} at ${nm(e.loc)}.`, "good");
});
$("btnClearAlerts").addEventListener("click", () => { emergencies.length = 0; queue = new StdPriorityQueue(); hazardsChanged(); toast("All emergencies cleared."); });
$("responseOut").addEventListener("click", ev => {
  const b = ev.target.closest("button"); if (!b) return; const e = emergencies.find(x => x.id === +b.dataset.id); if (!e) return;
  if (b.dataset.act === "show") { showPlan(e); if (innerWidth <= 860) $("panel").classList.add("collapsed"); }
  if (b.dataset.act === "resolve") { e.status = "RESOLVED"; toast(`Resolved: ${TYPE_LABEL[e.type]} at ${nm(e.loc)}.`, "good"); hazardsChanged(); }
});

$("btnDrill").addEventListener("click", () => setDrill(state.view !== "drill"));
$("nodeOut").addEventListener("click", ev => {
  const b = ev.target.closest("[data-act]"); if (!b) return;
  if (b.dataset.act === "resetall") { nodeById.forEach(n => { n.manualRisk = 0; n.manualBlocked = false; }); changed(true); toast("All rooms reset."); return; }
  if (state.selected == null) return; const n = nodeById.get(state.selected);
  if (b.dataset.act === "setfrom") { state.from = n.id; $("selFrom").value = n.id; toRoute(); }
  if (b.dataset.act === "setto") { state.to = n.id; $("selTo").value = n.id; toRoute(); }
  if (b.dataset.act === "resetnode") { n.manualRisk = 0; n.manualCong = 0; n.manualBlocked = false; changed(true); renderNode(); }
});

/* tabs, panel, camera tools */
$("tabs").addEventListener("click", ev => {
  const b = ev.target.closest("button[data-tab]"); if (!b) return; state.tab = b.dataset.tab;
  $("tabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll(".tabbody").forEach(s => s.classList.toggle("on", s.id === "tab-" + state.tab));
  $("panel").classList.remove("collapsed");
  if (state.tab === "help" && state.view !== "drill") { state.view = "help"; renderHelp(false); }
  if (state.tab === "route" && state.view === "help") { state.view = "route"; renderRoute(); }
});
$("collapse").addEventListener("click", () => $("panel").classList.toggle("collapsed"));
function toolOn(id, on) { $(id).classList.toggle("on", on); }
[["tIso", "iso"], ["tTop", "top"], ["tSide", "side"]].forEach(([id, p]) => $(id).addEventListener("click", () => { if (view) view.preset(p); ["tIso", "tTop", "tSide"].forEach(x => toolOn(x, x === id)); toolOn("tSpin", false); }));
$("tFrame").addEventListener("click", () => {
  if (!view) return; const ids = new Set();
  if (state.view === "plan") { const e = emergencies.find(x => x.id === state.planFor); if (e) { const p = makePlan(e); [p.evac, p.responder].forEach(r => r && r.path.forEach(i => ids.add(i))); ids.add(e.loc); } }
  else { const res = planRoutes(); Object.values(res).forEach(r => r && r.path.forEach(i => ids.add(i))); ids.add(state.from); }
  view.frame([...ids]);
});
$("tLabels").addEventListener("click", () => { if (view) toast("Labels: " + view.cycleLabels()); });
$("tSpin").addEventListener("click", () => { if (view) toolOn("tSpin", view.toggleSpin()); });
if (view) {
  view.onPick = id => {
    state.selected = id; renderNode();
    if (state.tab === "help") {
      if (state.helpPick === "at") { $("hAt").value = id; toast("Happening at: " + nm(id)); state.helpPick = "you"; }
      else { $("hYou").value = id; toast("You are in: " + nm(id)); }
      $("hPickYou").classList.remove("armed"); $("hPickAt").classList.remove("armed");
      $("panel").classList.remove("collapsed");
      if (state.help) { state.help.you = +$("hYou").value; state.help.at = +$("hAt").value || state.help.you; }
      if (state.help) return renderHelp(false);
      if (view) view.setSel(+$("hYou").value || null, null, null);
      return;
    }
    if (state.tab === "alerts") { $("selLoc").value = id; toast("Alert location: " + nm(id)); }
    else if (state.tab === "route") {
      if (state.nextPick === "from") { state.from = id; $("selFrom").value = id; state.nextPick = "to"; toast("From: " + nm(id)); }
      else { state.to = id; $("selTo").value = id; state.nextPick = "from"; toast("To: " + nm(id)); }
      if (state.view === "drill") return setDrill(false);
      state.view = "route";
    }
    refreshView();
  };
  const tip = $("tip");
  view.onHover = (id, x, y) => {
    if (!id) { tip.style.display = "none"; return; }
    const n = nodeById.get(id);
    tip.innerHTML = `<b>${esc(n.name)}</b><span>#${n.id} · ${n.type}${n.blocked ? " · BLOCKED" : ""}${n.risk > 0.05 ? " · risk " + fmt(n.risk) : ""}${n.congestion > 0.05 ? " · crowd " + fmt(n.congestion) : ""}</span>`;
    tip.style.display = "block"; tip.style.left = Math.min(x + 14, innerWidth - 230) + "px"; tip.style.top = Math.max(y - 54, 8) + "px";
  };
  const retheme = () => view.applyTheme();
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

$("modeSeg").addEventListener("click", ev => { const b = ev.target.closest("button"); if (b) setMode(b.dataset.v); });
window.addEventListener("hashchange", () => { const h = parseHash(location.hash); if (h.floor !== floor) setFloor(h.floor, true); if (h.mode !== mode) setMode(h.mode, true); });
$("floorSeg").addEventListener("click", ev => { const b = ev.target.closest("button"); if (b) setFloor(+b.dataset.v); });
$("tZin").addEventListener("click", () => flatView() && flatView().zoomBy(0.7));
$("tZout").addEventListener("click", () => flatView() && flatView().zoomBy(1.4));

/* single-floor edition: no floor switch, no floor-link legend items */
if (FLOORS.length < 2) { $("floorSeg").hidden = true; document.querySelectorAll("#legend .lgfloor").forEach(e => (e.hidden = true)); }
