from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import generate_adaptive_question
from database import supabase
from adaptive_logic import calculate_next_level
from pydantic import BaseModel

app = FastAPI(title="AdaptiQuiz API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerSubmit(BaseModel):
    user_id: str
    question_id: int
    user_answer: str
    current_level: int

@app.get("/")
def read_root():
    return {"message": "AdaptiQuiz Backend is running!"}


@app.get("/api/quiz/generate")
def get_question(topic: str, level: int):
    question_json = generate_adaptive_question(topic, level)
    return {"data": question_json}


@app.get("/api/quiz/questions")
def get_questions(topic_id: int, level: int):
    try:
        # Mengambil soal berdasarkan topic_id dan level dari Supabase
        response = supabase.table("questions").select("*").eq("topic_id", topic_id).eq("level", level).execute()
        return {"data": response.data}
    except Exception as e:
        print(f"Error mengambil soal: {e}")
        return {"data": []}


@app.post("/api/quiz/submit")
def submit_answer(data: AnswerSubmit):
    try:
        # 1. Ambil soal dan kunci jawaban dari database Supabase
        q_res = supabase.table("questions").select("*").eq("id", data.question_id).execute()
        if not q_res.data:
            return {"error": "Soal tidak ditemukan", "is_correct": False, "correct_answer": "Soal Kosong"}
        
        question_row = q_res.data[0]
        correct_answer = question_row.get("correct_answer", "")
        
        # 2. Logika Pencocokan Cerdas (Mendukung Huruf atau Teks Utuh)
        user_ans = str(data.user_answer).strip().lower()
        db_ans = str(correct_answer).strip().lower()
        
        is_correct = (
            user_ans == db_ans or 
            db_ans.startswith(user_ans + ".") or 
            db_ans.startswith(user_ans + ")") or
            db_ans.startswith(user_ans + " ")
        )

        # 3. Coba simpan ke tabel user_attempts (Gunakan try-catch agar jika tabel/kolom beda tidak bikin crash)
        try:
            supabase.table("user_attempts").insert({
                "user_id": str(data.user_id),
                "question_id": data.question_id,
                "is_correct": bool(is_correct)
            }).execute()
        except Exception as db_err:
            print(f"Info Warning (Database Insert): {db_err}")

        # 4. Ambil riwayat dengan aman untuk level adaptif
        try:
            history_res = supabase.table("user_attempts") \
                .select("is_correct") \
                .eq("user_id", str(data.user_id)) \
                .execute()
            all_attempts = history_res.data if history_res.data else []
            recent_answers = [row["is_correct"] for row in all_attempts[-3:]]
        except:
            recent_answers = [is_correct]

        next_level = calculate_next_level(data.current_level, recent_answers)

        return {
            "is_correct": is_correct,
            "correct_answer": correct_answer,
            "next_level": next_level
        }
        
    except Exception as e:
        print(f"❌ ERROR KRITIS DI SUBMIT: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "is_correct": False,
            "correct_answer": "Sistem Error",
            "next_level": data.current_level
        }

@app.get("/api/quiz/report/{user_id}")
def get_user_report(user_id: str):
    attempts = supabase.table("user_attempts").select("is_correct").eq("user_id", user_id).execute()
    data = attempts.data
    
    total_answered = len(data)
    if total_answered == 0:
        return {
            "final_score": 0,
            "final_level": 1,
            "level_name": "Beginner",
            "total_questions": 0,
            "correct_answers": 0,
            "strengths": ["Belum ada data"],
            "weaknesses": ["Belum ada data"],
            "ai_feedback": "Silakan selesaikan sesi kuis terlebih dahulu untuk melihat hasil analisis."
        }
    
    total_correct = sum(1 for row in data if row["is_correct"])
    score = int((total_correct / total_answered) * 100)
    level = min(3, max(1, total_correct // 2 + 1))
    level_name = "Advanced" if level == 3 else ("Intermediate" if level == 2 else "Beginner")
    
    return {
        "final_score": score,
        "final_level": level,
        "level_name": level_name,
        "total_questions": total_answered,
        "correct_answers": total_correct,
        "strengths": ["Pemahaman logika dasar kuis", "Ketepatan menjawab soal"],
        "weaknesses": ["Perlu eksplorasi tingkat lanjut"],
        "ai_feedback": f"Kerja bagus! Kamu berhasil menjawab {total_correct} dari {total_answered} soal dengan akurasi skor {score}%. Terus tingkatkan kemampuanmu ke level berikutnya!"
    }