import json
import os
from google import genai
from google.genai import types
from prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

def generate_script(transcript: str) -> dict:
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=USER_PROMPT_TEMPLATE.format(transcript=transcript),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            thinking_config=types.ThinkingConfig(
                thinking_level=types.ThinkingLevel.LOW
            ),
        ),
    )

    raw = response.text.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)

    return parsed