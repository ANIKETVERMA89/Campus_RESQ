// Campus RESQ engine · Response plans and the personal safest-path guide (planResponse, guidePerson)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
const EVAC = { a: 1, b: 5, g: 1.5 }, RESPONDER = { a: 1, b: 2, g: 1.5 };
const MAIN_ENTRANCE = 1;                                // only used to draw the main gate on the map

// planResponse
function makePlan(e) {
  const scene = nodeById.get(e.loc);
  const plan = { scene: e.loc, staging: e.loc, entry: null, staged: false, medical: e.type === "medical",
                 evac: bestExit((s, d) => dijkstra(s, d, EVAC), e.loc), responder: null };
  if (!scene || e.type === "fire") return plan;
  const targets = !scene.blocked ? [e.loc] : ADJ.get(e.loc).map(x => x.to).filter(id => nodeById.get(id) && !nodeById.get(id).blocked);
  for (const t of targets)
    for (const door of EXIT_IDS) {
      if (nodeById.get(door).blocked) continue;
      const r = dijkstra(door, t, RESPONDER);
      if (r && (!plan.responder || r.cost < plan.responder.cost)) { plan.responder = r; plan.staging = t; }
    }
  if (plan.responder) plan.entry = plan.responder.path[0];
  plan.staged = scene.blocked && !!plan.responder;
  return plan;
}

// safetyBand / routeBand (start room included, as in the backend) / guidePerson
const BAND_NAME = ["Safe", "Low risk", "Medium risk", "High risk"];
const safetyBand = r => (r < 1 ? 0 : r < 3 ? 1 : r < 6 ? 2 : 3);
const routeBand = r => (r ? Math.max(0, ...r.path.map(id => safetyBand(nodeById.get(id).risk))) : -1);
function findSafestRoute(src, targets, o) {             // the backend's version: lowest Dijkstra cost
  let best = null;
  for (const t of targets) { const r = dijkstra(src, t, o); if (r && (!best || r.cost < best.cost)) best = r; }
  return best;
}
function guidePerson(you, type, at) {
  const empty = { route: null, band: -1, destination: null, shortest: null, shortestBand: -1 };
  if (!nodeById.has(you) || !nodeById.has(at)) return empty;
  const medical = type === "medical";
  const targets = medical ? [at] : exitIds();
  const route = findSafestRoute(you, targets, medical ? { a: 1, b: 2, g: 1.5 } : { a: 1, b: 5, g: 1.5 });
  let shortest = null;
  for (const t of targets) { const r = dijkstra(you, t, { a: 1, b: 0, g: 0 }); if (r && (!shortest || r.cost < shortest.cost)) shortest = r; }
  return { route, band: routeBand(route), destination: route ? route.path[route.path.length - 1] : null, shortest, shortestBand: routeBand(shortest) };
}
