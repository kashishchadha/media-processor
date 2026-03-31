const BASE = import.meta.env.VITE_API_URL;

export async function submitJob(url, operation) {
  const res = await fetch(`${BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, operation }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function pollJob(jobId, onStatus, signal) {
  while (true) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");

    const res = await fetch(`${BASE}/status/${jobId}`, { signal });
    if (!res.ok) throw new Error(`Status check failed (${res.status})`);

    const job = await res.json();
    onStatus(job);

    if (job.status === "done" || job.status === "error") return job;
    await new Promise((r) => setTimeout(r, 1500));
  }
}

export function fileUrl(path) {
  return `${BASE}${path}`;
}
