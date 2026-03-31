import { useState, useRef } from "react";
import { submitJob, pollJob } from "../utils/api";

export function useMediaJob() {
  const [phase, setPhase] = useState("idle");
  const [jobStatus, setJobStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  async function run(url, operation) {
    setPhase("submitting");
    setError(null);
    setResult(null);
    setJobStatus(null);

    abortRef.current = new AbortController();

    try {
      const { job_id } = await submitJob(url, operation);
      setPhase("polling");

      const final = await pollJob(job_id, (job) => setJobStatus(job), abortRef.current.signal);

      if (final.status === "done") {
        setResult(final);
        setPhase("done");
      } else {
        setError(final.error || "Processing failed — check the URL and format");
        setPhase("error");
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Something went wrong");
        setPhase("error");
      }
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("idle");
    setJobStatus(null);
    setResult(null);
    setError(null);
  }

  return { phase, jobStatus, result, error, run, reset };
}
