@echo off
setlocal
cd /d "%~dp0"
where g++ >nul 2>nul
if errorlevel 1 (
  echo ERROR: g++ was not found. Add your MinGW-w64 bin folder to PATH.
  echo Example: C:\msys64\mingw64\bin
  exit /b 1
)
if not exist "Campus_RESQ-develop\build" mkdir "Campus_RESQ-develop\build"
set "SRC=Campus_RESQ-develop\src\BFSRoute.cpp Campus_RESQ-develop\src\CampusGraph.cpp Campus_RESQ-develop\src\DijkstraRoute.cpp Campus_RESQ-develop\src\Emergency.cpp Campus_RESQ-develop\src\EmergencyManager.cpp Campus_RESQ-develop\src\FireEmergency.cpp Campus_RESQ-develop\src\MedicalEmergency.cpp Campus_RESQ-develop\src\Planner.cpp Campus_RESQ-develop\src\Route.cpp Campus_RESQ-develop\src\RouteCost.cpp Campus_RESQ-develop\src\SecurityEmergency.cpp"
echo [1/2] Building Campus RESQ C++ HTTP API...
g++ -std=c++17 -O2 -Wall -Wextra -ICampus_RESQ-develop\include Campus_RESQ-develop\api_server.cpp %SRC% -lws2_32 -o Campus_RESQ-develop\build\campus-resq-api.exe
if errorlevel 1 (
  echo ERROR: API compilation failed.
  exit /b 1
)
echo [2/2] Building original C++ CLI...
g++ -std=c++17 -O2 -Wall -Wextra -ICampus_RESQ-develop\include Campus_RESQ-develop\main.cpp %SRC% -o Campus_RESQ-develop\build\campus-resq-cli.exe
if errorlevel 1 (
  echo ERROR: CLI compilation failed.
  exit /b 1
)
echo.
echo Build successful. Executables are in Campus_RESQ-develop\build\
exit /b 0
