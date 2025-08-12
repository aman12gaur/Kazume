#!/bin/bash

# Deploy Script for Next.js App on Kubernetes
set -e

echo "Applying Kubernetes manifests..."

# Create namespace first
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secret first
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Apply deployment and service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Apply Ingress (optional)
# kubectl apply -f k8s/ingress.yaml

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/nextjs-app

echo "Getting service information..."
kubectl get service nextjs-service

echo "Deployment completed successfully!"
