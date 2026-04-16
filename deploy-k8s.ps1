
$services = @(
    @{ name="auth-service"; path="auth-service"; context="auth-service" },
    @{ name="doctor-service"; path="doctor-service"; context="doctor-service" },
    @{ name="appointment-service"; path="appointment-service"; context="appointment-service" },
    @{ name="patient-service"; path="patient-service"; context="patient-service" },
    @{ name="payment-service"; path="payment-service"; context="payment-service" },
    @{ name="telemedicine-service"; path="telemedicine-service"; context="telemedicine-service" },
    @{ name="prescription-service"; path="prescription-service"; context="prescription-service" },
    @{ name="ai-symptom-checker-service"; path="AI-SymptomChecker-Service"; context="AI-SymptomChecker-Service" },
    @{ name="api-gateway"; path="api-gateway/Dockerfile"; context="." },
    @{ name="notification-service"; path="notification-service/Dockerfile"; context="." },
    @{ name="frontend"; path="frontend"; context="frontend" }
)

foreach ($service in $services) {
    echo "Building $($service.name)..."
    $imageName = "localhost:5000/healthcare-platform-$($service.name):latest"
    if ($service.context -eq ".") {
        docker build -t $imageName -f $($service.path) .
    } elseif ($service.name -eq "frontend") {
        $imageName = "localhost:5000/healthcare-platform-frontend:v10"
        docker build -t $imageName --build-arg NEXT_PUBLIC_API_GATEWAY_URL="http://localhost:8080/api" $service.context
    } else {
        docker build -t $imageName $service.context
    }
    echo "Pushing $imageName to local registry..."
    docker push $imageName
}

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/dbs.yaml
kubectl apply -f k8s/healthcare-platform.yaml
kubectl apply -f k8s/healthcare-platform-extra.yaml
kubectl apply -f k8s/frontend.yaml

echo "Restarting deployments to pick up new images..."
kubectl rollout restart deployment auth-service
kubectl rollout restart deployment doctor-service
kubectl rollout restart deployment appointment-service
kubectl rollout restart deployment patient-service
kubectl rollout restart deployment api-gateway
kubectl rollout restart deployment payment-service
kubectl rollout restart deployment telemedicine-service
kubectl rollout restart deployment prescription-service
kubectl rollout restart deployment notification-service
kubectl rollout restart deployment ai-symptom-checker-service
kubectl set image deployment/frontend frontend=localhost:5000/healthcare-platform-frontend:v10

echo "Deployment complete!"
