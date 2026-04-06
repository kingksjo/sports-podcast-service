import wave
import os
from google import genai
from google.genai import types

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "global")

def produce_audio(script: str) -> bytes:
    client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

    prompt = (
        "Read the following sports podcast script aloud. "
        "You are a composed, authoritative sports journalist. "
        "Your tone is engaged but never excitable — collected, confident, and clear. "
        "Speak at a natural podcast pace."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-tts",
        contents=f"{prompt}: {script}",
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Leda"
                    )
                )
            ),
        ),
    )

    pcm_data = response.candidates[0].content.parts[0].inline_data.data
    return _pcm_to_wav(pcm_data)

def _pcm_to_wav(pcm_data: bytes, channels=1, rate=24000, sample_width=2) -> bytes:
    import io
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm_data)
    return buffer.getvalue()