# Docker Commands for Proteus Chi Monitor

## Build the Docker image
docker build -t proteus-chi-monitor .

## Run the container (nginx serves on port 80)
docker run -d \
  --name proteus-monitor \
  -p 80:80 \
  --restart unless-stopped \
  proteus-chi-monitor

## Or run on a different port (e.g., 8080)
docker run -d \
  --name proteus-monitor \
  -p 8080:80 \
  --restart unless-stopped \
  proteus-chi-monitor

## View container logs
docker logs proteus-monitor

## Stop the container
docker stop proteus-monitor

## Remove the container
docker rm proteus-monitor

## Development with volume mounting (for file changes)
docker run -d \
  --name proteus-monitor-dev \
  -p 8080:80 \
  -v $(pwd):/app \
  -v /app/node_modules \
  proteus-chi-monitor

## Docker Compose (optional - create docker-compose.yml)
version: '3.8'
services:
  proteus-monitor:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/api/dashboard/stats"]
      interval: 30s
      timeout: 10s
      retries: 3