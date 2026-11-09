const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Mengambil daftar soal berdasarkan topik dan level dari FastAPI
export async function fetchQuizQuestions(topicId, level) {
  try {
    const response = await fetch(`${API_URL}/api/quiz/questions?topic_id=${topicId}&level=${level}`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Gagal mengambil soal:", error);
    return [];
  }
}

// Mengirim jawaban pengguna ke backend FastAPI
export async function submitUserAnswer(userId, questionId, userAnswer, currentLevel) {
  try {
    const response = await fetch(`${API_URL}/api/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        question_id: questionId,
        user_answer: userAnswer,
        current_level: currentLevel,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Gagal mengirim jawaban:", error);
    return null;
  }
}

// Mengambil laporan hasil kuis pengguna
export async function fetchUserReport(userId) {
  try {
    const response = await fetch(`${API_URL}/api/quiz/report/${userId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gagal mengambil report:", error);
    return null;
  }
}