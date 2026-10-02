# narrative-radar.ps1 - BRIDS Narrative & Rumor Intelligence PowerShell Wrapper
# SPEC Reference: agent-reach-brids-integration-protocol.md

[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ScriptArgs
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BashScript = Join-Path $ScriptDir "narrative-radar.sh"

if (Get-Command bash -ErrorAction SilentlyContinue) {
    & bash $BashScript @ScriptArgs
} else {
    Write-Warning "Bash is required to execute narrative-radar.sh on Windows."
}
