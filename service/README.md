# Sports Podcast Service - Service Module

Backend service for processing sports commentary audio and generating podcast content.

## Quick Start

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set up credentials
gcloud auth application-default login

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### Docker Build
```bash
docker build -t sports-podcast-service .
docker run -p 8080:8080 sports-podcast-service
```

## API Endpoints

### POST `/`
Process a sports commentary audio file.

**Request:**
```json
{
  "bucket": "bucket-name",
  "name": "game_highlights.mp3"
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Environment Variables

See `.env.example` for required configuration.

## Architecture

1. **Transcription** (`transcriber.py`): Speech-to-Text v2 with Chirp 3 model
2. **Script Generation** (`script_synthesis.py`): Gemini 3 Flash for content creation
3. **Audio Synthesis** (`podcast_synthesis.py`): Gemini 2.5 Flash TTS for voice generation
4. **Storage** (`storage_actions.py`): GCS upload/download operations

## Troubleshooting

- Ensure `GOOGLE_CLOUD_PROJECT` matches your GCP project ID
- Verify input/output buckets exist and service account has permissions
- Check Cloud Run logs: `gcloud run logs read sports-podcast-service`
