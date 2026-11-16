// Campus RESQ UI · Help tab: personal safest-path guide
"use strict";
/* ---- personal safety guide ---- */
const HELP_SEV = { fire: 8, security: 7, medical: 6 };
const ADVICE = {
  fire: ["Do not use the lifts.", "Close doors behind you to slow the fire. If there is smoke, stay low.", "Once outside, go to the assembly point and wait for a head count."],
  security: ["Move quickly and quietly, away from the threat. Do not go back for belongings.", "Once outside, keep moving away from the building and tell security where you saw the threat."],
  medical: ["Call 112 for an ambulance if the person is unconscious, not breathing, or badly hurt.", "Do not move someone with a possible neck or back injury unless they are in danger."]
};
function startHelp() {
  const you = +$("hYou").value; if (!you) { toast("Choose where you are first."); $("hYou").focus(); return; }
  const at = +$("hAt").value || you, type = state.helpType || "fire";
  // report it (once): reuse an active alert of the same type in the same room
  let e = emergencies.find(x => x.status !== "RESOLVED" && x.type === type && x.loc === at);
  if (!e) { e = { id: emSeq++, type, loc: at, sev: HELP_SEV[type], status: "PENDING" }; emergencies.push(e); queue.push(e); toast(`${TYPE_LABEL[type]} at ${nm(at)} reported to the command view.`, "bad"); }
  state.help = { you, type, at }; state.view = "help";
  applyHazards(emergencies); if (view) view.refresh(emergencies); renderQueue();
  renderHelp(true);
}
function renderHelp(frame) {
  save();
  const h = state.help; if (!h) { $("helpOut").innerHTML = ""; if (view) { view.setRoutes([]); view.setSel(+$("hYou").value || null, null, null); } return; }
  state.view = "help";
  const g = guidePerson(h.you, h.type, h.at), you = nodeById.get(h.you);
  const tips = ADVICE[h.type].slice();
  let html;
  if (!g.route) {
    html = `<div class="guide danger"><span class="band b3"><i></i>NO SAFE WAY OUT</span>
      <p class="go">Stay in ${esc(you.name)}</p>
      <p class="sub">Every way out passes through the ${h.type === "fire" ? "fire" : "danger"} or a lift.</p>
      <ul class="advice"><li>Close the door and block gaps with cloth.</li><li>Call 112 and say you are in ${esc(you.name)} (room ${you.id}).</li><li>Signal from a window if you can. Do not use the lifts.</li></ul></div>`;
    if (view) { view.setRoutes([]); view.setSel(h.you, null, h.at); }
    $("helpOut").innerHTML = html; return;
  }
  const dest = nodeById.get(g.destination), r = g.route, medical = h.type === "medical";
  const already = r.path.length === 1;
  const goText = medical ? (h.at === h.you ? "Stay where you are: help comes to you" : (already ? "You are with the patient" : `Go to ${esc(nm(h.at))} to help`))
                         : (already ? "You are at an exit: go outside" : `Go to ${esc(dest.name)} (room ${dest.id})`);
  const sub = medical ? (h.at === h.you ? "Call 112 and ask anyone nearby to stay with you." : "Someone needs help there.")
                      : "Then walk to the green assembly point outside and wait.";
  const steps = r.path.map((id, i) => {
    const n = nodeById.get(id), b = safetyBand(n.risk);
    const len = i ? ` <span class="tag">+${fmt(adj.get(r.path[i - 1]).find(e => e.to === id).w)} m</span>` : "";
    const risk = i && b > 0 ? ` <span class="tag ${b >= 2 ? "warn" : ""}">${BAND_NAME[b].toLowerCase()}</span>` : "";
    const fchange = i > 0 && floorOf(r.path[i - 1]) !== floorOf(id);
    if (fchange) return `<li class="floorchg">${floorOf(id) < floorOf(r.path[i - 1]) ? "Go down" : "Go up"} the ${esc(nodeById.get(r.path[i - 1]).name.toLowerCase())} to the ${FLOOR_NAME[floorOf(id)].toLowerCase()} (${esc(n.name)})${len}</li>`;
    const label = i === 0 ? `Leave ${esc(n.name)}` : i === r.path.length - 1 ? (medical || /^exit/i.test(n.name) ? `${esc(n.name)} (room ${n.id})` : `${esc(n.name)}, exit`) : esc(n.name);
    return `<li class="${b >= 3 ? "hot" : ""}">${label}${risk}${len}</li>`;
  }).join("");
  let why = "";
  if (g.shortest && g.shortestBand > g.band) {
    const worst = g.shortest.path.slice(1).reduce((m, id) => (nodeById.get(id).risk > nodeById.get(m).risk ? id : m), g.shortest.path[1]);
    why = `<p class="why">The shortest way (${fmt(g.shortest.distance)} m) passes ${esc(nm(worst))}, which is ${BAND_NAME[g.shortestBand].toLowerCase()}. This path avoids it${r.distance > g.shortest.distance ? `, for ${fmt(r.distance - g.shortest.distance)} m more walking` : ""}.</p>`;
  } else if (!medical && !already) why = `<p class="why">This is also the shortest way out.</p>`;
  const lobby = !medical && r.path.slice(1, -1).map(id => nodeById.get(id)).find(n => n.type === "LIFT");
  if (lobby) tips.unshift(`Your path passes the ${lobby.name} lobby: walk past it, do not take the lift.`);
  if (h.type === "security" && g.band >= 2 && h.at !== h.you) tips.unshift(`If you cannot leave without passing near the threat, lock or block the door of ${you.name} and stay out of sight.`);
  if (h.at === h.you && !medical) tips.unshift("You reported the danger here: leave now, do not try to deal with it yourself.");
  html = `<div class="guide ${g.band >= 3 ? "danger" : ""}">
      <span class="band b${g.band}"><i></i>${BAND_NAME[g.band].toUpperCase()} ROUTE</span>
      <p class="go">${goText}</p><p class="sub">${sub}</p>
      ${new Set(r.path.map(floorOf)).size > 1 ? `<p class="why" style="margin-top:0">Floors: ${[...new Set(r.path.map(floorOf))].map(f => FLOOR_NAME[f]).join(" → ")}. Use the stairs, not the lift.</p>` : ""}
      ${already ? "" : `<div class="stats" style="grid-template-columns:repeat(3,1fr)"><div class="stat"><b>${fmt(r.distance)} m</b><span>distance</span></div><div class="stat"><b>${Math.max(1, Math.round(r.distance / WALK))} s</b><span>walking</span></div><div class="stat"><b>${r.hops}</b><span>rooms</span></div></div>
      <ol class="steps">${steps}</ol>`}
      ${why}
      <ul class="advice">${tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="btns"><button class="btn small" data-act="frame">Show on map</button><button class="btn small" data-act="safe">I am safe</button></div></div>`;
  $("helpOut").innerHTML = html;
  if (frame) {
    setFloor(floorOf(h.you), true);
    const floorsOnRoute = [...new Set(r.path.map(floorOf))];
    if (floorsOnRoute.length > 1) toast(`Your path continues on the ${FLOOR_NAME[floorOf(r.path[r.path.length - 1])].toLowerCase()}: switch floors at the top to follow it.`);
  }
  if (view) {
    view.setRoutes(r.path.length > 1 ? [{ path: r.path, color: 0x16c784 }] : []);
    view.setSel(h.you, g.destination, h.at === h.you ? null : h.at);
    if (frame) view.frame([...new Set([...r.path, h.at])]);
  }
}
