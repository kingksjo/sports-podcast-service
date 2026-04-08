# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Cloud Build
   - Cloud Run
   - Cloud Storage
   - Cloud Speech-to-Text
   - Vertex AI
   - Artifact Registry
   - Generative Language API

2. **gcloud CLI** installed and configured:
   ```bash
   gcloud init
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Two Cloud Storage buckets** created:
   - Input bucket: for raw audio commentary
   - Output bucket: for generated podcast audio

## Step-by-Step Deployment

### 1. Create Service Account

```bash
PROJECT_ID=$(gcloud config get-value project)

# Create a service account for Cloud Build
gcloud iam service-accounts create sports-podcast-sa \
  --display-name="Sports Podcast Service Account"
```

### 2. Set Up Artifact Registry

```bash
# Create a Docker repository in Artifact Registry
gcloud artifacts repositories create sports-podcast-repo \
  --repository-format docker \
  --location us-central1 \
  --description "Sports podcast service container images"
```

### 3. Configure IAM Permissions

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT=sports-podcast-sa@$PROJECT_ID.iam.gserviceaccount.com

# Permissions for Cloud Build service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT \
  --role=roles/artifactregistry.writer

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$SERVICE_ACCOUNT \
  --role=roles/logging.logWriter

# Allow the service account to impersonate the Compute Engine default service account
gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member=serviceAccount:$SERVICE_ACCOUNT \
  --role=roles/iam.serviceAccountUser

# Permissions for Cloud Run's Compute Engine service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/artifactregistry.reader

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/storage.objectViewer

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/aiplatform.user

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/speech.client
```

### 4. Configure Deployment Environment

1. Copy the environment template:
   ```bash
   cp service/.env.example service/.env
   ```

2. Update `service/.env` with your values:
   ```env
   GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
   GC_LOCATION=us-central1
   GOOGLE_CLOUD_LOCATION=global
   GOOGLE_GENAI_USE_VERTEXAI=true
   INPUT_BUCKET=audio-commentary-input-001
   OUTPUT_BUCKET=audio-podcast-output-001
   ```

### 5. Set Up Cloud Build Trigger

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Create Trigger**
3. Fill in the form:
   - **Name:** `sports-podcast-deploy`
   - **Region:** `us-central1`
   - **Event:** `Push to a branch`
   - **Repository:** Select your GitHub repository (you'll need to authenticate first)
   - **Branch:** `^main$`
   - **Build configuration:** `Cloud Build configuration file (yaml or json)`
   - **Location:** `cloudbuild.yaml`
   - **Service account:** Select `sports-podcast-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`
4. Click **Create**

### 6. Push Code to Trigger Build

```bash
git add .
git commit -m "Deploy to Cloud Run with Artifact Registry"
git push origin main
```

Cloud Build will automatically:
- Build the Docker image
- Push it to Artifact Registry
- Deploy to Cloud Run
- Set all environment variables

### 7. Monitor Deployment

```bash
# View build status
gcloud builds list

# View Cloud Run logs
gcloud run logs read sports-podcast-service --limit 50 --region us-central1

# Check service status
gcloud run services describe sports-podcast-service --region us-central1

# Get the service URL
gcloud run services describe sports-podcast-service --region us-central1 --format='value(status.url)'
```

## Local Testing (Optional)

Before deploying, test locally:

```bash
# Install dependencies
pip install -r service/requirements.txt

# Set up Application Default Credentials
gcloud auth application-default login

# Run service
cd service
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

Test with curl:
```bash
curl -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "audio-commentary-input-001",
    "name": "sample-audio.mp3"
  }'
```

## Setting Up Eventarc Trigger (Optional)

To automatically process files uploaded to your input bucket:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud eventarc triggers create sports-podcast-trigger \
  --location us-central1 \
  --event-filters type=google.cloud.storage.object.v1.finalized \
  --event-filters bucket=audio-commentary-input-001 \
  --service-account $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --destination-run-service sports-podcast-service \
  --destination-run-region us-central1
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Permission denied on Artifact Registry"** | Ensure your service account has `roles/artifactregistry.writer` |
| **"Does not have permission to access namespace"** | Run the IAM permission commands in Step 3, particularly the `iam.serviceAccountUser` grant |
| **Cloud Run deployment fails** | Check logs: `gcloud run logs read sports-podcast-service --limit 50` |
| **Recognition output configuration error** | Verify `transcriber.py` has `InlineOutputConfig` configured |
| **Speech-to-Text API errors** | Ensure Vertex AI and Generative Language APIs are enabled |
| **Timeout errors** | Large audio files may exceed 3600s timeout; increase in `cloudbuild.yaml` if needed |

## Cost Considerations

- **Cloud Build**: Free tier includes 120 build-minutes/month
- **Cloud Run**: Pay-per-use, ~$0.00002400 per vCPU-second
- **Speech-to-Text**: ~$0.024 per 15 seconds of audio
- **Vertex AI/Gemini**: Billed per request (varies by model)
- **Cloud Storage**: Billed for storage and operations

Monitor usage in [GCP Billing Console](https://console.cloud.google.com/billing).

## Manual Deployment (Without Cloud Build Trigger)

If you prefer to deploy manually:

```bash
PROJECT_ID=$(gcloud config get-value project)

# Build the image
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/sports-podcast-repo/sports-podcast-service:latest ./service

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/$PROJECT_ID/sports-podcast-repo/sports-podcast-service:latest

# Deploy to Cloud Run
gcloud run deploy sports-podcast-service \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/sports-podcast-repo/sports-podcast-service:latest \
  --region us-central1 \
  --platform managed \
  --memory 512Mi \
  --timeout 3600 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,INPUT_BUCKET=audio-commentary-input-001,OUTPUT_BUCKET=audio-podcast-output-001,GOOGLE_GENAI_USE_VERTEXAI=true,GC_LOCATION=us-central1,GOOGLE_CLOUD_LOCATION=global
```
