// Campus RESQ UI · Saving and restoring state in this browser (localStorage)
"use strict";
/* ---- saved state (this browser only) ---- */
const STORE_KEY = "campus-resq-newbackend-state-v1";
let loading = false;
function save() {
  if (loading) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      v: 1, emSeq, queue: queue.c.map(e => e.id),
      emergencies: emergencies.map(({ id, type, loc, sev, status }) => ({ id, type, loc, sev, status })),
      rooms: [...nodeById.values()].filter(n => n.manualRisk || n.manualBlocked).map(n => [n.id, n.manualRisk, 0, n.manualBlocked]),
      help: state.help, helpType: state.helpType, you: +$("hYou").value || null
    }));
  } catch (_) { /* storage unavailable: keep working without it */ }
}
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (_) { d = null; }
  if (!d || d.v !== 1) return;
  loading = true;
  try {
    const okType = t => t === "fire" || t === "security" || t === "medical";
    (d.emergencies || []).forEach(e => {
      if (okType(e.type) && nodeById.has(e.loc) && e.sev >= 1 && e.sev <= 10 && ["PENDING", "HANDLING", "RESOLVED"].includes(e.status))
        emergencies.push({ id: e.id, type: e.type, loc: e.loc, sev: e.sev, status: e.status });
    });
    emSeq = Math.max(d.emSeq || 1, ...emergencies.map(e => e.id + 1), 1);
    // restore the heap array exactly as it was, so the backend's pop order is unchanged
    (d.queue || []).forEach(qid => { const e = emergencies.find(x => x.id === qid && x.status === "PENDING"); if (e && !queue.c.includes(e)) queue.c.push(e); });
    emergencies.filter(e => e.status === "PENDING" && !queue.c.includes(e)).forEach(e => queue.push(e));
    (d.rooms || []).forEach(([id, r, , b]) => { const n = nodeById.get(id); if (n) { n.manualRisk = level(r); n.manualBlocked = !!b; } });
    if (d.you && nodeById.has(d.you)) $("hYou").value = d.you;
    if (okType(d.helpType)) { state.helpType = d.helpType; setHelpType(d.helpType); }
    if (d.help && nodeById.has(d.help.you) && nodeById.has(d.help.at) && okType(d.help.type)) {
      state.help = d.help; $("hYou").value = d.help.you; $("hAt").value = d.help.at === d.help.you ? 0 : d.help.at;
    }
    if (emergencies.some(e => e.status !== "RESOLVED")) toast("Restored the alerts saved in this browser.");
  } finally { loading = false; }
}
