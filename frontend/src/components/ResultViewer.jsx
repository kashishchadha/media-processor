import { fileUrl } from "../utils/api";

const icons = {
  thumbnail:     "🖼",
  compress:      "🎬",
  extract_audio: "🎵",
};

const labels = {
  thumbnail:     "Thumbnail",
  compress:      "Compressed Video",
  extract_audio: "Extracted Audio",
};

export default function ResultViewer({ result }) {
  if (!result) return null;

  const url = fileUrl(result.output);
  const op = result.operation;

  return (
    <div className="animate-slide-up mt-6 bg-white rounded-2xl shadow-lifted overflow-hidden border border-cream-200">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icons[op]}</span>
          <span className="font-display font-600 text-ink-900 text-sm">{labels[op]}</span>
        </div>
        <a
          href={url}
          download
          className="flex items-center gap-1.5 text-xs font-medium text-signal bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-full"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download
        </a>
      </div>

      <div className="p-5 bg-cream-50">
        {op === "thumbnail" && (
          <img
            src={url}
            alt="Extracted thumbnail"
            className="max-w-full rounded-xl border border-cream-200 shadow-card"
          />
        )}

        {op === "compress" && (
          <video
            src={url}
            controls
            className="max-w-full w-full rounded-xl border border-cream-200 shadow-card"
          />
        )}

        {op === "extract_audio" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-cream-200 shadow-card">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg shrink-0">🎵</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">audio.mp3</p>
                <p className="text-xs text-ink-300">MP3 · 192kbps · 44.1kHz</p>
              </div>
            </div>
            <audio src={url} controls className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
