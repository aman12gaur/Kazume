# Deploy Script for Next.js App on Kubernetes (PowerShell)
Write-Host "Applying Kubernetes manifests..." -ForegroundColor Green

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

Write-Host "Waiting for deployment to be ready..." -ForegroundColor Yellow
kubectl rollout status deployment/nextjs-app

Write-Host "Getting service information..." -ForegroundColor Cyan
kubectl get service nextjs-service

Write-Host "Deployment completed successfully!" -ForegroundColor Green
