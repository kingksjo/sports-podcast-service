import os
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from transcriber import transcribe_audio
from script_synthesis import generate_script
from podcast_synthesis import produce_audio
from storage_actions import upload_podcast, podcast_already_exists, get_output_blob_name

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

INPUT_BUCKET = os.getenv("INPUT_BUCKET")
OUTPUT_BUCKET = os.getenv("OUTPUT_BUCKET")

@app.post("/")
async def handle_event(request: Request):
    try:
        body = await request.json()
        
        # Extract file details from Eventarc payload
        bucket_name = body["bucket"]
        blob_name = body["name"]
        
        logger.info(f"Processing file: {blob_name} from bucket: {bucket_name}")
        
        # Idempotency check — skip if already processed
        if podcast_already_exists(bucket_name, blob_name):
            logger.info(f"Already processed: {blob_name}, skipping.")
            return {"status": "skipped", "reason": "already processed"}
        
        # Step 1 & 2 — construct GCS URI and transcribe directly
        gcs_uri = f"gs://{bucket_name}/{blob_name}"
        transcript = transcribe_audio(gcs_uri)
        logger.info(f"Transcription complete: {len(transcript)} characters")
        
        # Step 3 — generate script via Gemini (sport inference + script in one call)
        result = generate_script(transcript)
        sport = result.get("sport", "unknown")
        script = result.get("script", "")
        overview = result.get("overview", "")
        match_title = result.get("match_title", "")
        logger.info(f"Script generated for sport: {sport}")
        
        # Step 4 — produce podcast audio
        audio_bytes_out = produce_audio(script)
        logger.info("Podcast audio produced")
        
        # Step 5 — upload to output bucket
        output_blob_name = get_output_blob_name(blob_name)
        podcast_url = upload_podcast(OUTPUT_BUCKET, output_blob_name, audio_bytes_out)
        logger.info(f"Podcast uploaded to: {podcast_url}")
        
        return {
            "status": "success",
            "sport": sport,
            "match_title": match_title,
            "overview": overview,
            "podcast_url": podcast_url,
        }
        
    except KeyError as e:
        logger.error(f"Missing field in event payload: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid event payload: {e}")
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}