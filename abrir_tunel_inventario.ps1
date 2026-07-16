# Abre el tunel de Cloudflare para Inventario Distribuidora JR y muestra el enlace publico.
# Debe correr EN EL SERVIDOR (no en una PC remota), porque el tunel solo puede
# reenviar trafico hacia una direccion que el mismo pueda alcanzar por red.

$cloudflaredPath = "C:\cloudflared\cloudflared.exe"
$targetUrl = "http://localhost:8081"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host ""
    Write-Host "ERROR: No se encontro cloudflared.exe en $cloudflaredPath" -ForegroundColor Red
    Write-Host "Verifica la ruta o descarga el binario segun el manual de despliegue." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "==================================================="  -ForegroundColor Cyan
Write-Host "  ABRIENDO TUNEL - INVENTARIO DISTRIBUIDORA JR"        -ForegroundColor Cyan
Write-Host "==================================================="  -ForegroundColor Cyan
Write-Host ""
Write-Host "Conectando con Cloudflare, por favor espera..." -ForegroundColor Cyan
Write-Host ""

$found = $false

& $cloudflaredPath tunnel --url $targetUrl 2>&1 | ForEach-Object {
    Write-Host $_

    if (-not $found -and $_ -match "https://[a-zA-Z0-9\-]+\.trycloudflare\.com") {
        $found = $true
        $tunnelUrl = $matches[0]
        Set-Clipboard -Value $tunnelUrl

        Write-Host ""
        Write-Host "==================================================="  -ForegroundColor Green
        Write-Host "  ENLACE LISTO (ya copiado al portapapeles):"           -ForegroundColor Green
        Write-Host ""
        Write-Host "  $tunnelUrl" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Compartelo por WhatsApp/correo o genera un QR."       -ForegroundColor Green
        Write-Host "  Presiona Ctrl+C en esta ventana para CERRAR el tunel." -ForegroundColor Magenta
        Write-Host "==================================================="  -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Tunel cerrado." -ForegroundColor Red
