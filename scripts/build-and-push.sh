#!/bin/bash

# Build and Push Script for Next.js App
set -e

# Configuration
IMAGE_NAME="ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO"
TAG=${1:-latest}

echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo "Tagging image..."
docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest

echo "Logging into GHCR..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

echo "Pushing image to GHCR..."
docker push ${IMAGE_NAME}:${TAG}
docker push ${IMAGE_NAME}:latest

echo "Successfully built and pushed ${IMAGE_NAME}:${TAG}"

