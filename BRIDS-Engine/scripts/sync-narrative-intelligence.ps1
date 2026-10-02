# sync-narrative-intelligence.ps1 - Sincronizador de Inteligencia Narrativa PowerShell Wrapper
# SPEC Reference: agent-reach-brids-integration-protocol.md

[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ScriptArgs
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BashScript = Join-Path $ScriptDir "sync-narrative-intelligence.sh"

if (Get-Command bash -ErrorAction SilentlyContinue) {
    & bash $BashScript @ScriptArgs
} else {
    Write-Warning "Bash is required to execute sync-narrative-intelligence.sh on Windows."
}
