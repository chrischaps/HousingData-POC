# Google Cloud Run Deployment Guide

This guide explains how to deploy the Housing Data POC application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker](https://docs.docker.com/get-docker/) for local testing (optional)

## Initial Setup

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud CLI (if not already installed)
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Authenticate Docker with Google Container Registry

```bash
gcloud auth configure-docker
```

## Deployment Options

### Option A: Manual Deployment (Quick Start)

This is the fastest way to deploy:

```bash
# Navigate to the project directory
cd housing-data-poc

# Deploy directly to Cloud Run (Cloud Build will build the image)
gcloud run deploy housing-data-poc \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

### Option B: Build and Deploy Separately

For more control over the build process:

```bash
# 1. Build the container image
docker build -t gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest

# 3. Deploy to Cloud Run
gcloud run deploy housing-data-poc \
  --image gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

### Option C: Automated CI/CD with Cloud Build

Set up continuous deployment from your Git repository:

```bash
# 1. Connect your repository to Cloud Build
# (This requires setting up a trigger in the Cloud Console)

# 2. The cloudbuild.yaml file will automatically:
#    - Build the Docker image
#    - Push to Container Registry
#    - Deploy to Cloud Run

# You can also trigger builds manually:
gcloud builds submit --config cloudbuild.yaml
```

## Configuration Options

### Environment Variables

To add environment variables to your Cloud Run service:

```bash
gcloud run deploy housing-data-poc \
  --set-env-vars "API_KEY=your-key,ANOTHER_VAR=value" \
  --region us-central1
```

Or from a file:

```bash
gcloud run deploy housing-data-poc \
  --env-vars-file .env.yaml \
  --region us-central1
```

### Memory and CPU Allocation

```bash
gcloud run deploy housing-data-poc \
  --memory 512Mi \
  --cpu 1 \
  --region us-central1
```

### Minimum Instances (Reduce Cold Starts)

```bash
gcloud run deploy housing-data-poc \
  --min-instances 1 \
  --region us-central1
```

### Custom Domain

```bash
# Map a custom domain
gcloud run domain-mappings create \
  --service housing-data-poc \
  --domain your-domain.com \
  --region us-central1
```

## Testing the Deployment

After deployment, Cloud Run will provide a URL (e.g., `https://housing-data-poc-xxxxx-uc.a.run.app`).

Test the deployment:

```bash
# Get the service URL
gcloud run services describe housing-data-poc \
  --region us-central1 \
  --format 'value(status.url)'

# Test with curl
curl https://housing-data-poc-xxxxx-uc.a.run.app
```

## Local Testing with Docker

Before deploying, test the Docker container locally:

```bash
# Build the image
docker build -t housing-data-poc .

# Run locally
docker run -p 8080:8080 housing-data-poc

# Visit http://localhost:8080 in your browser
```

## Monitoring and Logs

View logs:

```bash
# Stream logs in real-time
gcloud run services logs tail housing-data-poc --region us-central1

# View logs in Cloud Console
gcloud run services logs read housing-data-poc --region us-central1
```

View service details:

```bash
gcloud run services describe housing-data-poc --region us-central1
```

## Updating the Service

To update the service after making changes:

```bash
# Option 1: Deploy from source (rebuild everything)
gcloud run deploy housing-data-poc --source . --region us-central1

# Option 2: Build and deploy new image
docker build -t gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest .
docker push gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest
gcloud run deploy housing-data-poc \
  --image gcr.io/YOUR_PROJECT_ID/housing-data-poc:latest \
  --region us-central1
```

## Traffic Management

Split traffic between revisions:

```bash
# Deploy a new revision without shifting traffic
gcloud run deploy housing-data-poc \
  --no-traffic \
  --tag canary \
  --region us-central1

# Gradually shift traffic
gcloud run services update-traffic housing-data-poc \
  --to-revisions canary=10,LATEST=90 \
  --region us-central1
```

## Cost Optimization

Cloud Run pricing is based on:
- **CPU and memory allocation** (per 100ms)
- **Number of requests**
- **Container Registry storage**

Tips to reduce costs:
1. Use `--min-instances 0` (default) to scale to zero when idle
2. Right-size memory and CPU allocations
3. Enable request timeout limits
4. Use Container Registry instead of Artifact Registry for simpler projects

## Troubleshooting

### Build Fails

Check build logs:
```bash
gcloud builds list
gcloud builds log BUILD_ID
```

### Service Won't Start

Check service logs:
```bash
gcloud run services logs read housing-data-poc --region us-central1 --limit 50
```

Common issues:
- Port mismatch: Ensure nginx is listening on port 8080
- Missing files: Check .dockerignore isn't excluding required files
- Build errors: Test Docker build locally first

### Permission Denied

Ensure you have the necessary IAM roles:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"
```

## Clean Up

To delete the Cloud Run service:

```bash
gcloud run services delete housing-data-poc --region us-central1
```

To delete container images:

```bash
gcloud container images delete gcr.io/YOUR_PROJECT_ID/housing-data-poc
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry Documentation](https://cloud.google.com/container-registry/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
