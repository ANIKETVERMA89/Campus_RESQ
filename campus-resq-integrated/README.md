# Campus RESQ — integrated frontend + C++ API

This project combines the supplied Campus RESQ browser frontend with the supplied C++ graph, routing, emergency and response-planning code. The browser UI remains plain HTML/CSS/JavaScript; route calculations and dispatched response-map routes are requested from the C++ service over HTTP. The original JavaScript engine remains as an offline fallback if the C++ API is not running.

## Requirements

- Linux or macOS (or Windows using WSL2)
- `g++` with C++17 support
- `make`
- Python 3.8+
- A modern browser

No third-party C++ libraries or Python packages are required.

## Run the complete app

From the extracted `campus-resq-integrated` folder:

```bash
./start.sh
```

Then open **http://localhost:8000**.

The launcher compiles and starts the C++ API on port `8080`, then starts the frontend server on port `8000`. The frontend server proxies `/api/*` requests to the C++ service, so the browser does not need CORS configuration. If either port is occupied, set `API_PORT` or `FRONTEND_PORT`, for example `API_PORT=18080 FRONTEND_PORT=18000 ./start.sh`. Press `Ctrl+C` in the terminal to stop both.

If the script is not executable:

```bash
chmod +x start.sh
./start.sh
```

### Start the services separately

Terminal 1 — build and run C++ API:

```bash
make -C Campus_RESQ-develop api
./Campus_RESQ-develop/build/campus-resq-api 8080
```

Terminal 2 — frontend and API proxy:

```bash
python3 run.py
```

## C++ API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service health/version |
| GET | `/api/graph` | Graph exported by the C++ `CampusGraph` |
| GET | `/api/route?from=1&to=4&algorithm=dijkstra` | C++ Dijkstra route |
| GET | `/api/route?from=1&to=0&algorithm=bfs` | BFS route to the best exit (`to=0`) |
| GET | `/api/plan?type=fire&loc=10&severity=8` | C++ evacuation/responder response plan |

Optional route parameters: `evac=1`, `a`, `b`, `g`, and `hazards`. `hazards` is a comma-separated list such as `fire:10:8,security:20:6`. Each API request constructs a fresh campus graph and replays the supplied active fire/security hazards before calculating the route; this prevents one browser request from leaking hazard state into another.

Quick health check:

```bash
curl http://localhost:8080/api/health
```

## What is connected

- **Route tab:** Dijkstra, BFS and compare requests use the C++ API. The frontend's JS engine is used immediately while the request is pending and remains the fallback when the API is unavailable.
- **Emergency dispatch map:** `showPlan()` requests the C++ `/api/plan` result and updates the displayed evacuation and responder paths. The JS plan is used as an immediate fallback.
- **Graph source:** `/api/graph` exports the C++ graph. The frontend's bundled `BACKEND` data is the matching export supplied with the original frontend.
- **Emergency hazards:** active fire/security alerts are sent with route requests and replayed against a fresh C++ graph. Medical incidents do not block or spread risk, matching the original backend's `applyEmergencyHazard` behavior.

## Project layout

```text
campus-resq-integrated/
├── frontend/                 Original browser application
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── data/
│   └── dist/
├── Campus_RESQ-develop/      Original C++ project plus HTTP API adapter
│   ├── include/
│   ├── src/
│   ├── api_server.cpp
│   ├── main.cpp               Original CLI program
│   └── Makefile
├── run.py                    Static frontend server + /api proxy
├── start.sh                  Linux/macOS launcher
├── build_windows.bat         MinGW build script
├── start_windows.bat         Windows launcher
└── start_windows.ps1         Windows process manager + health check
```

## Notes / current scope

- The C++ API uses the 36-node ground-floor graph supplied in `ground.h` and `backend_graph.json`.
- The original frontend includes its own local UI state and fallback engine. Routing and the dispatch-map plan are connected to C++; the personal Help guide, drill simulation, and alert queue UI still use their existing JavaScript implementations.
- The API server supports POSIX sockets on Linux/macOS and Winsock2 on Windows. Windows builds link against `ws2_32` through `build_windows.bat`.
- The map is schematic, not to scale. This is a prototype and should not be treated as a certified emergency-response or life-safety system.
- The 3D view loads Three.js and fonts from CDNs; the 2D map and graph are local.

## Smoke test

After the first build, run `./smoke_test.sh` to verify the frontend server, API proxy, route endpoint and response-plan endpoint. The script uses ports 18080 and 18000 by default; override them with `API_PORT` and `FRONTEND_PORT` if needed.

## Original CLI mode

The original interactive C++ console app is preserved:

```bash
make -C Campus_RESQ-develop cli
./Campus_RESQ-develop/build/campus-resq-cli
```
