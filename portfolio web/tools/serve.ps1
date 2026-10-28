# Horizon Designs — local static dev server (no Node/Python required)
# Usage: powershell -ExecutionPolicy Bypass -File tools/serve.ps1 [port]
$ErrorActionPreference = 'Stop'
$port = if ($args.Count -ge 1) { [int]$args[0] } else { 8080 }
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
  $listener.Start()
} catch {
  Write-Output "FAILED_TO_LISTEN: $($_.Exception.Message)"
  exit 1
}
Write-Output "Serving $root at http://localhost:$port/ (Ctrl+C to stop)"

$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.webp' = 'image/webp'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.gif' = 'image/gif'
  '.woff2' = 'font/woff2'; '.woff' = 'font/woff'
  '.json' = 'application/json'; '.xml' = 'application/xml; charset=utf-8'
  '.txt' = 'text/plain; charset=utf-8'; '.ico' = 'image/x-icon'
  '.map' = 'application/json'
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { continue }

  $reqPath = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
  if ($reqPath -eq '/' -or $reqPath -eq '') { $reqPath = '/index.html' }

  $candidate = Join-Path $root ($reqPath -replace '/', [IO.Path]::DirectorySeparatorChar)
  $full = $null
  try { $full = [IO.Path]::GetFullPath($candidate) } catch { $full = $null }

  if ($full -and $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and
      (Test-Path -LiteralPath $full -PathType Leaf)) {
    try {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
      $ctx.Response.StatusCode = 200
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      if ($ext -eq '.woff2') { $ctx.Response.Headers['Cache-Control'] = 'public, max-age=31536000, immutable' }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      try { $ctx.Response.StatusCode = 500 } catch {}
    }
  } else {
    $ctx.Response.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes('Not found')
    $ctx.Response.ContentType = 'text/plain; charset=utf-8'
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  try { $ctx.Response.Close() } catch {}
}
