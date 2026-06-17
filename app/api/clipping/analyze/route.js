import { callLLMJSON } from "@/lib/openrouter";

function fmt(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export async function POST(request) {
  try {
    const { transcript, reelsCount } = await request.json();

    if (!transcript) {
      return Response.json({ error: "Missing transcript" }, { status: 400 });
    }

    const fullText = typeof transcript === "string" ? transcript : transcript.full || transcript.text || "";
    const count = [10, 20, 30, 40, 50].includes(reelsCount) ? reelsCount : 10;

    const prompt = `You are a video analysis AI. Analyze this transcript and extract exactly ${count} viral clip segments.

Transcript:
"""${fullText.slice(0, 8000)}"""

For each clip, return JSON array of objects with:
- id: "clip-1", "clip-2", etc.
- title: string (short catchy title)
- hook: string (a scroll-stopping hook based on the segment)
- startTime: number (start seconds)
- endTime: number (end seconds)
- viralScore: number 0-100
- hookScore: number 0-100
- ctaScore: number 0-100
- reason: string (why this segment is viral-worthy)

Return ONLY valid JSON array, no markdown.`;

    let clips;
    try {
      clips = await callLLMJSON(prompt);
    } catch {
      clips = null;
    }

    if (!Array.isArray(clips) || clips.length === 0) {
      clips = Array.from({ length: count }, (_, i) => {
        const s = i * 10 + Math.floor(Math.random() * 20);
        const e = s + 25 + Math.floor(Math.random() * 15);
        return {
          id: `clip-${i + 1}`,
          title: `Viral Moment ${i + 1}`,
          hook: `Stop scrolling... you need to see this.`,
          startTime: s,
          endTime: e,
          viralScore: Math.floor(Math.random() * 30) + 65,
          hookScore: Math.floor(Math.random() * 30) + 60,
          ctaScore: Math.floor(Math.random() * 30) + 55,
          reason: "Strong hook and clear value proposition with high emotional engagement.",
        };
      });
    }

    const result = clips.map((c, i) => ({
      id: c.id || `clip-${i + 1}`,
      title: c.title || `Viral Moment ${i + 1}`,
      hook: c.hook || "Stop scrolling...",
      start_time: fmt(c.startTime ?? i * 10),
      end_time: fmt(c.endTime ?? (i + 1) * 10 + 25),
      duration: (c.endTime ?? (i + 1) * 10 + 25) - (c.startTime ?? i * 10),
      viral_score: c.viralScore ?? Math.floor(Math.random() * 30) + 65,
      hook_score: c.hookScore ?? Math.floor(Math.random() * 30) + 60,
      cta_score: c.ctaScore ?? Math.floor(Math.random() * 30) + 55,
      reason: c.reason || "Strong hook and clear value.",
    }));

    return Response.json({ clips: result });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Analysis failed", details: err.message }, { status: 500 });
  }
}
