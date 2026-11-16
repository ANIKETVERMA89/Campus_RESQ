// Campus RESQ engine · Evacuation plan for every room (drill)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
// Evacuation plan for every room (the backend has no congestion, so no crowd feedback)
const OCC = { CLASS: 40, LAB: 30, HALL: 50, OFFICE: 8, ROOM: 5, TOILET: 3 };
const WALK = 1.4, FLOW = 1.5;                           // m/s walking, persons/s through a doorway (illustrative)
function planDrill() {
  const groups = GRAPH.nodes.filter(n => OCC[n.type]).map(n => ({ id: n.id, name: n.name, people: OCC[n.type] }))
    .sort((a, b) => b.people - a.people || a.id - b.id);
  const transit = new Map(), exitLoad = new Map(), rows = []; let stranded = 0;
  for (const g of groups) {
    const r = bestExit((s, d) => dijkstra(s, d, EVAC), g.id);
    if (!r) { stranded += g.people; continue; }
    r.path.slice(1).forEach(id => transit.set(id, (transit.get(id) || 0) + g.people));
    const ex = r.path[r.path.length - 1];
    exitLoad.set(ex, (exitLoad.get(ex) || 0) + g.people);
    rows.push({ g, route: r, exit: ex });
  }
  let est = 0, distSum = 0;
  for (const row of rows) {
    const delay = Math.max(0, ...row.route.path.slice(1).map(id => (transit.get(id) || 0) / FLOW));
    row.time = row.route.distance / WALK + delay; est = Math.max(est, row.time); distSum += row.route.distance;
  }
  return { rows, stranded, exitLoad, est, peakExit: Math.max(0, ...exitLoad.values()), peakTransit: Math.max(0, ...transit.values()),
           avgDist: rows.length ? distSum / rows.length : 0, exitsUsed: exitLoad.size };
}
