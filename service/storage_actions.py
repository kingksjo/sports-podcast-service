from google.cloud import storage
import os

client = storage.Client()

def get_output_blob_name(input_blob_name: str) -> str:
    """Convert input blob name to output podcast blob name."""
    return input_blob_name.replace(".mp3", "_podcast.wav")

def podcast_already_exists(bucket_name: str, blob_name: str) -> bool:
    """Check if a podcast output file has already been processed."""
    output_blob_name = get_output_blob_name(blob_name)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(output_blob_name)
    return blob.exists()

def upload_podcast(bucket_name: str, blob_name: str, audio_bytes: bytes) -> str:
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_string(audio_bytes, content_type="audio/wav")
    return f"gs://{bucket_name}/{blob_name}"