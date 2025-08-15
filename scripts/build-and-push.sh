#!/bin/bash

# Build and Push Script for Next.js App
set -e

# --- Configuration ---
GITHUB_USERNAME="aman12gaur"          # 🔁 Change this
REPO_NAME="Kazume"          # 🔁 Change this
IMAGE_NAME="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}"
TAG=${1:-latest}

# --- Safety Checks ---
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN is not set. Please export it before running the script."
  exit 1
fi

# --- Build ---
echo "🚧 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

# --- Tag ---
echo "🏷️ Tagging image as latest..."
docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest

# --- Login to GHCR ---
echo "🔐 Logging into GHCR..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# --- Push ---
echo "📤 Pushing image to GHCR..."
docker push ${IMAGE_NAME}:${TAG}
docker push ${IMAGE_NAME}:latest

echo "✅ Successfully built and pushed ${IMAGE_NAME}:${TAG}"
