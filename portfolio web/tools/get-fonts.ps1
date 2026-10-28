# Downloads Space Grotesk + Manrope woff2 (latin subset) from Google Fonts into assets/fonts (uses curl.exe)
$ErrorActionPreference = 'Stop'
$dest = Join-Path $PSScriptRoot '..\assets\fonts'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
$url = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap'
$cssPath = Join-Path $env:TEMP 'hd-fonts.css'
& curl.exe -s -A $ua -o $cssPath $url
$css = Get-Content -Raw $cssPath

$pattern = '/\*\s*(?<sub>[\w-]+)\s*\*/\s*@font-face\s*\{(?<body>[^}]+)\}'
$manifest = @()
foreach ($m in [regex]::Matches($css, $pattern)) {
    if ($m.Groups['sub'].Value -ne 'latin') { continue }
    $body = $m.Groups['body'].Value
    $family = [regex]::Match($body, "font-family:\s*'(?<f>[^']+)'").Groups['f'].Value
    $weight = [regex]::Match($body, 'font-weight:\s*(?<w>\d+)').Groups['w'].Value
    $src = [regex]::Match($body, 'url\((?<u>[^)]+)\)').Groups['u'].Value
    $name = ($family -replace ' ', '') + '-' + $weight + '-latin.woff2'
    $out = Join-Path $dest $name
    & curl.exe -s -A $ua -o $out $src
    $manifest += [pscustomobject]@{ family = $family; weight = $weight; file = $name; bytes = (Get-Item $out).Length }
}
$manifest | Format-Table -AutoSize | Out-String | Write-Output
Write-Output ("FONTS_DONE " + $manifest.Count)
