"""Build the exploded-phone hero loop from the exploded-view plate.

The plate holds five components separated by black gaps, plus a spotlight haze
on the left. We analyse only the clean horizontal window, crop each component
band, and slide the bands outward on a cosine curve. Cosine offsets repeat
exactly at the loop boundary, so the first and last frame match and playback
never shows a cut.
"""

from __future__ import annotations

import math
import subprocess
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover - installed on demand
    subprocess.run(
        ["python3", "-m", "pip", "install", "--break-system-packages", "--quiet", "pillow"],
        check=False,
    )
    from PIL import Image

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
PLATE = ROOT / "public" / "images" / "exploded-phone.jpg"
OUT = ROOT / "public" / "videos" / "explosion.mp4"
POSTER = ROOT / "public" / "images" / "hero-exploded-poster.jpg"

DURATION = 9.0
FPS = 25
WIDTH = 1280
CROP_X = 450
CROP_W = 1110
THRESHOLD = 40
MAX_GAP = 8
MIN_HEIGHT = 40
PAD = 18
# The plate is drawn back toward its centre so the outer components have room
# to travel without clipping the frame edge.
SCALE = 0.88
BASE_TRAVEL = 26
TRAVEL_RANGE = 120


def band_rows(image: Image.Image) -> tuple[list[tuple[int, int]], int, int]:
    gray = image.convert("L")
    width, height = gray.size
    pixels = gray.load()
    lit: list[bool] = []
    for y in range(height):
        count = 0
        for x in range(CROP_X, CROP_X + CROP_W, 4):
            if pixels[x, y] > THRESHOLD:
                count += 1
        lit.append(count > 2)

    segments: list[list[int]] = []
    start: int | None = None
    for y, on in enumerate(lit):
        if on and start is None:
            start = y
        elif not on and start is not None:
            segments.append([start, y])
            start = None
    if start is not None:
        segments.append([start, height])

    merged: list[list[int]] = []
    for segment in segments:
        if merged and segment[0] - merged[-1][1] <= MAX_GAP:
            merged[-1][1] = segment[1]
        else:
            merged.append(segment)

    bands = [(a, b) for a, b in merged if b - a >= MIN_HEIGHT]
    if len(bands) < 3:
        raise SystemExit(f"expected at least 3 component bands, found {len(bands)}: {bands}")
    return bands, width, height


def padded(start: int, end: int, height: int) -> tuple[int, int]:
    top = max(0, start - PAD)
    bottom = min(height, end + PAD)
    return top, bottom


def main() -> None:
    plate = Image.open(PLATE).convert("RGB")
    bands, width, height = band_rows(plate)
    print(f"plate {width}x{height}")
    print("bands", [(a, b, b - a) for a, b in bands])

    center = height / 2

    def shrink(value: float) -> float:
        return center + (value - center) * SCALE

    top_margin = shrink(bands[0][0])
    bottom_margin = height - shrink(bands[-1][1])
    span = max(abs(bands[0][0] - center), abs(bands[-1][1] - center)) or 1
    cap = min(top_margin, bottom_margin) - 20
    print("scaled margins", round(top_margin, 1), round(bottom_margin, 1), "cap", round(cap, 1))

    offsets: list[float] = []
    phases: list[float] = []
    for start, end in bands:
        mid = (start + end) / 2
        rel = abs(mid - center) / span
        direction = -1 if mid < center else 1
        amp = BASE_TRAVEL + TRAVEL_RANGE * rel
        amp = max(-cap, min(cap, direction * amp))
        offsets.append(amp)
        phases.append(rel * math.pi / 2)
    print("offsets", [round(value, 1) for value in offsets])

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    print(subprocess.run([ffmpeg, "-version"], capture_output=True, text=True).stdout.splitlines()[0])

    splits = len(bands)
    filters: list[str] = [f"[1:v]split={splits}" + "".join(f"[b{i}]" for i in range(splits))]
    crops: list[tuple[int, int]] = []
    for i, (start, end) in enumerate(bands):
        top, bottom = padded(start, end, height)
        crops.append((top, bottom))
        filters.append(
            f"[b{i}]crop=w={CROP_W}:h={bottom - top}:x={CROP_X}:y={top},"
            f"scale=iw*{SCALE}:ih*{SCALE}:flags=lanczos,format=rgba[c{i}]"
        )

    previous = "[0:v]"
    for i, ((top, bottom), amp, phase) in enumerate(zip(crops, offsets, phases)):
        tilt = 0.025 if amp >= 0 else -0.025
        rotation = f"{tilt:.4f}*(1-cos(2*PI*t/{DURATION}))"
        y_expr = f"{shrink(top)}+{amp:.2f}*(1-cos(2*PI*t/{DURATION}))/2"
        x_expr = f"{shrink(CROP_X)}+{10 * math.sin(phase):.2f}*sin(2*PI*t/{DURATION})"
        filters.append(f"[c{i}]rotate='{rotation}':c=black[r{i}]")
        output = "[voutpre]" if i == splits - 1 else f"[ov{i}]"
        filters.append(f"{previous}[r{i}]overlay=x='{x_expr}':y='{y_expr}':eval=frame{output}")
        previous = output

    output_height = int(round(height * (WIDTH / width) / 2)) * 2
    filters.append(f"[voutpre]scale={WIDTH}:{output_height}:flags=lanczos[vout]")
    filter_complex = ";".join(filters)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-f", "lavfi",
        "-i", f"color=black:s={width}x{height}:r={FPS}:d={DURATION}",
        "-loop", "1",
        "-framerate", str(FPS),
        "-i", str(PLATE),
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-t", str(DURATION),
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "30",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        str(OUT),
    ]
    print("encoding…")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr[-4000:])
        raise SystemExit("ffmpeg failed")
    print("wrote", OUT, OUT.stat().st_size)

    poster = subprocess.run(
        [ffmpeg, "-y", "-ss", "0", "-i", str(OUT), "-frames:v", "1", "-q:v", "4", str(POSTER)],
        capture_output=True,
        text=True,
    )
    if poster.returncode != 0:
        print(poster.stderr[-1500:])
        raise SystemExit("poster frame failed")
    print("poster", POSTER, POSTER.stat().st_size)


if __name__ == "__main__":
    main()
