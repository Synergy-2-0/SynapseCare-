curl -fsSL https://get.docker.com | sh
sudo apt install -y docker-compose
echo $DO_TOKEN | docker login registry.digitalocean.com -u $DO_TOKEN --password-stdin
mkdir -p ~/synapscare && cd ~/synapscare
cat <<EOF > docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: synapscare
    ports: ["5432:5432"]
    deploy: { resources: { limits: { memory: 128M } } }
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
    deploy: { resources: { limits: { memory: 128M } } }
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    deploy: { resources: { limits: { memory: 128M } } }
  api-gateway:
    image: registry.digitalocean.com/synapscare-registry/auth-service:gateway
    ports: ["8080:8080"]
    deploy: { resources: { limits: { memory: 256M } } }
  auth-service:
    image: registry.digitalocean.com/synapscare-registry/auth-service:auth
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/synapscare
    deploy: { resources: { limits: { memory: 256M } } }
  frontend:
    image: registry.digitalocean.com/synapscare-registry/auth-service:frontend
    ports: ["80:3000"]
    deploy: { resources: { limits: { memory: 256M } } }
EOF
docker-compose up -d
