$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..\\..")
$Source = Join-Path $Root "MarketingAgentCore\\context\\product-marketing-context.md"
$Target = Join-Path $Root "MarketingAgentStudio\\01 Brand Context\\product-marketing-context.md"

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
