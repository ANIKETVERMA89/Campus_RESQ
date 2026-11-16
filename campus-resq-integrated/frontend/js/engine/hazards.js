// Campus RESQ engine · Incident hazards: risk spread and blocked rooms (spreadRisk, applyEmergencyHazard)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
// CampusGraph::spreadRisk — breadth-first by level, risk ADDED (+=), value * decay per hop
function spread(origin, intensity, decay, maxHops) {
  if (!nodeById.has(origin)) return;
  let q = [[origin, intensity]]; const visited = new Set([origin]); let lvl = 0;
  while (q.length && lvl <= maxHops) {
    const next = [];
    for (const [cur, val] of q) {
      const n = nodeById.get(cur); if (n) n.risk += val;
      for (const e of ADJ.get(cur) || []) if (!visited.has(e.to)) { visited.add(e.to); next.push([e.to, val * decay]); }
    }
    q = next; lvl++;
  }
}
// applyEmergencyHazard for every active emergency, in report order, on top of the manual state
let ACTIVE = [];
function applyHazards(emergencies) {
  ACTIVE = emergencies;
  nodeById.forEach(n => { n.risk = n.manualRisk; n.blocked = n.manualBlocked; n.congestion = 0; });
  for (const e of emergencies) {
    if (e.status === "RESOLVED" || !nodeById.has(e.loc)) continue;
    if (e.type === "fire") { nodeById.get(e.loc).blocked = true; spread(e.loc, e.sev, 0.6, 4); }
    else if (e.type === "security") { nodeById.get(e.loc).blocked = true; spread(e.loc, e.sev, 0.5, 3); }
  }
}
function syncState() { applyHazards(ACTIVE); }
