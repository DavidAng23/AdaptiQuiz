import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_adaptive_question(topic: str, level: int):
    """
    Menghasilkan soal kuis baru secara dinamis berdasarkan topik dan level kesulitan (1-3).
    Menggunakan Structured Output agar format JSON konsisten.
    """
    prompt = (
        f"Buat 1 soal pilihan ganda tentang topik '{topic}' dengan tingkat kesulitan Level {level} "
        f"(1=Basic, 2=Intermediate, 3=Advanced). "
        "Berikan output dalam format JSON dengan struktur: "
        "question_text, options (list 4 pilihan), correct_answer, dan explanation."
    )

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    return response.text