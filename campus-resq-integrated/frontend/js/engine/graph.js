// Campus RESQ engine · Graph model built from the backend export: rooms, ordered adjacency, exits, helpers (CampusGraph)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
const U = BACKEND.metresPerUnit;                       // backend weights are units; the UI shows metres

const nodeById = new Map(GRAPH.nodes.map(n => [n.id, Object.assign({}, n, {
  risk: 0, congestion: 0, blocked: false, manualRisk: 0, manualCong: 0, manualBlocked: false
})]));
const ADJ = new Map(BACKEND.nodes.map(n => [n.id, n.adj.map(([to, w]) => ({ to, wu: w }))]));   // backend order, units
const adj = new Map(BACKEND.nodes.map(n => [n.id, n.adj.map(([to, w]) => ({ to, w: w * U }))])); // metres, for display
const EXIT_IDS = BACKEND.exits.slice();                 // CampusGraph::getExitIds(): names containing "Exit"
const isExit = n => EXIT_IDS.includes(n.id);
const exitIds = () => EXIT_IDS.slice();
const isLift = n => n.type === "LIFT";
const isLiftRide = () => false;                         // the backend has no lift rule
const floorOf = id => nodeById.get(id).floor || 0;
const FLOOR_NAME = ["Ground floor", "First floor"], FLOOR_SHORT = ["G", "1F"];
const FLOORS = [...new Set(GRAPH.nodes.map(n => n.floor || 0))].sort();
const level = v => (!(v > 0) ? 0 : v > 10 ? 10 : v);    // UI input sanitising only (sliders, saved data)

class Heap {                                            // binary heap, `less(a,b)` => a comes out first
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  push(v) { const a = this.a; a.push(v); let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  pop() { const a = this.a; if (!a.length) return undefined; const top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0;
      for (;;) { let l = 2 * i + 1, r = l + 1, m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l; if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } }
    return top; }
}
