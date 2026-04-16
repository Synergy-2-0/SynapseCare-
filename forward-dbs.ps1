
# SynapseCare - Database Port Forwarding Script
# This script forwards Kubernetes PostgreSQL services to local ports for pgAdmin access.

$forwards = @(
    @{ name="Auth"; port=5433; svc="postgres-auth" },
    @{ name="Patient"; port=5434; svc="postgres-patient" },
    @{ name="Doctor"; port=5435; svc="postgres-doctor" },
    @{ name="Appointment"; port=5436; svc="postgres-appointment" },
    @{ name="Prescription"; port=5437; svc="postgres-prescription" },
    @{ name="Payment"; port=5438; svc="postgres-payment" },
    @{ name="Notification"; port=5439; svc="postgres-notification" },
    @{ name="Telemedicine"; port=5440; svc="postgres-telemedicine" }
)

echo "Starting database port forwarding..."
echo "-------------------------------------"

foreach ($f in $forwards) {
    echo "Forwarding $($f.name) to localhost:$($f.port)..."
    # Start the port forward in a separate background job
    Start-Job -Name "forward-$($f.name)" -ScriptBlock {
        param($svc, $port)
        kubectl port-forward "svc/$svc" "$($port):5432"
    } -ArgumentList $f.svc, $f.port
}

echo "-------------------------------------"
echo "Port forwarding active!"
echo "Use 'Get-Job' to see status and 'Stop-Job *' to stop all forwarding."
echo "pgAdmin Connections:"
foreach ($f in $forwards) {
    echo "  - $($f.name): localhost:$($f.port)"
}
