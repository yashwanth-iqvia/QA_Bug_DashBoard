# QA Bug Dashboard — Team Sharing Setup
# Run this script as Administrator to allow 5 teammates on the same network/VPN to access the dashboard.

$ErrorActionPreference = "Stop"
$DashboardPort = 5175
$ApiPort = 3001
$RulePrefix = "QA-Bug-Dashboard"

Write-Host "`n=== QA Bug Dashboard — Team Share Setup ===" -ForegroundColor Cyan

# 1. Windows Firewall rules (requires Admin)
function Add-FirewallRuleIfMissing {
    param([string]$Name, [int]$Port)
    $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  Firewall rule already exists: $Name" -ForegroundColor Yellow
        return
    }
    New-NetFirewallRule -DisplayName $Name -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Domain,Private | Out-Null
    Write-Host "  Added firewall rule: $Name (port $Port)" -ForegroundColor Green
}

try {
    Add-FirewallRuleIfMissing -Name "$RulePrefix-Dashboard-$DashboardPort" -Port $DashboardPort
    Add-FirewallRuleIfMissing -Name "$RulePrefix-API-$ApiPort" -Port $ApiPort
} catch {
    Write-Host "`n  WARNING: Could not add firewall rules. Re-run PowerShell as Administrator." -ForegroundColor Red
    Write-Host "  Or manually allow ports $DashboardPort and $ApiPort in Windows Firewall.`n" -ForegroundColor Red
}

# 2. Show team URLs
Write-Host "`n--- Share these URLs with your team (same office network or VPN) ---" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown"
} | Select-Object -ExpandProperty IPAddress -Unique

if ($ips) {
    foreach ($ip in $ips) {
        Write-Host "  http://${ip}:$DashboardPort" -ForegroundColor Green
    }
} else {
    Write-Host "  http://localhost:$DashboardPort (could not detect LAN IP)" -ForegroundColor Yellow
}

Write-Host "`n--- Requirements ---" -ForegroundColor Cyan
Write-Host "  1. Keep this PC on and run: npm run dev"
Write-Host "  2. All 5 teammates must be on IQVIA office network OR connected to VPN"
Write-Host "  3. Do NOT use localhost — that only works on your PC"
Write-Host "  4. Share URL uses port $DashboardPort`n"
