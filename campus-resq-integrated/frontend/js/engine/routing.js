// Campus RESQ engine · Route summaries, Dijkstra, BFS and best exit (DijkstraRoute, BFSRoute, findBestExit)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
// Route summary exactly like the backend: distance = sum of edge weights (first matching edge in
// adjacency order), risk = sum over path[1..] (start room not counted), congestion always 0.
function summarise(path, cost) {
  let units = 0, risk = 0;
  for (let i = 0; i < path.length - 1; i++) {
    risk += nodeById.get(path[i + 1]).risk;
    const e = ADJ.get(path[i]).find(x => x.to === path[i + 1]); units += e.wu;
  }
  return { path, units, distance: units * U, risk, congestion: 0, cost, hops: path.length - 1 };
}
function rebuild(parent, src, dst) { const path = []; let c = dst; while (c !== src) { path.push(c); c = parent.get(c); } path.push(src); return path.reverse(); }

// DijkstraRoute::findRoute — min-heap on (cost, node id); step cost = a*w + b*risk + g*0.
function dijkstra(src, dst, o) {
  o = Object.assign({ a: 1, b: 2, g: 1.5 }, o);
  const s = nodeById.get(src), d = nodeById.get(dst);
  if (!s || !d) return null;
  if (d.blocked && src !== dst) return null;
  const dist = new Map([[src, 0]]), parent = new Map();
  const pq = new Heap((x, y) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1])); pq.push([0, src]);
  while (pq.size) {
    const [cc, cur] = pq.pop();
    if (cc > dist.get(cur)) continue;
    if (cur === dst) break;
    for (const e of ADJ.get(cur) || []) {
      const v = nodeById.get(e.to); if (!v || v.blocked) continue;
      const nc = cc + (o.a * e.wu + o.b * v.risk + o.g * 0);
      if (!dist.has(e.to) || nc < dist.get(e.to)) { dist.set(e.to, nc); parent.set(e.to, cur); pq.push([nc, e.to]); }
    }
  }
  if (!dist.has(dst)) return null;
  return summarise(rebuild(parent, src, dst), dist.get(dst));
}

// BFSRoute::findRoute — fewest hops; total cost = distance.
function bfs(src, dst) {
  const s = nodeById.get(src), d = nodeById.get(dst);
  if (!s || !d) return null;
  if (d.blocked && src !== dst) return null;
  const q = [src], visited = new Set([src]), parent = new Map();
  for (let i = 0; i < q.length; i++) {
    const cur = q[i]; if (cur === dst) break;
    for (const e of ADJ.get(cur) || []) {
      const v = nodeById.get(e.to);
      if (v && !v.blocked && !visited.has(e.to)) { visited.add(e.to); parent.set(e.to, cur); q.push(e.to); }
    }
  }
  if (!visited.has(dst)) return null;
  const r = summarise(rebuild(parent, src, dst), 0); r.cost = r.units; return r;
}

// findBestExit — exits in backend order, strictly lower cost wins
function bestExit(fn, src) {
  let best = null;
  for (const id of EXIT_IDS) { const r = fn(src, id); if (r && (!best || r.cost < best.cost)) best = r; }
  return best;
}
