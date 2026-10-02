# test-agent-reach-integration.ps1 - TDD Primal Master Test Suite PowerShell Runner
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TestScript = Join-Path $ScriptDir "test-agent-reach-integration.js"
node $TestScript
