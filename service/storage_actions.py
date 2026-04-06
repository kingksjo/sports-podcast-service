from google.cloud import storage
import os

client = storage.Client()

def upload_podcast(bucket_name: str, blob_name: str, audio_bytes: bytes) -> str:
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_string(audio_bytes, content_type="audio/wav")
    return f"gs://{bucket_name}/{blob_name}"