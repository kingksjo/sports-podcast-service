# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Cloud Run
   - Cloud Storage
   - Cloud Speech-to-Text
   - Vertex AI
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

## Environment Setup

1. Copy the environment template and configure it:
   ```bash
   cp service/.env.example service/.env
   ```

2. Update `service/.env` with your values:
   - `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
   - `INPUT_BUCKET`: Name of your input bucket
   - `OUTPUT_BUCKET`: Name of your output bucket

## Local Testing

1. Install dependencies:
   ```bash
   pip install -r service/requirements.txt
   ```

2. Set up Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```

3. Run locally:
   ```bash
   cd service
   uvicorn main:app --reload --host 0.0.0.0 --port 8080
   ```

4. Test with a curl request:
   ```bash
   curl -X POST http://localhost:8080/ \
     -H "Content-Type: application/json" \
     -d '{
       "bucket": "audio-commentary-input-001",
       "name": "sample-audio.mp3"
     }'
   ```

## Building and Pushing to Cloud Run

1. **Build the Docker image:**
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/sports-podcast-service ./service
   ```

2. **Push to Google Container Registry:**
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/sports-podcast-service
   ```

   Or use Cloud Build directly:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/sports-podcast-service ./service
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy sports-podcast-service \
     --image gcr.io/YOUR_PROJECT_ID/sports-podcast-service \
     --platform managed \
     --region us-central1 \
     --memory 2Gi \
     --timeout 3600 \
     --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,INPUT_BUCKET=audio-commentary-input-001,OUTPUT_BUCKET=audio-podcast-output-001,GOOGLE_GENAI_USE_VERTEXAI=true,GC_LOCATION=us-central1,GOOGLE_CLOUD_LOCATION=global
   ```

   **Important flags:**
   - `--memory 2Gi`: Allocates 2GB RAM (needed for audio processing)
   - `--timeout 3600`: Sets 1-hour timeout (speech-to-text can take time)
   - `--allow-unauthenticated`: Only add if you want public access

## Setting Up Eventarc Trigger (Optional)

To automatically process files uploaded to your input bucket:

1. **Create an Eventarc trigger:**
   ```bash
   gcloud eventarc triggers create sports-podcast-trigger \
     --location us-central1 \
     --event-filters type=google.cloud.storage.object.v1.finalized \
     --event-filters bucket=INPUT_BUCKET_NAME \
     --service-account PROJECT_NUMBER-compute@developer.gserviceaccount.com \
     --destination-run-service sports-podcast-service \
     --destination-run-region us-central1
   ```

2. Grant the service account necessary permissions (if not automatically applied):
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
     --role roles/run.invoker
   ```

## Monitoring

1. **View logs:**
   ```bash
   gcloud run logs read sports-podcast-service --limit 50 --region us-central1
   ```

2. **Check service status:**
   ```bash
   gcloud run services describe sports-podcast-service --region us-central1
   ```

## Troubleshooting

- **"Recognition output configuration must be specified"**: Ensure `transcriber.py` has the inline output config
- **"Object of type 'BatchRecognizeResults' has no len()"**: Verify transcriber returns a string, not an object
- **Permission errors**: Ensure the Cloud Run service account has storage and API permissions
- **Timeout**: The default timeout may need to be increased for large audio files (adjust with `--timeout`)

## Cost Considerations

- **Cloud Run**: Billed per 100ms of execution
- **Speech-to-Text**: Billed per 15 seconds of audio
- **Vertex AI/Gemini**: Billed per request
- **Cloud Storage**: Billed for storage and operations

Monitor your usage in the GCP console under **Billing**.
