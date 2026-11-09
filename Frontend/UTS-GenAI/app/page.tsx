import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
      <div className="max-w-3xl text-center space-y-8">
        
        {/* BADGE TERATAS */}
        <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-sm font-semibold tracking-wide">
          ✨ Adaptive AI Testing Platform
        </div>

        {/* HERO TITLE */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Uji Kemampuanmu dengan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Kuis Adaptif Berbasis AI
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Tingkat kesulitan soal akan menyesuaikan pemahamanmu secara otomatis. 
          Jawab benar untuk naik level, atau dapatkan soal penyesuaian saat kesulitan.
        </p>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-bold text-slate-200 mb-1">Adaptive Level</h3>
            <p className="text-sm text-slate-400">Soal otomatis naik dari Level 1 (Basic) hingga Level 3 (Advanced).</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-slate-200 mb-1">AI Evaluator</h3>
            <p className="text-sm text-slate-400">Penjelasan interaktif dan umpan balik langsung dari Gemini AI.</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold text-slate-200 mb-1">Diagnostic Report</h3>
            <p className="text-sm text-slate-400">Laporan evaluasi lengkap untuk menemukan celah pemahamanmu.</p>
          </div>
        </div>

        {/* CTA BUTTON */}
        <div className="pt-6">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
          >
            Mulai Kuis Adaptif Now →
          </Link>
        </div>

      </div>
    </main>
  );
}