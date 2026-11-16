$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$apiPort = if ($env:API_PORT) { [int]$env:API_PORT } else { 8080 }
$frontendPort = if ($env:FRONTEND_PORT) { [int]$env:FRONTEND_PORT } else { 8000 }
$apiExe = Join-Path $PSScriptRoot 'Campus_RESQ-develop\build\campus-resq-api.exe'
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) { $pythonCommand = Get-Command py -ErrorAction SilentlyContinue }
if (-not $pythonCommand) { throw 'Python 3 was not found. Install Python 3 and add python.exe or py.exe to PATH.' }

Write-Host 'Building Campus RESQ with MinGW/g++...'
& (Join-Path $PSScriptRoot 'build_windows.bat')
if ($LASTEXITCODE -ne 0) { throw 'Build failed. Check the compiler output above.' }

$apiProcess = $null
try {
    Write-Host "Starting C++ API on port $apiPort..."
    $apiProcess = Start-Process -FilePath $apiExe -ArgumentList "$apiPort" -PassThru -NoNewWindow
    Start-Sleep -Seconds 1
    if ($apiProcess.HasExited) { throw "C++ API stopped during startup. Check whether port $apiPort is already in use." }

    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$apiPort/api/health" -TimeoutSec 3
        if (-not $health.ok) { throw 'API health check returned an unexpected response.' }
    } catch {
        throw "C++ API health check failed: $($_.Exception.Message)"
    }

    $env:API_PORT = "$apiPort"
    $env:FRONTEND_PORT = "$frontendPort"
    Write-Host "C++ API is healthy. Starting frontend at http://localhost:$frontendPort"
    Write-Host 'Keep this window open. Press Ctrl+C to stop both services.'
    if ($pythonCommand.Name -eq 'py.exe' -or $pythonCommand.Name -eq 'py') { & $pythonCommand.Source -3 .\run.py } else { & $pythonCommand.Source .\run.py }
} finally {
    if ($apiProcess -and -not $apiProcess.HasExited) {
        Write-Host 'Stopping C++ API...'
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
