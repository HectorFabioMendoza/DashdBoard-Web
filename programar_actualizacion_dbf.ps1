# =============================================================================
# SCRIPT DE CONFIGURACIÓN - AUTOMATIZACIÓN DE ACTUALIZACIÓN DEL DASHBOARD
# Uso: Ejecutar en PowerShell como Administrador en el servidor
# =============================================================================

# 1. Verificar permisos de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Red
    Write-Host " ¡ERROR: SE REQUIEREN PERMISOS DE ADMINISTRADOR!" -ForegroundColor Red
    Write-Host "=========================================================================" -ForegroundColor Red
    Write-Host "Este script crea una tarea programada que requiere privilegios elevados."
    Write-Host "Por favor, abre PowerShell como ADMINISTRADOR e inténtalo de nuevo." -ForegroundColor Yellow
    Write-Host ""
    Exit
}

# 2. Configurar rutas dinámicas basadas en la ubicación del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) {
    $ScriptDir = Get-Location
}
$BatName = "actualizar_datos_dbf_silencioso.bat"
$BatPath = Join-Path $ScriptDir $BatName

Write-Host "Configurando Tarea Programada para el Dashboard..." -ForegroundColor Cyan
Write-Host "Ubicación detectada del proyecto: $ScriptDir"
Write-Host "Script a ejecutar: $BatPath"

if (-not (Test-Path $BatPath)) {
    Write-Host "ERROR: No se encontró el archivo $BatName en $ScriptDir" -ForegroundColor Red
    Write-Host "Asegúrate de que el archivo existe antes de ejecutar este script." -ForegroundColor Yellow
    Exit
}

# 3. Definir los Desencadenadores (Triggers)
# Se requiere actualización automática a: 7:00 AM, 1:00 PM, 5:00 PM y 10:00 PM
Write-Host "Estableciendo desencadenadores diarios..." -ForegroundColor Gray
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "07:00"
$Trigger2 = New-ScheduledTaskTrigger -Daily -At "13:00"
$Trigger3 = New-ScheduledTaskTrigger -Daily -At "17:00"
$Trigger4 = New-ScheduledTaskTrigger -Daily -At "22:00"
$Triggers = @($Trigger1, $Trigger2, $Trigger3, $Trigger4)

# 4. Definir la Acción de la Tarea
# Se indica el archivo .bat y su directorio de trabajo para resolver rutas relativas
$Action = New-ScheduledTaskAction -Execute $BatPath -WorkingDirectory $ScriptDir

# 5. Configurar opciones adicionales (Settings)
# Permitir ejecución si está en batería, arrancar lo antes posible si se pierde un inicio
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)

# 6. Definir el Perfil de Ejecución (Principal)
# Ejecutar como el usuario administrador actual pero con privilegios elevados (Highest)
# para que pueda escribir en C:\inetpub\wwwroot
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest

# 7. Registrar la Tarea en Windows
$TaskName = "Actualizar_Dashboard_JR_DBF"
$Description = "Actualiza los datos del Dashboard Comercial JR desde ERP (DBF) a las 7am, 1pm, 5pm y 10pm."

try {
    Register-ScheduledTask -TaskName $TaskName -Trigger $Triggers -Action $Action -Settings $Settings -Principal $Principal -Description $Description -Force | Out-Null
    
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Green
    Write-Host " ¡TAREA PROGRAMADA REGISTRADA CON ÉXITO!" -ForegroundColor Green
    Write-Host "=========================================================================" -ForegroundColor Green
    Write-Host "Nombre de la Tarea : $TaskName"
    Write-Host "Desencadenadores   : Diario a las 7:00 AM, 1:00 PM, 5:00 PM y 10:00 PM"
    Write-Host "Directorio de Ejec.: $ScriptDir"
    Write-Host "Privilegios        : Ejecutar con la configuración más alta (Administrador)"
    Write-Host ""
    Write-Host "Puedes verificar o probar la tarea abriendo el 'Programador de Tareas'"
    Write-Host "de Windows en el Servidor." -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "Error al registrar la tarea programada: $_" -ForegroundColor Red
}
