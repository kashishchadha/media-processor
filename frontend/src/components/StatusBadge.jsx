const config = {
  queued:      { label: "Queued",           color: "bg-cream-200 text-ink-500" },
  downloading: { label: "Downloading...",   color: "bg-blue-50 text-blue-600",  pulse: true },
  processing:  { label: "Processing...",    color: "bg-amber-50 text-amber-600", pulse: true },
  done:        { label: "Complete",         color: "bg-green-50 text-success" },
  error:       { label: "Failed",           color: "bg-red-50 text-danger" },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const { label, color, pulse } = config[status] || { label: status, color: "bg-cream-200 text-ink-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
