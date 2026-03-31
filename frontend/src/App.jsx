import { useState } from "react";
import { useMediaJob } from "./hooks/useMediajob";
import StatusBadge from "./components/StatusBadge";
import ResultViewer from "./components/ResultViewer";

const OPERATIONS = [
  {
    value: "thumbnail",
    label: "Thumbnail",
    desc: "Extract a frame at ~2 seconds",
    icon: "🖼",
  },
  {
    value: "compress",
    label: "Compress",
    desc: "Shrink with H.264 + AAC",
    icon: "📦",
  },
  {
    value: "extract_audio",
    label: "Extract Audio",
    desc: "Rip audio track as MP3",
    icon: "🎵",
  },
];

const PHASE_MESSAGES = {
  submitting: "Submitting job...",
  queued: "Waiting in queue...",
  downloading: "Downloading media from URL...",
  processing: "Running FFmpeg...",
  success: "Finalizing...",
  done: "Finalizing...",
};

export default function App() {
  const [url, setUrl] = useState("");
  const [operation, setOperation] = useState("thumbnail");
  const { phase, jobStatus, result, error, run, reset } = useMediaJob();

  const isRunning = phase === "submitting" || phase === "polling";
  const statusLabel = jobStatus ? PHASE_MESSAGES[jobStatus.status] : PHASE_MESSAGES[phase];

  let progress = 0;
  if (phase === "submitting") progress = 10;
  else if (jobStatus?.status === "queued") progress = 15;
  else if (jobStatus?.status === "downloading") progress = 35;
  else if (jobStatus?.status === "processing") progress = 70;
  else if (phase === "done" || jobStatus?.status === "success" || jobStatus?.status === "done") progress = 100;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    run(trimmed, operation);
  }

  function handleReset() {
    setUrl("");
    reset();
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <header className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-700 text-ink-900 text-base tracking-tight">MediaForge</span>
          </div>
          <span className="text-xs text-ink-300 font-sans hidden sm:block">FFmpeg · FastAPI · React</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-xl">

          <div className="mb-8">
            <h1 className="font-display text-4xl font-800 text-ink-900 leading-[1.15] tracking-tight">
              Media processing,<br />
              <span className="text-signal">without the hassle.</span>
            </h1>
            <p className="text-ink-500 text-sm mt-3 font-sans leading-relaxed">
              Paste a direct video URL, pick an operation, and get your output in seconds.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-700 uppercase tracking-wide">
                  Media URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    disabled={isRunning}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all disabled:opacity-50 font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-700 uppercase tracking-wide">
                  Operation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATIONS.map((op) => {
                    const active = operation === op.value;
                    return (
                      <button
                        key={op.value}setOperation
                        type="button"
                        disabled={isRunning}
                        onClick={() => setOperation(op.value)}
                        className={`flex flex-col items-start gap-1 px-3.5 py-3 rounded-xl border text-left transition-all disabled:opacity-50 ${
                          active
                            ? "border-signal bg-blue-50 ring-2 ring-signal/10"
                            : "border-cream-300 bg-cream-50 hover:bg-cream-100 hover:border-cream-400"
                        }`}
                      >
                        <span className="text-base">{op.icon}</span>
                        <span className={`text-xs font-semibold ${active ? "text-signal" : "text-ink-700"}`}>
                          {op.label}
                        </span>
                        <span className="text-[10px] text-ink-300 leading-tight font-sans">{op.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isRunning || !url.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-button transition-all disabled:opacity-40 disabled:cursor-not-allowed font-sans"
                >
                  {isRunning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" />
                      {statusLabel || "Processing..."}
                    </>
                  ) : (
                    <>
                      Process
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>

                {phase !== "idle" && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 border border-cream-300 rounded-xl text-ink-500 text-sm font-medium hover:bg-cream-100 hover:text-ink-700 transition-colors font-sans"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {isRunning && (
            <div className="animate-fade-in mt-4 flex flex-col gap-3 p-4 bg-white rounded-xl border border-cream-200 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={jobStatus ? jobStatus.status : "submitting"} />
                  <span className="text-xs text-ink-500 font-sans">{statusLabel || "Processing..."}</span>
                </div>
                <span className="text-xs font-bold text-ink-700 font-sans">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-cream-100 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-signal transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="animate-slide-up mt-4 flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-4 h-4 text-danger mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-danger text-sm font-sans leading-relaxed">{error}</p>
            </div>
          )}

          <ResultViewer result={result} />

          <div className="mt-8 p-4 bg-cream-200/60 rounded-xl border border-cream-300">
            <p className="text-xs font-semibold text-ink-700 mb-2">Try a sample URL</p>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setUrl("https://www.w3schools.com/html/mov_bbb.mp4")}
              className="text-xs text-signal hover:underline font-sans disabled:opacity-40"
            >
              https://www.w3schools.com/html/mov_bbb.mp4
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-cream-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-xs text-ink-300 font-sans">MediaForge — Media Processing App</span>
          <span className="text-xs text-ink-300 font-sans">Python · FFmpeg · React</span>
        </div>
      </footer>
    </div>
  );
}