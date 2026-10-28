# Vendors Three.js (MIT) for the hero 3D scene
$ErrorActionPreference = 'Stop'
$dest = Join-Path $PSScriptRoot '..\assets\vendor'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$files = @(
    @{ url = 'https://unpkg.com/three@0.160.0/build/three.module.min.js'; out = 'three.module.min.js' },
    @{ url = 'https://unpkg.com/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'; out = 'RoomEnvironment.js' }
)
foreach ($f in $files) {
    $out = Join-Path $dest $f.out
    Invoke-WebRequest -Uri $f.url -OutFile $out
    Write-Output ($f.out + ' -> ' + (Get-Item $out).Length + ' bytes')
}
Write-Output 'VENDOR_DONE'
