# Build and Push Script for Next.js App (PowerShell)
param(
    [string]$Tag = "latest"
)

# Configuration
$ImageName = "ghcr.io/aman12gaur/Kazume"

Write-Host "Building Docker image..." -ForegroundColor Green
docker build -t "${ImageName}:${Tag}" .

Write-Host "Tagging image..." -ForegroundColor Yellow
docker tag "${ImageName}:${Tag}" "${ImageName}:latest"

Write-Host "Logging into GHCR..." -ForegroundColor Cyan
$env:GITHUB_TOKEN | docker login ghcr.io -u aman12gaur --password-stdin

Write-Host "Pushing image to registry..." -ForegroundColor Cyan
docker push "${ImageName}:${Tag}"
docker push "${ImageName}:latest"

Write-Host "Successfully built and pushed ${ImageName}:${Tag}" -ForegroundColor Green

