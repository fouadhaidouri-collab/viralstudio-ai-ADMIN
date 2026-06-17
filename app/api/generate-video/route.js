const FAL_BASE = "https://queue.fal.run";

const MODEL_PAYLOADS = {
  "fal-ai/veo3.1/fast": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    image_url: null,
  }),
  "xai/grok-imagine-video/text-to-video": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
  }),
  "bytedance/seedance/v1.5/pro/text-to-video": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    duration: 5,
  }),
  "bytedance/seedance-2.0/text-to-video": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    duration: 5,
  }),
  "kling-video/v3/pro/text-to-video": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    duration: 5,
  }),
  "fal-ai/runway-gen-3": ({ prompt }) => ({
    prompt,
    image_url: null,
  }),
  "fal-ai/luma-dream-machine": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    image_url: null,
  }),
  "fal-ai/pika": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    image_url: null,
  }),
  "alibaba/happy-horse/text-to-video": ({ prompt, aspectRatio }) => ({
    prompt,
    aspect_ratio: aspectRatio,
    duration: 5,
  }),
};

export async function POST(request) {
  const { prompt, modelId, aspectRatio } = await request.json();
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return Response.json({ error: "FAL_KEY not configured — add it to .env.local" }, { status: 500 });
  }

  const ratioMap = {
    "Cinematic 16:9": "16:9",
    "Instagram 9:16": "9:16",
    "Square 1:1": "1:1",
    "Portrait 4:5": "4:5",
  };

  const buildPayload = MODEL_PAYLOADS[modelId];
  if (!buildPayload) {
    return Response.json({ error: `Unsupported model: ${modelId}` }, { status: 400 });
  }

  const payload = buildPayload({ prompt, aspectRatio: ratioMap[aspectRatio] || "16:9" });

  const res = await fetch(`${FAL_BASE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: `fal.ai error (${res.status}): ${text}` }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ requestId: data.request_id, modelId });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");
  const modelId = searchParams.get("modelId");
  const FAL_KEY = process.env.FAL_KEY;

  if (!requestId || !modelId) {
    return Response.json({ error: "Missing requestId or modelId" }, { status: 400 });
  }

  const statusRes = await fetch(`${FAL_BASE}/${modelId}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  });

  if (!statusRes.ok) {
    const text = await statusRes.text();
    return Response.json({ error: `fal.ai status error (${statusRes.status}): ${text}` }, { status: statusRes.status });
  }

  const statusData = await statusRes.json();

  if (statusData.status === "COMPLETED") {
    const resultRes = await fetch(`${FAL_BASE}/${modelId}/requests/${requestId}`, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    const result = await resultRes.json();
    return Response.json({ status: "COMPLETED", videoUrl: result.video?.url || result.video_url, ...result });
  }

  return Response.json({ status: statusData.status });
}
