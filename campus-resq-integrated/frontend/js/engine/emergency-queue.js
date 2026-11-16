// Campus RESQ engine · Alert queue with the same order as std::priority_queue (EmergencyManager)
// Mirrors the C++ backend line by line; verified by `make test`.
"use strict";
// EmergencyManager: std::priority_queue<Emergency*, vector, comp(a,b) = a.sev < b.sev>, using the same
// heap algorithm as libstdc++ (push_heap / pop_heap), so equal severities come out in the same order.
class StdPriorityQueue {
  constructor() { this.c = []; }
  static less(a, b) { return a.sev < b.sev; }
  get size() { return this.c.length; }
  top() { return this.c[0]; }
  _pushHeap(c, hole, topIndex, value) {
    let parent = Math.trunc((hole - 1) / 2);
    while (hole > topIndex && StdPriorityQueue.less(c[parent], value)) { c[hole] = c[parent]; hole = parent; parent = Math.trunc((hole - 1) / 2); }
    c[hole] = value;
  }
  push(x) { this.c.push(x); this._pushHeap(this.c, this.c.length - 1, 0, x); }
  pop() {
    const c = this.c; if (!c.length) return undefined;
    const top = c[0];
    if (c.length > 1) {
      const len = c.length - 1, value = c[len]; c[len] = c[0];
      let hole = 0, second = 0;
      while (second < Math.trunc((len - 1) / 2)) {
        second = 2 * (second + 1);
        if (StdPriorityQueue.less(c[second], c[second - 1])) second--;
        c[hole] = c[second]; hole = second;
      }
      if ((len & 1) === 0 && second === Math.trunc((len - 2) / 2)) { second = 2 * (second + 1); c[hole] = c[second - 1]; hole = second - 1; }
      this._pushHeap(c, hole, 0, value);
    }
    c.pop();
    return top;
  }
  order() { const q = new StdPriorityQueue(); q.c = this.c.slice(); const out = []; while (q.size) out.push(q.pop()); return out; }
}
