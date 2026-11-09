"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUserReport } from "@/services/api";

export default function DashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil data laporan dari backend saat halaman dimuat
  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      // Menggunakan "user_demo_123" sesuai dengan identitas user demo di kuis
      const data = await fetchUserReport("user_demo_123");
      if (data) {
        setReport(data);
      }
      setLoading(false);
    }
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Menganalisis hasil kuis dari database...</p>
      </div>
    );
  }

  // Fallback jika report kosong
  const reportData = report || {
    score: 0,
    level: 1,
    level_name: "Beginner",
    total_answered: 0,
    total_correct: 0,
    strengths: ["Belum ada data kekuatan"],
    weaknesses: ["Belum ada data kelemahan"],
    ai_feedback: "Selesaikan kuis terlebih dahulu untuk melihat analisis diagnostik dari sistem."
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Diagnostic Report</h1>
          <p className="text-slate-400">Hasil evaluasi kuis adaptifmu telah selesai dianalisis.</p>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Skor Akhir</span>
            <div className="text-5xl font-bold text-indigo-400">
              {reportData.score ?? reportData.final_score ?? 0}
              <span className="text-2xl text-slate-500">/100</span>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Level Tercapai</span>
            <div className="text-3xl font-bold text-emerald-400">
              Level {reportData.level ?? reportData.final_level ?? 1}
            </div>
            <div className="text-emerald-500/70 text-sm font-medium mt-1">
              {reportData.level_name || "Adaptive Level"}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col items-center justify-center">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Akurasi</span>
            <div className="text-3xl font-bold text-sky-400">
              {reportData.total_correct ?? reportData.correct_answers ?? 0}{" "}
              <span className="text-lg text-slate-500">
                dari {reportData.total_answered ?? reportData.total_questions ?? 0} Benar
              </span>
            </div>
          </div>
        </div>

        {/* AI FEEDBACK SECTION */}
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-bold text-indigo-300">Analisis Gemini AI</h2>
          </div>
          <p className="text-indigo-100/80 leading-relaxed text-lg">
            &ldquo;{reportData.ai_feedback || reportData.analysis}&rdquo;
          </p>
        </div>

        {/* STRENGTHS & WEAKNESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <span>✓</span> Kekuatan Utama
            </h3>
            <ul className="space-y-3">
              {(reportData.strengths || ["Konsistensi pengerjaan soal dasar"]).map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
              <span>🎯</span> Area Peningkatan
            </h3>
            <ul className="space-y-3">
              {(reportData.weaknesses || ["Tingkatkan ketelitian pada level lanjutan"]).map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/quiz" className="px-8 py-4 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition-all text-center">
            ↻ Ulangi Kuis
          </Link>
          <Link href="/" className="px-8 py-4 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all text-center">
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}