// Campus RESQ UI · Start-up: restore state, apply hazards, first render
"use strict";
/* boot */
setMode(mode, true);
if (view && document.fonts && document.fonts.ready) document.fonts.ready.then(() => view.applyTheme());
load();
applyHazards(emergencies); if (view) view.refresh(emergencies);
renderQueue(); renderNode(); renderRoute(); state.view = "help"; renderHelp(false);
