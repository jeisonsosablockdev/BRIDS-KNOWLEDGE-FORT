# audit-narrative-intelligence.ps1 - PowerShell launcher for narrative intelligence audit
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
node "$ScriptDir\audit-narrative-intelligence.js" @args
