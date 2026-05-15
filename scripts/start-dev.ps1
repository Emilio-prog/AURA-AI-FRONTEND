#requires -Version 5.1
<#
.SYNOPSIS
  Arranca backend (Spring Boot, SERVER_PORT o :8080) y frontend (Vite, :5173) en ventanas separadas.
  Espera a que respondan y abre el navegador en http://localhost:5173.
  Si alguno ya está corriendo lo detecta y no lo duplica.

.EXAMPLE
  .\start-dev.ps1
  .\start-dev.ps1 -StripeWebhook  # Tambien reenvia webhooks Stripe a local
  .\start-dev.ps1 -Stop           # Detiene backend y frontend
#>

param(
    [switch]$Stop,
    [switch]$StripeWebhook
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent (Split-Path -Parent $scriptDir)
$beDir = Join-Path $root 'AURA-AI-BACKEND'
$feDir = Join-Path $root 'AURA-AI-FRONTEND'
$frontendUrl = 'http://localhost:5173'
$stripeWebhookEvents = 'checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed'
$stripeWebhookPath = '/api/v1/webhooks/stripe'
$stripeDockerName = 'aura-stripe-listener'
$stripeDockerProbeName = 'aura-stripe-secret-probe'

function Get-PortOwner($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) { return [int]$conn.OwningProcess }
    return $null
}

function Stop-Port($port, $name) {
    $procId = Get-PortOwner $port
    if ($procId) {
        Write-Host "Stopping $name on :$port (PID $procId)" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    } else {
        Write-Host "$name on :$port already stopped" -ForegroundColor DarkGray
    }
}

function Read-EnvFileValue($path, $key) {
    if (-not (Test-Path $path)) { return $null }

    $escapedKey = [regex]::Escape($key)
    $line = Get-Content -Path $path |
        Where-Object { $_ -match "^\s*$escapedKey\s*=" } |
        Select-Object -Last 1

    if (-not $line) { return $null }

    $value = ($line -split '=', 2)[1].Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
    } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    return $value
}

function Import-EnvFile($path) {
    if (-not (Test-Path $path)) { return }

    Get-Content -Path $path | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { return }
        $parts = $line -split '=', 2
        if ($parts.Length -ne 2) { return }
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        if (-not [string]::IsNullOrWhiteSpace($key)) {
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

function Get-EnvValue($key) {
    $value = [Environment]::GetEnvironmentVariable($key)
    if (-not [string]::IsNullOrWhiteSpace($value)) { return $value }
    return Read-EnvFileValue (Join-Path $beDir '.env') $key
}

function Resolve-BackendPort() {
    $configured = Get-EnvValue 'SERVER_PORT'
    $port = 8080
    if (-not [string]::IsNullOrWhiteSpace($configured) -and [int]::TryParse($configured, [ref]$port)) {
        return $port
    }
    return 8080
}

function Get-CommandSource($name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Test-HttpReady($url) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Wait-HttpReady($name, $url, $timeoutSeconds) {
    Write-Host "Waiting for $name at $url ..." -ForegroundColor DarkGray
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-HttpReady $url) {
            Write-Host "$name is ready" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
    }
    Write-Warning "$name did not respond at $url within ${timeoutSeconds}s."
    return $false
}

function Open-DevBrowser($url) {
    try {
        Start-Process $url
        Write-Host "Browser opened at $url" -ForegroundColor Green
    } catch {
        Write-Warning "Could not open the browser automatically. Open this URL manually: $url"
    }
}

function Resolve-StripeRunner() {
    $localStripePath = Join-Path $root 'tools\stripe-cli\stripe.exe'
    if (Test-Path $localStripePath) {
        return @{ Type = 'cli'; FilePath = $localStripePath }
    }

    $stripePath = Get-CommandSource 'stripe'
    if ($stripePath) {
        return @{ Type = 'cli'; FilePath = $stripePath }
    }

    $dockerPath = Get-CommandSource 'docker'
    if ($dockerPath) {
        return @{ Type = 'docker'; FilePath = $dockerPath }
    }

    return $null
}

function Get-StripeCliSecret($runner) {
    $outFile = New-TemporaryFile
    $errFile = New-TemporaryFile
    $process = $null

    if ($runner.Type -eq 'cli') {
        $process = Start-Process -FilePath $runner.FilePath `
            -ArgumentList 'listen', '--print-secret' `
            -RedirectStandardOutput $outFile.FullName `
            -RedirectStandardError $errFile.FullName `
            -WindowStyle Hidden `
            -PassThru
    } else {
        $process = Start-Process -FilePath $runner.FilePath `
            -ArgumentList 'run', '--rm', '--name', $stripeDockerProbeName, '-e', 'STRIPE_API_KEY', 'stripe/stripe-cli', 'listen', '--print-secret' `
            -RedirectStandardOutput $outFile.FullName `
            -RedirectStandardError $errFile.FullName `
            -WindowStyle Hidden `
            -PassThru
    }

    try {
        $deadline = (Get-Date).AddSeconds(25)
        while ((Get-Date) -lt $deadline) {
            $output = ''
            if (Test-Path $outFile.FullName) { $output += Get-Content -Raw -Path $outFile.FullName -ErrorAction SilentlyContinue }
            if (Test-Path $errFile.FullName) { $output += "`n" + (Get-Content -Raw -Path $errFile.FullName -ErrorAction SilentlyContinue) }

            $match = [regex]::Match($output, 'whsec_[A-Za-z0-9_]+')
            if ($match.Success) {
                return $match.Value
            }

            if ($process.HasExited) { break }
            Start-Sleep -Milliseconds 500
        }

        $errorText = Get-Content -Raw -Path $errFile.FullName -ErrorAction SilentlyContinue
        Write-Warning "Stripe CLI no devolvio un whsec_ reconocible."
        if (-not [string]::IsNullOrWhiteSpace($errorText)) {
            Write-Host $errorText -ForegroundColor DarkYellow
        }
        return $null
    } finally {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        if ($runner.Type -eq 'docker') {
            $dockerPath = $runner.FilePath
            & $dockerPath stop $stripeDockerProbeName 2>$null | Out-Null
        }
        Remove-Item -LiteralPath $outFile.FullName -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $errFile.FullName -Force -ErrorAction SilentlyContinue
    }
}

function Test-StripeCliListenerRunning() {
    try {
        $items = Get-CimInstance Win32_Process -Filter "name = 'stripe.exe'" -ErrorAction Stop
        return [bool]($items | Where-Object { $_.CommandLine -like "*$stripeWebhookPath*" } | Select-Object -First 1)
    } catch {
        return $false
    }
}

function Test-StripeDockerListenerRunning($dockerPath) {
    try {
        $items = & $dockerPath ps --filter "name=$stripeDockerName" --format '{{.Names}}' 2>$null
        return [bool]($items | Where-Object { $_ -eq $stripeDockerName } | Select-Object -First 1)
    } catch {
        return $false
    }
}

function Start-StripeWebhookForwarder($runner) {
    if ($runner.Type -eq 'cli') {
        if (Test-StripeCliListenerRunning) {
            Write-Host "Stripe webhook listener already running" -ForegroundColor Green
            return
        }

        Start-Process -FilePath $runner.FilePath `
            -ArgumentList 'listen', '--events', $stripeWebhookEvents, '--forward-to', "$backendUrl$stripeWebhookPath" `
            -WindowStyle Hidden
        return
    }

    if (Test-StripeDockerListenerRunning $runner.FilePath) {
        Write-Host "Stripe webhook listener already running in Docker" -ForegroundColor Green
        return
    }

    Start-Process -FilePath $runner.FilePath `
        -ArgumentList 'run', '--rm', '--name', $stripeDockerName, '-e', 'STRIPE_API_KEY', 'stripe/stripe-cli', 'listen', '--events', $stripeWebhookEvents, '--forward-to', "http://host.docker.internal:$backendPort$stripeWebhookPath" `
        -WindowStyle Hidden
}

function Stop-StripeDockerListener() {
    $dockerPath = Get-CommandSource 'docker'
    if (-not $dockerPath) { return }

    try {
        $running = & $dockerPath ps --filter "name=$stripeDockerName" --format '{{.Names}}' 2>$null
        if ($running -contains $stripeDockerName) {
            Write-Host "Stopping Stripe webhook listener Docker container" -ForegroundColor Yellow
            & $dockerPath stop $stripeDockerName | Out-Null
        }
    } catch {
        Write-Host "Stripe webhook listener was not stopped automatically" -ForegroundColor DarkYellow
    }
}

function Stop-StripeCliListener() {
    try {
        $items = Get-CimInstance Win32_Process -Filter "name = 'stripe.exe'" -ErrorAction Stop |
            Where-Object { $_.CommandLine -like "*$stripeWebhookPath*" }
        foreach ($item in $items) {
            Write-Host "Stopping Stripe webhook listener (PID $($item.ProcessId))" -ForegroundColor Yellow
            Stop-Process -Id $item.ProcessId -Force -ErrorAction SilentlyContinue
        }
    } catch {
        return
    }
}

function Enable-StripeWebhookLocal() {
    $stripeSecretKey = Get-EnvValue 'STRIPE_SECRET_KEY'
    if ([string]::IsNullOrWhiteSpace($stripeSecretKey)) {
        Write-Warning "STRIPE_SECRET_KEY no esta configurada en AURA-AI-BACKEND\.env ni en el entorno."
        Write-Host "Checkout puede abrir, pero los webhooks locales no se reenviaran." -ForegroundColor DarkYellow
        return $null
    }

    $runner = Resolve-StripeRunner
    if (-not $runner) {
        Write-Warning "No se encontro Stripe CLI ni Docker."
        Write-Host "Instala Stripe CLI o deja Docker Desktop activo y vuelve a ejecutar: .\start-dev.ps1 -StripeWebhook" -ForegroundColor DarkYellow
        return $null
    }

    $env:STRIPE_API_KEY = $stripeSecretKey
    $webhookSecret = Get-StripeCliSecret $runner
    if ([string]::IsNullOrWhiteSpace($webhookSecret)) { return $null }

    $env:STRIPE_WEBHOOK_SECRET = $webhookSecret
    Write-Host "Stripe webhook secret local cargado para este arranque del backend." -ForegroundColor Green
    return $runner
}

$backendPort = Resolve-BackendPort
$backendUrl = "http://localhost:$backendPort"
$backendHealthUrl = "$backendUrl/actuator/health"

if ($Stop) {
    Stop-Port $backendPort 'Backend'
    if ($backendPort -ne 8080) {
        Stop-Port 8080 'Backend default'
    }
    Stop-Port 5173 'Vite'
    Stop-StripeCliListener
    Stop-StripeDockerListener
    return
}

$stripeRunner = $null
if ($StripeWebhook) {
    $stripeRunner = Enable-StripeWebhookLocal
}

Import-EnvFile (Join-Path $beDir '.env')
if ((Get-EnvValue 'SOS_SMS_ENABLED') -eq 'true') {
    $twilioMissing = @('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER') |
        Where-Object { [string]::IsNullOrWhiteSpace((Get-EnvValue $_)) }
    if ($twilioMissing.Count -gt 0) {
        Write-Warning "SOS_SMS_ENABLED=true pero faltan variables Twilio: $($twilioMissing -join ', '). El backend fallara al arrancar."
    }
}

# Backend
$bePid = Get-PortOwner $backendPort
if ($bePid) {
    Write-Host "Backend already running on :$backendPort (PID $bePid)" -ForegroundColor Green
    if ($StripeWebhook) {
        Write-Host "Reinicia el backend con .\start-dev.ps1 -Stop y luego .\start-dev.ps1 -StripeWebhook para que cargue el whsec local." -ForegroundColor DarkYellow
    }
} else {
    if ($backendPort -ne 8080) {
        Write-Warning "AURA-AI-BACKEND\.env configura SERVER_PORT=$backendPort. El backend usara $backendUrl. Para usar el default documentado, cambia SERVER_PORT=8080 o elimina esa linea."
    }
    Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Cyan
    Start-Process -FilePath "$beDir\mvnw.cmd" `
        -ArgumentList 'spring-boot:run' `
        -WorkingDirectory $beDir `
        -WindowStyle Normal
}

# Frontend
$fePid = Get-PortOwner 5173
if ($fePid) {
    Write-Host "Vite already running on :5173 (PID $fePid)" -ForegroundColor Green
} else {
    Write-Host "Starting Frontend (Vite)..." -ForegroundColor Cyan
    Start-Process -FilePath 'npm.cmd' `
        -ArgumentList 'run', 'dev', '--', '--host', 'localhost', '--port', '5173', '--strictPort' `
        -WorkingDirectory $feDir `
        -WindowStyle Normal
}

if ($StripeWebhook -and $stripeRunner) {
    Start-StripeWebhookForwarder $stripeRunner
}

$backendReady = Wait-HttpReady 'Backend' $backendHealthUrl 90
$frontendReady = Wait-HttpReady 'Frontend' $frontendUrl 45
if ($frontendReady) {
    Open-DevBrowser $frontendUrl
} elseif ($backendReady) {
    Write-Host "Backend is ready, but Vite is not. Check the frontend terminal output." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Backend  -> $backendUrl  (health: /actuator/health)" -ForegroundColor Green
Write-Host "Frontend -> $frontendUrl" -ForegroundColor Green
if ($StripeWebhook) {
    Write-Host "Stripe   -> forwarding to $backendUrl$stripeWebhookPath" -ForegroundColor Green
}
Write-Host ""
Write-Host "Para parar todo: .\start-dev.ps1 -Stop" -ForegroundColor DarkGray
