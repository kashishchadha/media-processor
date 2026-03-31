import asyncio
import subprocess
from pathlib import Path


FFMPEG_TIMEOUT = 120


async def run_ffmpeg_operation(operation: str, input_path: Path, output_dir: Path, job_id: str) -> Path:
    if operation == "thumbnail":
        return await extract_thumbnail(input_path, output_dir, job_id)
    elif operation == "compress":
        return await compress_video(input_path, output_dir, job_id)
    elif operation == "extract_audio":
        return await extract_audio(input_path, output_dir, job_id)
    else:
        raise ValueError(f"Unknown operation: {operation}")


def _run_subprocess(cmd: list[str]) -> None:
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=FFMPEG_TIMEOUT,
            check=False,
        )
        if result.returncode != 0:
            err = result.stderr.decode("utf-8", errors="replace")
            raise RuntimeError(f"FFmpeg error (code {result.returncode}): {err[-500:]}")
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"FFmpeg timed out after {FFMPEG_TIMEOUT} seconds")
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not found. Make sure it is installed and in PATH.")


async def extract_thumbnail(input_path: Path, output_dir: Path, job_id: str) -> Path:
    output_path = output_dir / f"{job_id}_thumb.jpg"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-ss", "00:00:02",
        "-vframes", "1",
        "-q:v", "2",
        str(output_path),
    ]
    await asyncio.to_thread(_run_subprocess, cmd)
    if not output_path.exists():
        raise RuntimeError("Thumbnail extraction failed — output file not created")
    return output_path


async def compress_video(input_path: Path, output_dir: Path, job_id: str) -> Path:
    output_path = output_dir / f"{job_id}_compressed.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vcodec", "libx264",
        "-crf", "28",
        "-preset", "fast",
        "-acodec", "aac",
        "-b:a", "128k",
        str(output_path),
    ]
    await asyncio.to_thread(_run_subprocess, cmd)
    if not output_path.exists():
        raise RuntimeError("Video compression failed — output file not created")
    return output_path


async def extract_audio(input_path: Path, output_dir: Path, job_id: str) -> Path:
    output_path = output_dir / f"{job_id}_audio.mp3"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "192k",
        "-ar", "44100",
        str(output_path),
    ]
    await asyncio.to_thread(_run_subprocess, cmd)
    if not output_path.exists():
        raise RuntimeError("Audio extraction failed — output file not created")
    return output_path
