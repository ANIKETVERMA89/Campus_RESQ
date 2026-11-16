# Campus RESQ — Frontend

The web app for the Campus RESQ C++ backend: a campus map, a navigation graph and a 3D view,
with tools to get people to safety (Help), compare routes, dispatch responders, run an
evacuation drill and inspect rooms. All routing logic is a JavaScript port of the C++ backend
and is checked against it automatically (`make test`).

## Run it
Open `index.html` in a browser. No server, no install, no build step.
(Map and Graph work offline; the 3D view and the fonts load from a CDN.)

For deployment there is also a single-file version: `dist/campus-resq.html`.

## Technologies used
| Technology | Used for | Where |
|---|---|---|
| **HTML5** | Page structure, panels, forms, ARIA labels | `index.html` |
| **CSS3** | Theme colours (custom properties), dark/light mode (`prefers-color-scheme`), layout, phone layout (media queries), glass panels (`backdrop-filter`) | `css/` |
| **JavaScript (ES2020)** | Routing engine and all UI logic; no framework | `js/` |
| **SVG** | 2D campus map and node-link graph, drawn from code | `js/views/map2d-svg.js` |
| **three.js r128 (WebGL)** | 3D campus view | `js/views/scene3d-three.js` (library from the cdnjs CDN) |
| **Google Fonts** | Space Grotesk and JetBrains Mono | `index.html` |
| **Web Storage (localStorage)** | Saving alerts, blocked rooms and the open guide in the browser | `js/ui/storage.js` |
| **Python 3** | Build: generate the data file, bundle `dist/` | `../tools/build_frontend.py` |
| **C++ (exporter)** | Export the backend's graph as JSON | `../tools/export_web_data.cpp` |
| **Node.js, Playwright (Chromium)** | Tests: backend–frontend parity, browser end-to-end | `../tests/` |

No UI framework (React, Angular, Vue) and no bundler are used: the app is plain HTML, CSS and
JavaScript, so it opens straight from disk.

## Folder structure
```
frontend/
├── index.html                 page markup; loads the CSS and JS below, in order
├── css/
│   ├── theme.css              colour tokens, dark (default) and light themes
│   ├── layout.css             top bar, tool bar, side panel, tabs
│   ├── components.css         buttons, forms, cards, tables, queue, Help guide, toasts
│   ├── views.css              view/floor switches, 2D map and graph styles, legend
│   └── responsive.css         phone layout, reduced motion
├── js/
│   ├── data/
│   │   └── campus-data.js     GENERATED: rooms + corridors (GRAPH) and the backend export (BACKEND)
│   ├── engine/                port of the C++ backend (src/*.cpp)
│   │   ├── graph.js           CampusGraph: rooms, neighbour order, exits
│   │   ├── routing.js         DijkstraRoute, BFSRoute, findBestExit
│   │   ├── hazards.js         spreadRisk, applyEmergencyHazard
│   │   ├── planner.js         planResponse, safetyBand, guidePerson
│   │   ├── emergency-queue.js EmergencyManager (same order as std::priority_queue)
│   │   └── drill.js           evacuation plan for every room
│   ├── views/
│   │   ├── scene3d-three.js   3D view (three.js)
│   │   └── map2d-svg.js       2D map and graph (SVG)
│   └── ui/
│       ├── state-and-views.js shared helpers, app state, view and floor switching
│       ├── route-panel.js     Route tab
│       ├── alerts-panel.js    Alerts tab
│       ├── drill-panel.js     Drill tab
│       ├── storage.js         save / restore in the browser
│       ├── help-panel.js      Help tab (personal safest path)
│       ├── inspector.js       Inspect tab
│       ├── controller.js      state updates and all event handlers
│       └── main.js            start-up
├── data/
│   ├── backend_graph.json     exported from the C++ backend (`make web-data`)
│   └── presentation.json      display-only data (room type for colours and icons)
└── dist/
    └── campus-resq.html       single-file build of everything above
```

### Why the load order matters
The JS files are classic scripts (not ES modules, which browsers block when a page is opened
from disk). They share one page scope, so each file can use what earlier files define:
`data → engine → views → ui`. Keep that order in `index.html` when adding files.

## Rebuild after changing the backend (from the project root)
    make frontend   # export the graph from the C++ backend, regenerate js/data/campus-data.js and dist/
    make test       # the frontend engine must give exactly the backend's answers

## Integrated C++ API mode

The project root now includes `start.sh` and `run.py`. Run `./start.sh` from the integrated project root and open `http://localhost:8000`. The frontend proxies `/api/*` to the C++ API on port 8080. See the root `README.md` for API endpoints, build instructions and current integration scope. Opening `index.html` directly still works with the original JavaScript fallback, but it will not connect to the C++ API.
