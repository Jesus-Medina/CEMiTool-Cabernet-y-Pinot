# DEPLOYAR_WORKER_WINDOWS.ps1
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$storeFile = (Resolve-Path (Join-Path $scriptDir "..\indexer\.file-search-store") -ErrorAction Stop).Path
$storeName = (Get-Content $storeFile -Raw).Trim()

if (-not $storeName) {
    throw "El archivo .file-search-store está vacío. Ejecuta primero el indexador."
}

Write-Host ""
Write-Host "=== CEMiTool: despliegue del Worker ===" -ForegroundColor Cyan
Write-Host ""

Push-Location $scriptDir
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Instalando Wrangler..." -ForegroundColor Yellow
        npm install --no-audit --no-fund
    }

    Write-Host ""
    Write-Host "Se abrirá el login de Cloudflare si aún no has iniciado sesión." -ForegroundColor Yellow
    npx wrangler login

    Write-Host ""
    $secure = Read-Host "Pega tu GEMINI_API_KEY (no se mostrará)" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)

        Write-Host "Guardando GEMINI_API_KEY como secreto del Worker..." -ForegroundColor Yellow
        $plain | npx wrangler secret put GEMINI_API_KEY

        Write-Host "Guardando GEMINI_FILE_SEARCH_STORE como secreto del Worker..." -ForegroundColor Yellow
        $storeName | npx wrangler secret put GEMINI_FILE_SEARCH_STORE
    }
    finally {
        if ($ptr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
        }
        $plain = $null
    }

    Write-Host ""
    Write-Host "Desplegando..." -ForegroundColor Cyan
    npm run deploy

    Write-Host ""
    Write-Host "LISTO. Copia la URL workers.dev mostrada arriba." -ForegroundColor Green
    Write-Host "Luego crea la variable de GitHub VITE_CHAT_API_URL con esa URL." -ForegroundColor Green
}
finally {
    Pop-Location
}

Read-Host "Presiona ENTER para cerrar"
