# Script PowerShell para programar la actualización de Inventario Carapacho
# Ejecutar como Administrador

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BatchPath = Join-Path $ScriptDir "actualizar_datos_silencioso.bat"
$TaskName  = "Actualizar_Tablero_Inventario_Carapacho"

Write-Host "Configurando Tarea Programada: $TaskName" -ForegroundColor Cyan

$Action = New-ScheduledTaskAction -Execute $BatchPath -WorkingDirectory $ScriptDir

# Horarios: 07:00, 13:00, 17:00 y 22:00
$Triggers = @(
    (New-ScheduledTaskTrigger -Daily -At "07:00AM"),
    (New-ScheduledTaskTrigger -Daily -At "01:00PM"),
    (New-ScheduledTaskTrigger -Daily -At "05:00PM"),
    (New-ScheduledTaskTrigger -Daily -At "10:00PM")
)

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Triggers -Settings $Settings -User "SYSTEM" -RunLevel Highest -Force

Write-Host "Tarea programada registrada exitosamente en Windows Task Scheduler." -ForegroundColor Green
