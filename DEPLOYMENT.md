# Next.js Application Deployment Guide

This guide covers containerizing your Next.js application and deploying it to Fly.io using Kubernetes or direct deployment.

## Prerequisites

- Docker installed
- kubectl configured (for Kubernetes deployment)
- Fly.io CLI installed (`curl -L https://fly.io/install.sh | sh`)
- Container registry account (Docker Hub, GitHub Container Registry, etc.)

## 1. Local Development with Docker

### Build and run locally:
```bash
# Build the Docker image
docker build -t nextjs-app .

# Run the container
docker run -p 3000:3000 nextjs-app
```

### Using Docker Compose:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 2. Container Registry Setup

### Push to Docker Hub:
```bash
# Login to Docker Hub
docker login

# Tag your image
docker tag nextjs-app your-username/nextjs-app:latest

# Push to registry
docker push your-username/nextjs-app:latest
```

### Push to GitHub Container Registry:
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag your image
docker tag nextjs-app ghcr.io/your-username/nextjs-app:latest

# Push to registry
docker push ghcr.io/your-username/nextjs-app:latest
```

## 3. Environment Variables Setup

### Update ConfigMap and Secret:
1. Edit `k8s/configmap.yaml` with your public environment variables
2. Edit `k8s/secret.yaml` with base64-encoded sensitive data:
   ```bash
   echo -n "your-secret-value" | base64
   ```

### Required Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## 4. Fly.io Direct Deployment

### Deploy directly to Fly.io:
```bash
# Login to Fly.io
fly auth login

# Create a new app (first time only)
fly apps create your-app-name

# Deploy the application
fly deploy

# Open the application
fly open
```

### Update fly.toml:
- Change `app = "your-app-name"` to your actual app name
- Update `primary_region` to your preferred region
- Add environment variables as needed

## 5. Kubernetes Deployment (Fly.io FKS)

### Create Fly.io Kubernetes Cluster:
```bash
# Create FKS cluster
fly ext k8s create --name my-cluster --org yourOrg --region yourRegion

# Set up kubeconfig
export KUBECONFIG=/path/to/kubeconfig
```

### Deploy to Kubernetes:
```bash
# Update image in deployment.yaml
# Replace "your-registry/nextjs-app:latest" with your actual image

# Apply Kubernetes manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get pods
kubectl get services
```

### Using deployment scripts:
```bash
# Make scripts executable
chmod +x scripts/build-and-push.sh
chmod +x scripts/deploy.sh

# Build and push image
./scripts/build-and-push.sh v1.0.0

# Deploy to Kubernetes
./scripts/deploy.sh
```

## 6. Monitoring and Scaling

### Check application health:
```bash
# Kubernetes
kubectl get pods -l app=nextjs-app
kubectl logs -l app=nextjs-app

# Fly.io
fly status
fly logs
```

### Scale the application:
```bash
# Kubernetes
kubectl scale deployment nextjs-app --replicas=5

# Fly.io
fly scale count 5
```

## 7. SSL and Domain Setup

### For Kubernetes with Ingress:
1. Install cert-manager
2. Update `k8s/ingress.yaml` with your domain
3. Apply the ingress: `kubectl apply -f k8s/ingress.yaml`

### For Fly.io:
```bash
# Add custom domain
fly certs add your-domain.com

# Check certificate status
fly certs show your-domain.com
```

## 8. Troubleshooting

### Common Issues:

1. **Image pull errors**: Ensure your Kubernetes cluster can access your container registry
2. **Environment variables**: Verify ConfigMap and Secret are properly configured
3. **Health check failures**: Check if your application is responding on the health check path
4. **Resource limits**: Adjust CPU and memory limits in deployment.yaml if needed

### Debug Commands:
```bash
# Kubernetes
kubectl describe pod <pod-name>
kubectl exec -it <pod-name> -- /bin/sh
kubectl get events --sort-by=.metadata.creationTimestamp

# Fly.io
fly logs
fly status
fly ssh console
```

## 9. CI/CD Pipeline

### GitHub Actions Example:
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## 10. Performance Optimization

### Docker Image Optimization:
- Multi-stage builds (already implemented)
- Use .dockerignore (already configured)
- Consider using distroless images for production

### Kubernetes Optimization:
- Resource limits and requests (configured)
- Horizontal Pod Autoscaler (configured)
- Pod disruption budgets for high availability

### Fly.io Optimization:
- Use appropriate VM sizes
- Configure auto-scaling
- Monitor resource usage

## Support

For issues and questions:
- Fly.io Documentation: https://fly.io/docs/
- Kubernetes Documentation: https://kubernetes.io/docs/
- Next.js Documentation: https://nextjs.org/docs/

