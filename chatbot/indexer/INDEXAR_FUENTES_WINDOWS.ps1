# INDEXAR_FUENTES_WINDOWS.ps1
# Ejecutar desde cualquier ubicación dentro del repo.
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
$venv = Join-Path $scriptDir ".venv"
$python = Join-Path $venv "Scripts\python.exe"

Write-Host ""
Write-Host "=== CEMiTool: indexación Gemini File Search ===" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"
Write-Host ""

if (-not (Test-Path $python)) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv $venv
}

Write-Host "Instalando/actualizando dependencia google-genai..." -ForegroundColor Yellow
& $python -m pip install --disable-pip-version-check -r (Join-Path $scriptDir "requirements.txt")

$secure = Read-Host "Pega tu GEMINI_API_KEY (no se mostrará)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    $env:GEMINI_API_KEY = $plain

    Write-Host ""
    Write-Host "Indexando fuentes canónicas..." -ForegroundColor Cyan
    & $python (Join-Path $scriptDir "index_sources.py") --repo-root $repoRoot

    if ($LASTEXITCODE -ne 0) {
        throw "El indexador terminó con código $LASTEXITCODE"
    }
}
finally {
    if ($ptr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    $plain = $null
}

$storeFile = Join-Path $scriptDir ".file-search-store"
if (Test-Path $storeFile) {
    Write-Host ""
    Write-Host "LISTO." -ForegroundColor Green
    Write-Host "Store creado:"
    Get-Content $storeFile
    Write-Host ""
    Write-Host "Siguiente paso: ejecutar chatbot\worker\DEPLOYAR_WORKER_WINDOWS.ps1"
} else {
    Write-Host "No se encontró .file-search-store. Revisa los mensajes anteriores." -ForegroundColor Red
}

Read-Host "Presiona ENTER para cerrar"
