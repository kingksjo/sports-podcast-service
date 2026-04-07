# Sports Podcast Synthesis Service

A Python-based microservice that autonomously transforms raw sports commentary transcripts into polished, professional-grade podcast audio using Google Gemini and Vertex AI, it is built with Cloud Run deployment in mind

## Project Overview

This service is designed to process audio recordings of sports events (specifically Formula 1 and American Football). It follows a multi-step pipeline:
1.  **Ingestion:** Triggered by Cloud Storage events (e.g., via Eventarc).
2.  **Transcription:** Converts raw audio commentary into text using Google Cloud Speech-to-Text v2 API with Chirp 3 model.
3.  **Script Generation:** Employs **Gemini 3 Flash** to identify the sport and craft a 3-5 minute, authoritative podcast script based on the transcript.
4.  **Audio Synthesis:** Uses **Gemini 2.5 Flash (TTS)** with the "Leda" voice to generate natural-sounding podcast audio from the script.
5.  **Storage:** Uploads the final `.wav` podcast to a designated output bucket.

### Core Technologies
- **Framework:** FastAPI
- **AI/ML:** Google GenAI SDK (Gemini 3 Flash, Gemini 2.5 Flash TTS, Chirp 3), Vertex AI
- **Cloud Services:** Google Cloud Storage, Google Cloud Speech-to-Text, Google Cloud Run
- **Environment:** Containerized via Docker for Cloud Run

## Project Structure

```text
service/
├── main.py              # FastAPI entry point and pipeline orchestration
├── script_synthesis.py  # Gemini logic for sport ID and script generation
├── podcast_synthesis.py # Gemini TTS logic for audio production
├── transcriber.py       # Google Cloud Speech-to-Text integration
├── storage_actions.py   # GCS upload/download utilities
├── prompts.py           # System and user prompts for Gemini
├── requirements.txt     # Python dependencies
└── Dockerfile           # Container configuration
```

## Building and Running

### Prerequisites
- Python 3.9+
- Google Cloud Project with Speech-to-Text, Vertex AI, and Cloud Storage APIs enabled.
- Application Default Credentials (ADC) configured locally.

### Environment Variables
The following environment variables are required:
GOOGLE_CLOUD_PROJECT=placeholder
GC_LOCATION=us-central1
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=True
INPUT_BUCKET=audio-commentary-input-001
OUTPUT_BUCKET=audio-podcast-output-001
GOOGLE_APPLICATION_CREDENTIALS=gen-lang-client-0338546322-620fda3f7817.json

### Local Development
1.  Install dependencies:
    ```bash
    pip install -r service/requirements.txt
    ```
2.  Run the service:
    ```bash
    cd service
    uvicorn main:app --reload
    ```

### Containerization
Build the Docker image:
```bash
docker build -t sports-podcast-service ./service
```

## Development Conventions

- **LLM Prompting:** System instructions and templates are centralized in `service/prompts.py`.
- **Error Handling:** Use `fastapi.HTTPException` for API-level errors. Pipeline errors are logged with detailed context.
- **AI Models:** 
  - Script generation: `gemini-3-flash-preview`
  - Audio generation: `gemini-2.5-flash-tts`
- **Audio Format:** Transcription expects standard audio formats; output is 24kHz mono PCM wrapped in a WAV container.
