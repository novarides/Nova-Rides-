# Push Nova Rides to GitHub (https://github.com/novarides/Nova-Rides-.git)
# Run from ANY folder in PowerShell:
#   & "C:\Users\dieko\NOVA RIDES 2\push-to-github.ps1"
# Or first cd to project:  cd "C:\Users\dieko\NOVA RIDES 2"  then:  .\push-to-github.ps1

$ErrorActionPreference = "Stop"
# Switch to the folder where this script lives (works even when run with full path)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH. Install Git from https://git-scm.com/"
    exit 1
}

if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..."
    git init
    git remote add origin https://github.com/novarides/Nova-Rides-.git
} else {
    $rem = git remote get-url origin 2>$null
    if (-not $rem) {
        git remote add origin https://github.com/novarides/Nova-Rides-.git
    } elseif ($rem -ne "https://github.com/novarides/Nova-Rides-.git") {
        git remote set-url origin https://github.com/novarides/Nova-Rides-.git
    }
}

Write-Host "Staging all files..."
git add .
Write-Host "Committing..."
git commit -m "Initial commit: Nova Rides car sharing platform" 2>$null
if ($LASTEXITCODE -ne 0) {
    git status
    Write-Host "Nothing to commit, or commit already exists. Pushing..."
} else {
    Write-Host "Commit created."
}
git branch -M main
Write-Host "Pushing to origin main..."
git push -u origin main
Write-Host "Done. Your project is at https://github.com/novarides/Nova-Rides-"
Write-Host "Add env vars in Vercel and redeploy if needed."
