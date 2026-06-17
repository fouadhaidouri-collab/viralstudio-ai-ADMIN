const FAL_BASE = "https://queue.fal.run";

export const REEL_COUNTS = [10, 20, 30, 40, 50];
export const CLIP_LENGTHS = ["15s", "30s", "45s", "60s"];
export const PLATFORMS = [
  { label: "TikTok", icon: "music_note" },
  { label: "Instagram Reels", icon: "photo_camera" },
  { label: "YouTube Shorts", icon: "smart_display" },
  { label: "Facebook Reels", icon: "facebook" },
];
export const ASPECT_RATIOS = [
  { label: "9:16", icon: "crop_portrait" },
  { label: "1:1", icon: "crop_square" },
  { label: "16:9", icon: "crop_16_9" },
];
export const LANGUAGES = ["English", "Arabic", "Moroccan Darija", "French"];
export const CAPTION_STYLES = [
  { label: "Alex Hormozi", icon: "format_quote" },
  { label: "Iman Gadzhi", icon: "format_quote" },
  { label: "Mr Beast", icon: "bolt" },
  { label: "TikTok Viral", icon: "whatshot" },
  { label: "Minimal", icon: "text_fields" },
];

export const AI_DETECTIONS = [
  { key: "hooks", label: "Detect Hooks" },
  { key: "viral_moments", label: "Detect Viral Moments" },
  { key: "cta", label: "Detect CTA" },
  { key: "story_moments", label: "Detect Story Moments" },
  { key: "emotional_peaks", label: "Detect Emotional Peaks" },
  { key: "questions", label: "Detect Questions" },
];

export const AUTO_ENHANCEMENTS = [
  { key: "captions", label: "Auto Captions" },
  { key: "titles", label: "Auto Titles" },
  { key: "hooks", label: "Auto Hooks" },
  { key: "hashtags", label: "Auto Hashtags" },
  { key: "emojis", label: "Auto Emojis" },
  { key: "zoom", label: "Auto Zoom" },
  { key: "reframing", label: "Smart Reframing" },
];

export const ANALYST_MODELS = [
  { label: "DeepSeek", value: "deepseek/deepseek-chat", color: "#6366f1", free: true },
  { label: "DeepSeek R1", value: "deepseek/deepseek-r1", color: "#4f46e5", free: true },
  { label: "Llama 3.1 8B", value: "meta-llama/llama-3.1-8b-instruct", color: "#0891b2", free: true },
  { label: "Mistral 7B", value: "mistralai/mistral-7b-instruct", color: "#ea580c", free: true },
  { label: "Gemini 2.0 Flash Lite", value: "google/gemini-2.0-flash-lite-preview", color: "#4285f4", free: true },
];

export const JOB_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export async function submitToFal(modelId, payload) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) throw new Error("FAL_KEY not configured");

  const res = await fetch(`${FAL_BASE}/${modelId}`, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai error (${res.status}): ${text}`);
  }

  return res.json();
}

export async function pollFalStatus(modelId, requestId) {
  const FAL_KEY = process.env.FAL_KEY;

  const res = await fetch(`${FAL_BASE}/${modelId}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });

  if (!res.ok) throw new Error(`Status check failed (${res.status})`);

  return res.json();
}

export async function getFalResult(modelId, requestId) {
  const FAL_KEY = process.env.FAL_KEY;

  const res = await fetch(`${FAL_BASE}/${modelId}/requests/${requestId}`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });

  if (!res.ok) throw new Error(`Result fetch failed (${res.status})`);

  return res.json();
}
