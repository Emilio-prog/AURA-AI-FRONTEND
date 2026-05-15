#requires -Version 5.1
<#
.SYNOPSIS
  Arranca AURA IA para desarrollo o evaluacion local.

.DESCRIPTION
  Modo por defecto: arranca solo el frontend en http://localhost:5173 y lo
  conecta al backend real de produccion mediante el proxy de Vite. No requiere
  .env, credenciales, PostgreSQL local, H2 ni usuarios demo.

  Modo backend local: arranca tambien Spring Boot en localhost usando
  AURA-AI-BACKEND\.env y PostgreSQL/Supabase real.

.EXAMPLE
  .\start-dev.ps1
  .\start-dev.ps1 -LocalBackend
  .\start-dev.ps1 -RealEnv        # alias compatible de -LocalBackend
  .\start-dev.ps1 -StripeWebhook  # implica -LocalBackend
  .\start-dev.ps1 -Stop
#>

param(
    [switch]$Stop,
    [switch]$StripeWebhook,
    [switch]$RealEnv,
    [switch]$LocalBackend
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent (Split-Path -Parent $scriptDir)
$beDir = Join-Path $root 'AURA-AI-BACKEND'
$feDir = Join-Path $root 'AURA-AI-FRONTEND'
$logDir = Join-Path $root '.dev-logs'
$backendOutLog = Join-Path $logDir 'backend-dev.out.log'
$backendErrLog = Join-Path $logDir 'backend-dev.err.log'
$frontendOutLog = Join-Path $logDir 'frontend-dev.out.log'
$frontendErrLog = Join-Path $logDir 'frontend-dev.err.log'
$frontendUrl = 'http://localhost:5173'
$productionBackendUrl = 'https://api.aura-ia.es'
$productionApiBaseUrl = "$productionBackendUrl/api/v1"
$useLocalBackend = [bool]($LocalBackend -or $RealEnv -or $StripeWebhook)
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

function Ensure-FrontendLayout() {
    if (-not (Test-Path $feDir)) {
        throw "No se encontro $feDir. Ejecuta el script desde el repo frontend clonado dentro del workspace AURA-IA."
    }
    if (-not (Test-Path (Join-Path $feDir 'package.json'))) {
        throw "No se encontro AURA-AI-FRONTEND\package.json. El repositorio frontend parece incompleto."
    }
}

function Ensure-BackendLayout() {
    if (-not (Test-Path $beDir)) {
        throw "No se encontro $beDir. Clona AURA-AI-BACKEND como carpeta hermana de AURA-AI-FRONTEND."
    }
    if (-not (Test-Path (Join-Path $beDir 'mvnw.cmd'))) {
        throw "No se encontro AURA-AI-BACKEND\mvnw.cmd. El repositorio backend parece incompleto."
    }
}

function Assert-RequiredCommand($name, $hint) {
    if (-not (Get-CommandSource $name)) {
        throw "No se encontro '$name' en PATH. $hint"
    }
}

function Assert-JavaAvailable() {
    $javaPath = Get-CommandSource 'java'
    if ($javaPath) { return }

    if (-not [string]::IsNullOrWhiteSpace($env:JAVA_HOME)) {
        $candidate = Join-Path $env:JAVA_HOME 'bin\java.exe'
        if (Test-Path $candidate) {
            $env:PATH = "$(Split-Path -Parent $candidate);$env:PATH"
            return
        }
    }

    throw "No se encontro Java en PATH/JAVA_HOME. Instala JDK 21 y vuelve a abrir la terminal."
}

function Assert-BackendEnvReady() {
    $backendEnv = Join-Path $beDir '.env'
    $backendExample = Join-Path $beDir '.env.example'

    if (-not (Test-Path $backendEnv)) {
        if (Test-Path $backendExample) {
            Copy-Item -Path $backendExample -Destination $backendEnv
            Write-Warning "Se ha creado AURA-AI-BACKEND\.env desde .env.example."
        }
        throw "El modo backend local necesita AURA-AI-BACKEND\.env con credenciales reales de PostgreSQL/Supabase."
    }

    Import-EnvFile $backendEnv

    $required = @('SPRING_DATASOURCE_URL', 'SPRING_DATASOURCE_USERNAME', 'SPRING_DATASOURCE_PASSWORD', 'JWT_SECRET')
    $missing = @()
    foreach ($key in $required) {
        $value = Get-EnvValue $key
        if ([string]::IsNullOrWhiteSpace($value) -or $value -match '^<.*>$') {
            $missing += $key
        }
    }

    if ($missing.Count -gt 0) {
        throw "AURA-AI-BACKEND\.env no esta listo. Rellena estas variables: $($missing -join ', ')"
    }

    if ((Get-EnvValue 'EMAIL_ENABLED') -eq 'true') {
        $smtpPassword = Get-EnvValue 'SMTP_PASSWORD'
        if ([string]::IsNullOrWhiteSpace($smtpPassword) -or $smtpPassword -match '^<.*>$') {
            Write-Warning "EMAIL_ENABLED=true pero SMTP_PASSWORD parece placeholder. El backend puede arrancar, pero el registro con email fallara."
        }
    }
}

function Ensure-FrontendDependencies() {
    if (Test-Path (Join-Path $feDir 'node_modules')) { return }

    Write-Host "node_modules no existe. Ejecutando npm ci en AURA-AI-FRONTEND..." -ForegroundColor Cyan
    Push-Location $feDir
    try {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci fallo con codigo $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

function Configure-FrontendEnvironment($backendPort) {
    if ($useLocalBackend) {
        [Environment]::SetEnvironmentVariable('VITE_API_BASE_URL', "http://localhost:$backendPort/api/v1", 'Process')
        Remove-Item Env:\VITE_DEV_API_PROXY_TARGET -ErrorAction SilentlyContinue
        Write-Host "Frontend conectado al backend local: http://localhost:$backendPort/api/v1" -ForegroundColor Green
    } else {
        [Environment]::SetEnvironmentVariable('VITE_API_BASE_URL', '/api/v1', 'Process')
        [Environment]::SetEnvironmentVariable('VITE_DEV_API_PROXY_TARGET', $productionBackendUrl, 'Process')
        [Environment]::SetEnvironmentVariable('VITE_DEV_MODE', 'false', 'Process')
        Write-Host "Modo tutor: frontend local con proxy Vite hacia $productionApiBaseUrl" -ForegroundColor Green
    }

    if ([string]::IsNullOrWhiteSpace($env:VITE_DEFAULT_LOCALE)) {
        [Environment]::SetEnvironmentVariable('VITE_DEFAULT_LOCALE', 'es', 'Process')
    }
}

function Show-LogTail($name, $path) {
    if (-not (Test-Path $path)) { return }
    Write-Host ""
    Write-Host "$name ($path):" -ForegroundColor DarkYellow
    Get-Content -Path $path -Tail 40 -ErrorAction SilentlyContinue
}

function Initialize-DevEnvironment() {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    Ensure-FrontendLayout
    Assert-RequiredCommand 'npm.cmd' 'Instala Node.js 20 o superior.'

    if ($useLocalBackend) {
        Ensure-BackendLayout
        Assert-JavaAvailable
        Assert-BackendEnvReady
    }

    Ensure-FrontendDependencies
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

try {
    Initialize-DevEnvironment
} catch {
    Write-Host ""
    Write-Error $_.Exception.Message
    exit 1
}

$backendPort = Resolve-BackendPort
if ($useLocalBackend) {
    $backendUrl = "http://localhost:$backendPort"
    $backendHealthUrl = "$backendUrl/actuator/health"
} else {
    $backendUrl = $productionBackendUrl
    $backendHealthUrl = "$productionBackendUrl/actuator/health"
}

Configure-FrontendEnvironment $backendPort

$stripeRunner = $null
if ($StripeWebhook) {
    $stripeRunner = Enable-StripeWebhookLocal
}

if ($useLocalBackend -and (Get-EnvValue 'SOS_SMS_ENABLED') -eq 'true') {
    $twilioMissing = @('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER') |
        Where-Object { [string]::IsNullOrWhiteSpace((Get-EnvValue $_)) }
    if ($twilioMissing.Count -gt 0) {
        Write-Warning "SOS_SMS_ENABLED=true pero faltan variables Twilio: $($twilioMissing -join ', '). El backend fallara al arrancar."
    }
}

if ($useLocalBackend) {
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
        Remove-Item -LiteralPath $backendOutLog, $backendErrLog -Force -ErrorAction SilentlyContinue
        Start-Process -FilePath "$beDir\mvnw.cmd" `
            -ArgumentList 'spring-boot:run' `
            -WorkingDirectory $beDir `
            -RedirectStandardOutput $backendOutLog `
            -RedirectStandardError $backendErrLog `
            -WindowStyle Hidden
    }
} else {
    Write-Host "Backend local no arrancado; se usa el backend real $productionBackendUrl mediante proxy." -ForegroundColor Cyan
}

$fePid = Get-PortOwner 5173
if ($fePid) {
    Write-Host "Vite already running on :5173 (PID $fePid)" -ForegroundColor Green
    Write-Host "Si ese Vite se arranco antes de este script, ejecuta .\start-dev.ps1 -Stop y vuelve a iniciar para cargar el proxy tutor." -ForegroundColor DarkYellow
} else {
    Write-Host "Starting Frontend (Vite)..." -ForegroundColor Cyan
    Remove-Item -LiteralPath $frontendOutLog, $frontendErrLog -Force -ErrorAction SilentlyContinue
    Start-Process -FilePath 'npm.cmd' `
        -ArgumentList 'run', 'dev', '--', '--host', 'localhost', '--port', '5173', '--strictPort' `
        -WorkingDirectory $feDir `
        -RedirectStandardOutput $frontendOutLog `
        -RedirectStandardError $frontendErrLog `
        -WindowStyle Hidden
}

if ($StripeWebhook -and $stripeRunner) {
    Start-StripeWebhookForwarder $stripeRunner
}

if ($useLocalBackend) {
    $backendReady = Wait-HttpReady 'Backend' $backendHealthUrl 90
} else {
    $backendReady = $true
    Write-Host "Backend real configurado como proxy target: $productionBackendUrl" -ForegroundColor Green
}
$frontendReady = Wait-HttpReady 'Frontend' $frontendUrl 45
if ($useLocalBackend -and -not $backendReady) {
    Show-LogTail 'Backend stderr' $backendErrLog
    Show-LogTail 'Backend stdout' $backendOutLog
}
if (-not $frontendReady) {
    Show-LogTail 'Frontend stderr' $frontendErrLog
    Show-LogTail 'Frontend stdout' $frontendOutLog
}
if ($frontendReady) {
    Open-DevBrowser $frontendUrl
} elseif ($backendReady) {
    Write-Host "Backend is ready, but Vite is not. Check $frontendErrLog and $frontendOutLog." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Backend  -> $backendUrl  (health: /actuator/health)" -ForegroundColor Green
Write-Host "Frontend -> $frontendUrl" -ForegroundColor Green
if (-not $useLocalBackend) {
    Write-Host "API      -> $frontendUrl/api/v1/* proxy -> $productionApiBaseUrl/*" -ForegroundColor Green
}
Write-Host "Logs     -> $logDir" -ForegroundColor Green
if ($StripeWebhook) {
    Write-Host "Stripe   -> forwarding to $backendUrl$stripeWebhookPath" -ForegroundColor Green
}
Write-Host ""
Write-Host "Para parar todo: .\start-dev.ps1 -Stop" -ForegroundColor DarkGray
