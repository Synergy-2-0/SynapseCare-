rm -rf ~/healthcare-platform
git clone https://$GITHUB_USER:$GITHUB_TOKEN@github.com/SakithLiyanage/healthcare-platform.git ~/healthcare-platform
cd ~/healthcare-platform
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
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
  frontend:
    build: 
      context: ./frontend
      args:
        - NEXT_PUBLIC_API_GATEWAY_URL=http:///api
    ports: ["80:3000"]
    restart: always
EOF
docker-compose up --build -d
