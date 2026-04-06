from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech
import os

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")

def transcribe_audio(gcs_uri: str) -> str:
    client = SpeechClient()

    config = cloud_speech.RecognitionConfig(
        auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
        language_codes=["en-US"],
        model="chirp_3",
    )

    request = cloud_speech.RecognizeRequest(
        recognizer=f"projects/{PROJECT_ID}/locations/global/recognizers/_",
        config=config,
        uri=gcs_uri,
    )

    response = client.recognize(request=request)

    transcript = " ".join(
        result.alternatives[0].transcript
        for result in response.results
    )

    return transcript