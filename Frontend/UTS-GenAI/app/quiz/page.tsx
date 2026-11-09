"use client";

import { useState, useEffect } from "react";
import { fetchQuizQuestions, submitUserAnswer } from "@/services/api";

export default function QuizPage() {
  // STATE DATA KUIS DARI BACKEND
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // STATE INTERAKSI UI
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  
  // STATE TIMER & PROGRESS
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 detik per soal
  const totalQuestions = questions.length > 0 ? questions.length : 1;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  // 1. AMBIL SOAL DARI BACKEND FASTAPI BERDASARKAN LEVEL
useEffect(() => {
  async function loadQuestions() {
    setLoading(true);
    
    // Karena di database kamu topic_id merepresentasikan level (1=Level 1, 2=Level 2, 3=Level 3)
    // Kirim currentLevel sebagai topic_id dan level-nya
    const data = await fetchQuizQuestions(currentLevel, currentLevel);
    
    if (data && data.length > 0) {
      setQuestions(data);
    } else {
      setQuestions([]);
    }
    setLoading(false);
  }
  loadQuestions();
}, [currentLevel]);

  // 2. EFEK TIMER HITUNG MUNDUR
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && !loading && questions.length > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } 
    else if (timeLeft === 0 && !isSubmitted && questions.length > 0) {
      handleAutoSubmitTimeout();
    }
  }, [timeLeft, isSubmitted, loading, questions]);

  // Penanganan jika waktu habis otomatis
  const handleAutoSubmitTimeout = async () => {
    setIsSubmitted(true);
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      // Kirim jawaban kosong/timeout ke backend
      const result = await submitUserAnswer("user_demo_123", currentQ.id, "", currentLevel);
      setFeedbackData(result);
    }
  };

  // 3. FUNGSI SUBMIT JAWABAN KE BACKEND
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

const handleSubmit = async () => {
  if (!selectedOption || questions.length === 0) return;

  const currentQ = questions[currentIndex];
  setIsSubmitting(true); // Set loading kirim

  // Kirim jawaban ke FastAPI & tunggu hasilnya
  const result = await submitUserAnswer("user_demo_123", currentQ.id, selectedOption, currentLevel);
  setFeedbackData(result);
  
  setIsSubmitting(false);
  setIsSubmitted(true); // Baru tampilkan feedback setelah data fix diterima

  if (result && result.next_level) {
    setCurrentLevel(result.next_level);
  }
};

  // Tombol lanjut ke soal berikutnya atau selesai
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setFeedbackData(null);
      setTimeLeft(60); // Reset timer
    } else {
      // Jika kuis selesai, arahkan ke dashboard
      window.location.href = '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Menghubungkan ke Bank Soal Supabase...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Soal Belum Tersedia</h2>
        <p className="text-slate-400 mb-6">Tidak ada soal untuk Level {currentLevel} pada topik ini.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl font-bold text-white transition"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
      
      {/* HEADER QUIZ: Progress Bar & Timer */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-slate-400">
            Soal {currentIndex + 1} dari {questions.length} (Level {currentLevel})
          </span>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
            timeLeft <= 10 && !isSubmitted ? "text-rose-500 animate-pulse" : "text-slate-300"
          }`}>
            <span>⏱️</span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>
        {/* Progress Bar Line */}
        <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        
        {/* TOPIC & LEVEL BADGE */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Topik Kuis</span>
            <h1 className="text-xl font-bold text-indigo-400">AdaptiQuiz Dynamic Session</h1>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-sm font-semibold">
            Level {currentQ.level || currentLevel}
          </div>
        </div>

        {/* QUESTION TEXT */}
        <div className="mb-8">
          <h2 className="text-lg font-medium leading-relaxed">{currentQ.question_text}</h2>
        </div>

        {/* OPTIONS GROUP */}
        <div className="space-y-3 mb-8">
          {currentQ.options && currentQ.options.map((optText: string, idx: number) => {
            // Ekstraksi huruf opsi jika formatnya "A. Teks..." atau langsung teks
            const optId = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOption === optId;

            return (
              <button
                key={idx}
                onClick={() => !isSubmitted && setSelectedOption(optId)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md"
                    : isSubmitted
                      ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isSelected ? "bg-indigo-500 text-white" : "bg-slate-600 text-slate-300"
                  }`}>
                    {optId}
                  </span>
                  <span>{optText}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK (Muncul setelah klik Submit atau Waktu Habis) */}
        {isSubmitted && (
          <div className="mb-6 p-4 rounded-xl bg-slate-700/70 border border-slate-600 text-slate-200 text-sm animate-in fade-in zoom-in duration-300">
            {timeLeft === 0 && !selectedOption ? (
              <p className="font-semibold text-rose-400 mb-1">⏱️ Waktu Habis!</p>
            ) : feedbackData?.is_correct ? (
              <p className="font-semibold text-emerald-400 mb-1">🎉 Jawaban Benar!</p>
            ) : (
              <p className="font-semibold text-rose-400 mb-1">❌ Jawaban Kurang Tepat.</p>
            )}
            
            {feedbackData && (
              <p className="mt-2 text-slate-300">
                Kunci Jawaban: <b className="text-white">{feedbackData.correct_answer}</b>
              </p>
            )}
            
            <p className="mt-2 text-slate-400 text-xs leading-relaxed border-t border-slate-600 pt-2">
              <b>Penjelasan:</b> {currentQ.explanation || "Tidak ada penjelasan tambahan."}
            </p>
          </div>
        )}

        {/* FOOTER BUTTON */}
        {!isSubmitted ? (
        <button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              selectedOption && !isSubmitting
                ? "bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer shadow-lg shadow-indigo-500/25"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Memeriksa Jawaban..." : "Kirim Jawaban"}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-500/25 transition-all"
          >
            {currentIndex + 1 < questions.length ? "Soal Berikutnya →" : "Selesaikan Kuis & Lihat Hasil →"}
          </button>
        )}

      </div>
    </div>
  );
}