$ErrorActionPreference = "Stop"

$services = @(
    "auth-service",
    "doctor-service",
    "appointment-service",
    "patient-service",
    @{ path="AI-SymptomChecker-Service"; name="ai-symptomchecker-service" },
    "payment-service",
    "telemedicine-service",
    "prescription-service",
    "notification-service",
    "api-gateway"
)

foreach ($svc in $services) {
    if ($svc -is [string]) {
        $path = $svc
        $name = $svc
    } else {
        $path = $svc.path
        $name = $svc.name
    }
    
    Write-Host "Building image for $name..." -ForegroundColor Cyan
    docker build -t "synapscare/${name}:latest" "./$path"
}

Write-Host "All images built successfully!" -ForegroundColor Green
