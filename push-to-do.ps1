# Tag and push images to DO
$reg = "registry.digitalocean.com/synapscare-registry"
docker tag synapscare/auth-service:latest $reg/auth-service:latest
docker push $reg/auth-service:latest
docker tag synapscare/doctor-service:latest $reg/doctor-service:latest
docker push $reg/doctor-service:latest
docker tag synapscare/appointment-service:latest $reg/appointment-service:latest
docker push $reg/appointment-service:latest
docker tag synapscare/patient-service:latest $reg/patient-service:latest
docker push $reg/patient-service:latest
docker tag synapscare/ai-symptomchecker-service:latest $reg/ai-symptom-checker:latest
docker push $reg/ai-symptom-checker:latest
docker tag synapscare/payment-service:latest $reg/payment-service:latest
docker push $reg/payment-service:latest
docker tag synapscare/telemedicine-service:latest $reg/telemedicine-service:latest
docker push $reg/telemedicine-service:latest
docker tag synapscare/prescription-service:latest $reg/prescription-service:latest
docker push $reg/prescription-service:latest
docker tag synapscare/notification-service:latest $reg/notification-service:latest
docker push $reg/notification-service:latest
docker tag synapscare/api-gateway:latest $reg/api-gateway:latest
docker push $reg/api-gateway:latest
