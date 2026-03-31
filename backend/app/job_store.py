import threading
from typing import Optional


class JobStore:
    def __init__(self):
        self._jobs: dict = {}
        self._lock = threading.Lock()

    def create(self, job_id: str):
        with self._lock:
            self._jobs[job_id] = {"job_id": job_id, "status": "queued", "output": None, "error": None, "operation": None}

    def get(self, job_id: str) -> Optional[dict]:
        with self._lock:
            return self._jobs.get(job_id)

    def set_status(self, job_id: str, status: str):
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]["status"] = status

    def set_result(self, job_id: str, output_url: str, operation: str):
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]["status"] = "done"
                self._jobs[job_id]["output"] = output_url
                self._jobs[job_id]["operation"] = operation

    def set_error(self, job_id: str, message: str):
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id]["status"] = "error"
                self._jobs[job_id]["error"] = message


job_store = JobStore()
