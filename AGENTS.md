# Sports Podcast Synthesis Service - Agent Guide

A GCP-powered pipeline that takes sports commentary MP3 audio, transcribes it, generates a 3–5 minute podcast recap script, converts it to audio, and delivers it to fans who missed a game live. 

## Architecture & Stack

**Backend**
- **Framework:** FastAPI
- **Deployment:** Google Cloud Run (locked down with `--no-allow-unauthenticated`)
- **Orchestration:** Eventarc triggers pipeline on GCS upload
- **AI/ML:** Vertex AI (Gemini 3 Flash for script, Gemini 2.5 Flash TTS for audio with "Leda" voice, Chirp 3 for Speech-to-Text)

**Frontend**
- **Framework:** React + Vite
- **Styling:** TailwindCSS, Shadcn UI, Industrial Minimalist design
- **Deployment & API:** Vercel (with serverless functions acting as secure middle layer)

**GCP Infrastructure (Environment Variables/Config)**
- **Project ID:** `<YOUR_PROJECT_ID>`
- **Project Number:** `<YOUR_PROJECT_NUMBER>`
- **Region:** `us-central1` (Cloud Run) / `global` (Speech-to-Text, WIF) / `EU` (GCS Buckets)
- **Input bucket:** `<YOUR_INPUT_BUCKET>`
- **Output bucket:** `<YOUR_OUTPUT_BUCKET>`
- **Service account (pipeline):** `sports-podcast-sa@<YOUR_PROJECT_ID>.iam.gserviceaccount.com`
- **Service account (frontend):** `vercel-frontend-sa@<YOUR_PROJECT_ID>.iam.gserviceaccount.com`

---

## Project Structure & Navigation Guide

This codebase is divided into two distinct parts: `service/` (Backend) and `frontend/`. 

```text
sports-podcast-service/
├── service/         # FastAPI backend (Deployed via Cloud Build)
│   ├── main.py              # Pipeline orchestration & Eventarc entry point
│   ├── transcriber.py       # Speech-to-Text V2 integration
│   ├── script_synthesis.py  # Gemini 3 Flash logic
│   ├── podcast_synthesis.py # Gemini 2.5 Flash TTS logic
│   ├── storage_actions.py   # GCS upload + idempotency check
│   ├── prompts.py           # System prompts + vocabularies
│   └── cloudbuild.yaml      # CI/CD config
└── frontend/        # React + Vercel app
    ├── api/                 # Vercel Serverless Functions (GCP auth and endpoints)
    │   ├── _gcp-auth.js     # GCP WIF auth helper
    │   ├── upload-url.js    # Generates V4 signed PUT URL
    │   └── status.js        # Checks output bucket for podcast
    └── src/                 # React source code (Components and Hooks)
```

### Backend Coding Style & Conventions
- **Orchestration Pattern:** `main.py` is the single entry point. It handles the Eventarc request, extracts the bucket and blob name, and sequentially calls the processing functions from other modules.
- **Separation of Concerns:** External API calls are strictly modularized. `transcriber.py` handles Speech-to-Text, `script_synthesis.py` handles Vertex AI text generation, `podcast_synthesis.py` handles Vertex AI TTS, and `storage_actions.py` handles GCS operations.
- **Error Handling Strategy:** In `main.py`, all errors (even fatal ones like rate limits or exceptions) are caught and explicitly return an `HTTP 200` status code. This is a deliberate design choice to prevent Eventarc from infinitely retrying failed audio processing jobs.
- **Idempotency:** `storage_actions.py` includes a check against the output bucket to prevent reprocessing the same audio file twice.

### Frontend Architecture & Data Flow
- **Security:** Frontend strictly avoids direct calls to Cloud Run. Vercel serverless functions act as a secure middle layer using **keyless OIDC federation** (Workload Identity Federation) to impersonate the frontend service account. No JSON keys are stored.
- **Upload Flow:** The frontend requests a signed PUT URL from the `/api/upload-url` Vercel function, then uploads the file directly to the `<YOUR_INPUT_BUCKET>`.
- **Status Polling:** The frontend polls `/api/status` to check the `<YOUR_OUTPUT_BUCKET>` for the completed audio file and metadata.
- **UI/UX Guidelines:** The interface uses an Industrial Minimalist design (dark background, light text, monospace fonts for labels, raw horizontal progress bars, no spinners).

---

## Overall Instructions for AI Agents

When contributing to this project, adhere to the following rules:

1. **Keep Backend Modules Focused:** If you need to change how the prompt is structured, edit `prompts.py`. If you need to change the voice, edit `podcast_synthesis.py`. Keep `main.py` purely for orchestration and logging.
2. **Respect the Security Boundary:** Never try to add authentication bypasses or direct Cloud Run invocations in the React frontend. Always route GCP interactions through Vercel serverless functions (`frontend/api/`).
3. **No Unauthenticated Access:** Do not modify the deployment scripts (`cloudbuild.yaml`) to allow unauthenticated access to the Cloud Run service.
4. **Metadata:** The Cloud Run service writes a `_podcast_meta.json` sidecar alongside the audio output. The frontend `status.js` polling route automatically fetches this metadata to supply details like `sport`, `match_title`, and `overview` to the UI.
