# PowerShell script to vendor Mediapipe JS/WASM files into frontend/vendor/mediapipe
# Usage: from repo root run: pwsh .\scripts\vendor_mediapipe.ps1
# This will install the packages, copy necessary files into frontend/vendor/mediapipe,
# and then remove the temporary node_modules it created.

$ErrorActionPreference = 'Stop'
$vendorDir = "frontend/vendor/mediapipe"
$tempDir = "vendor_tmp"

Write-Host "Creating vendor directory: $vendorDir"
New-Item -ItemType Directory -Force -Path $vendorDir | Out-Null

# Initialize a temporary npm project and install packages
if (-Not (Test-Path "$pwd\package.json")) {
  Write-Host "Initializing temporary npm project in $pwd"
  npm init -y | Out-Null
  $createdPackageJson = $true
}

Write-Host "Installing @mediapipe/face_mesh and @mediapipe/camera_utils"
npm install @mediapipe/face_mesh @mediapipe/camera_utils --no-audit --no-fund | Out-Null

# Copy files from node_modules to vendor directory
$faceMeshPkg = Join-Path "node_modules" "@mediapipe\face_mesh"
$cameraUtilsPkg = Join-Path "node_modules" "@mediapipe\camera_utils"

if (-Not (Test-Path $faceMeshPkg)) { throw "Could not find $faceMeshPkg" }
if (-Not (Test-Path $cameraUtilsPkg)) { throw "Could not find $cameraUtilsPkg" }

Write-Host "Copying face_mesh package files..."
Get-ChildItem -Path $faceMeshPkg -File | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $vendorDir -Force
}

Write-Host "Copying camera_utils package files..."
Get-ChildItem -Path $cameraUtilsPkg -File | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $vendorDir -Force
}

Write-Host "Vendor files copied to $vendorDir"

Write-Host "Cleaning up installed node_modules and package files created by this script"
Remove-Item -Recurse -Force node_modules package-lock.json 2>$null | Out-Null
if ($createdPackageJson) { Remove-Item -Force package.json 2>$null | Out-Null }

Write-Host "Done. Place the $vendorDir folder under version control and deploy to Vercel."
