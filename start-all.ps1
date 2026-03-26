# One-click deployment script for frontend and backend services

Write-Host "===== Starting deployment of frontend and backend services =====" -ForegroundColor Green

# Change to Frontend_main directory
Write-Host "Changing to Frontend_main directory..." -ForegroundColor Cyan
Set-Location "E:\FullStack\Frontend_main"

# Build frontend Docker image
Write-Host "Building frontend Docker image..." -ForegroundColor Cyan
docker build -t frontend-main .

# Stop and remove existing frontend container
Write-Host "Stopping and removing existing frontend container..." -ForegroundColor Cyan
docker stop frontend-main 2>$null
docker rm frontend-main 2>$null

# Run frontend container
Write-Host "Running frontend container..." -ForegroundColor Cyan
docker run -d -p 8080:80 --name frontend-main frontend-main

# Change to Backend_main directory
Write-Host "Changing to Backend_main directory..." -ForegroundColor Cyan
Set-Location "E:\FullStack\Backend_main"

# Build backend Docker image
Write-Host "Building backend Docker image..." -ForegroundColor Cyan
docker build -t backend-main .

# Stop and remove existing backend container
Write-Host "Stopping and removing existing backend container..." -ForegroundColor Cyan
docker stop backend-main 2>$null
docker rm backend-main 2>$null

# Run backend container
Write-Host "Running backend container..." -ForegroundColor Cyan
docker run -d -p 3000:3000 --name backend-main backend-main

# Check container status
Write-Host "Checking container status..." -ForegroundColor Cyan
docker ps

# Output access addresses
Write-Host "===== Deployment completed =====" -ForegroundColor Green
Write-Host "Frontend access address: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Backend API address: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend health check: http://localhost:3000/health" -ForegroundColor Yellow
Write-Host "Backend get list: http://localhost:3000/getList?type=test" -ForegroundColor Yellow
Write-Host "Backend file upload: POST http://localhost:3000/upload" -ForegroundColor Yellow