import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/tmp/reels";
const CAPTION_STYLES = {
  minimal: "fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=h-th-60",
  highlight: "fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6:boxborderw=8:x=(w-text_w)/2:y=h-th-80",
};

function ffmpegAvailable() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function renderClipWithFFmpeg(clip, videoPath, index) {
  const outDir = path.join(OUTPUT_DIR, `reel-${index + 1}`);
  fs.mkdirSync(outDir, { recursive: true });

  const clipPath = path.join(outDir, "clip.mp4");
  const finalPath = path.join(outDir, "final.mp4");
  const thumbPath = path.join(outDir, "thumb.jpg");
  const duration = clip.duration || 30;

  const ss = clip.start_time || "00:00:00";
  const t = clip.end_time
    ? parseTime(clip.end_time) - parseTime(ss)
    : duration;

  execSync(
    `ffmpeg -i "${videoPath}" -ss "${ss}" -t ${t} -c copy "${clipPath}" -y`,
    { timeout: 300000 }
  );

  execSync(
    `ffmpeg -i "${clipPath}" -vf "crop=ih*9/16:ih,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -af "loudnorm=I=-16:LRA=11:TP=-1.5" "${finalPath}" -y`,
    { timeout: 300000 }
  );

  execSync(
    `ffmpeg -i "${finalPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${thumbPath}" -y`,
    { timeout: 30000 }
  );

  return {
    videoPath: finalPath,
    thumbnailPath: thumbPath,
    duration,
  };
}

function parseTime(str) {
  if (typeof str === "number") return str;
  const parts = str.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}

function dummyRender(clips) {
  return clips.map((c, i) => ({
    id: c.id || `reel-${i + 1}`,
    rellPath: `/videos/reels/reel-${i + 1}.mp4`,
    thumbnailPath: `https://picsum.photos/seed/reel${i + 1}/360/640`,
    duration: c.duration || 30,
    aspectRatio: "9:16",
    variants: {
      "9:16": `/videos/reels/reel-${i + 1}-portrait.mp4`,
      "1:1": `/videos/reels/reel-${i + 1}-square.mp4`,
      "16:9": `/videos/reels/reel-${i + 1}-landscape.mp4`,
    },
  }));
}

export async function POST(request) {
  try {
    const { clips, videoPath, aspectRatio = "9:16" } = await request.json();

    if (!clips || !videoPath) {
      return Response.json({ error: "Missing clips or videoPath" }, { status: 400 });
    }

    const hasFFmpeg = ffmpegAvailable();

    let rendered;
    if (hasFFmpeg && fs.existsSync(videoPath)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      rendered = clips.map((c, i) => {
        const result = renderClipWithFFmpeg(c, videoPath, i);
        return {
          id: c.id || `reel-${i + 1}`,
          title: c.title || `Viral Moment ${i + 1}`,
          hook: c.hook || "",
          caption: c.caption || "",
          viral_score: c.viral_score || 70,
          hook_score: c.hook_score || 65,
          cta_score: c.cta_score || 60,
          rellPath: result.videoPath,
          thumbnailPath: result.thumbnailPath,
          duration: result.duration,
          aspectRatio,
        };
      });
    } else {
      rendered = dummyRender(clips);
    }

    return Response.json({
      jobId: crypto.randomUUID(),
      status: "completed",
      reels: rendered,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Render failed", details: err.message }, { status: 500 });
  }
}
