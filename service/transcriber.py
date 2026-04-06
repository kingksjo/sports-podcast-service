from google.cloud.speech_v2 import SpeechClient, RecognitionOutputConfig, InlineOutputConfig
from google.api_core.client_options import ClientOptions
from google.cloud.speech_v2.types import cloud_speech
import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
MAX_AUDIO_LENGTH_SECS = 8 * 60 * 60

def transcribe_audio(gcs_uri: str) -> str:
    client = SpeechClient(client_options=ClientOptions(
          api_endpoint="us-speech.googleapis.com",
      ),)

    config = cloud_speech.RecognitionConfig(
        auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
        language_codes=["en-US"],
        model="chirp_3",
    )

    files = [cloud_speech.BatchRecognizeFileMetadata(uri=gcs_uri)]

    output_config = RecognitionOutputConfig(
        inline_response_config=InlineOutputConfig()
)

    request = cloud_speech.BatchRecognizeRequest(
        recognizer=f"projects/{PROJECT_ID}/locations/us/recognizers/_",
        config=config,
        files=files,
        recognition_output_config=output_config,
    )

    operation = client.batch_recognize(request=request)
    print("Waiting for operation to complete...")
    response = operation.result(timeout=3 * MAX_AUDIO_LENGTH_SECS)

    transcript_parts = []

    for result in response.results[gcs_uri].transcript.results:
         transcript_parts.append(result.alternatives[0].transcript)


    full_transcript = " ".join(transcript_parts)
    return full_transcript