import os
import uuid
import asyncio
import httpx
import yt_dlp
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl

from app.processor import run_ffmpeg_operation
from app.job_store import job_store


TEMP_DIR = Path("temp_files")
TEMP_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    for f in TEMP_DIR.glob("*"):
        try:
            f.unlink()
        except Exception:
            pass


app = FastAPI(title="MediaForge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory=str(TEMP_DIR)), name="files")


class ProcessRequest(BaseModel):
    url: str
    operation: str


def _download_with_ytdlp(url: str, dest: Path) -> None:
    ydl_opts = {
        'format': 'best',
        'outtmpl': str(dest),
        'quiet': True,
        'noplaylist': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        result = ydl.download([url])
        if result != 0:
            raise Exception("yt-dlp failed to download the video")

async def download_media(url: str, dest: Path) -> None:
    supported_platforms = [
        "youtube.com", "youtu.be", "vimeo.com", "tiktok.com", 
        "twitter.com", "x.com", "instagram.com", "twitch.tv", 
        "reddit.com", "facebook.com"
    ]
    
    if any(domain in url for domain in supported_platforms):
        await asyncio.to_thread(_download_with_ytdlp, url, dest)
        return

    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        async with client.stream("GET", url) as response:
            response.raise_for_status()
            with open(dest, "wb") as f:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    f.write(chunk)


async def process_job(job_id: str, url: str, operation: str):
    job_store.set_status(job_id, "downloading")

    suffix_map = {
        "thumbnail": ".mp4",
        "compress": ".mp4",
        "extract_audio": ".mp4",
    }
    input_suffix = suffix_map.get(operation, ".mp4")
    input_path = TEMP_DIR / f"{job_id}_input{input_suffix}"

    try:
        await download_media(url, input_path)
    except Exception as e:
        job_store.set_error(job_id, f"Failed to download media: {str(e)}")
        return

    job_store.set_status(job_id, "processing")

    try:
        output_path = await run_ffmpeg_operation(operation, input_path, TEMP_DIR, job_id)
        relative = output_path.name
        job_store.set_result(job_id, f"/files/{relative}", operation)
    except Exception as e:
        job_store.set_error(job_id, str(e))
    finally:
        if input_path.exists():
            input_path.unlink()


@app.post("/process")
async def process(req: ProcessRequest, background_tasks: BackgroundTasks):
    if req.operation not in ("thumbnail", "compress", "extract_audio"):
        raise HTTPException(status_code=400, detail="Invalid operation. Use: thumbnail, compress, extract_audio")

    job_id = str(uuid.uuid4())
    job_store.create(job_id)
    background_tasks.add_task(process_job, job_id, req.url, req.operation)

    return {"job_id": job_id, "status": "queued"}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job