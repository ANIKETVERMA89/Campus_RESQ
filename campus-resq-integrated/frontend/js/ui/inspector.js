// Campus RESQ UI · Inspect tab: room risk and blocked state
"use strict";
/* ---- inspector ---- */
function renderNode() {
  const id = state.selected;
  if (!id) { $("nodeOut").innerHTML = `<p class="empty">Click any room on the map to inspect it, block it, or add risk.</p><button class="btn small block" data-act="resetall">Reset all rooms (risk, blocks)</button>`; return; }
  const n = nodeById.get(id), nb = adj.get(id).map(e => esc(nm(e.to))).join(", ");
  $("nodeOut").innerHTML = `<div class="card" style="margin-top:0"><h4>${n.id} · ${esc(n.name)} <span class="tag">${n.type}</span></h4>
    <p class="note" style="margin:0 0 10px">Connected to: ${nb}</p>
    <div class="btns" style="margin:0 0 12px"><button class="btn small" data-act="setfrom">Set as From</button><button class="btn small" data-act="setto">Set as To</button></div>
    <div class="sl" style="margin-bottom:8px"><span>Risk</span><input type="range" id="nRisk" min="0" max="10" step="0.5" value="${n.manualRisk}"><output>${fmt(n.manualRisk)}</output></div>
    <label class="check" style="margin:8px 0"><input type="checkbox" id="nBlock" ${n.manualBlocked ? "checked" : ""}><span>Blocked<small>Impassable for every route.</small></span></label>
    ${n.hzBlocked || n.hzRisk > 0 ? `<p class="note">Emergency effect: risk ${fmt(n.hzRisk)}${n.hzBlocked ? ", blocked" : ""}.</p>` : ""}
    <button class="btn small block" data-act="resetnode">Reset this room</button></div>`;
  const upd = () => { n.manualRisk = +$("nRisk").value; n.manualBlocked = $("nBlock").checked; $("nodeOut").querySelector("output").textContent = fmt(n.manualRisk); changed(true); };
  ["nRisk", "nBlock"].forEach(i => $(i).addEventListener("input", upd));
}
