$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\\..")
$TargetDir = Join-Path $Root "BRIDS-Brain\\02 Marketing\\01 Contexto de Marca"
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}
$Target = Join-Path $TargetDir "product-marketing-context.md"

if (Test-Path $Target -PathType Leaf) {
    $Item = Get-Item $Target -Force
    if ($Item.LinkType) {
        Write-Output "Brand context is already linked:"
        Write-Output $Item.FullName
        exit 0
    }
}

Copy-Item -Force $Source $Target
Write-Output "Copied brand context into vault:"
Write-Output "  $Target"
