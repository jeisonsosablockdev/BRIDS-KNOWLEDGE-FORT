param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$SessionName,

    [Parameter(Mandatory=$false, Position=1)]
    [string]$BusinessGoal = "Objetivo comercial por definir",

    [Parameter(Mandatory=$false, Position=2)]
    [string]$TargetICP = "Audiencia objetivo por definir"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$VaultInbox = Join-Path $Root "BRIDS-Brain\00 Inbox"
$TemplatePath = Join-Path $Root "BRIDS-Engine\templates\task-tracking-template.json"

# Sanitizar a kebab-case
$Slug = $SessionName.ToLower() -replace '[^a-z0-9-]', '-' -replace '-+', '-'

$Now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$TargetFile = Join-Path $VaultInbox "$Slug.json"

if (-not (Test-Path $VaultInbox)) {
    New-Item -ItemType Directory -Path $VaultInbox -Force | Out-Null
}

$JsonContent = Get-Content -Path $TemplatePath -Raw | ConvertFrom-Json
$JsonContent.session_id = $Slug
$JsonContent.created_at = $Now
$JsonContent.updated_at = $Now
$JsonContent.status = "in_progress"
$JsonContent.intent.raw_prompt = $Slug
$JsonContent.intent.business_goal = $BusinessGoal
$JsonContent.intent.target_icp = $TargetICP

$JsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path $TargetFile -Encoding UTF8

Write-Host "✅ Sesión de tarea inicializada exitosamente en:" -ForegroundColor Green
Write-Host "   $TargetFile" -ForegroundColor Cyan
