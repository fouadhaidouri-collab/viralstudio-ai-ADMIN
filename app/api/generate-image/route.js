const FAL_BASE = "https://queue.fal.run";

export async function POST(request) {
  const { prompt, modelId, aspectRatio, resolution } = await request.json();
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  const aspectMap = {
    "Square 1:1": "1:1",
    "Portrait 4:5": "4:5",
    "Landscape 16:9": "16:9",
    "Portrait 9:16": "9:16",
  };

  const resNum = parseInt(resolution, 10) || 720;
  const ar = aspectMap[aspectRatio] || "1:1";
  const [aw, ah] = ar.split(":").map(Number);
  const isLandscape = aw > ah;
  const w = isLandscape ? Math.round(resNum * (aw / ah)) : resNum;
  const h = isLandscape ? resNum : Math.round(resNum * (ah / aw));

  const payload = {
    prompt,
    aspect_ratio: ar,
    image_size: { width: w, height: h },
  };

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
    return Response.json({ status: "COMPLETED", imageUrl: result.image?.url || result.image_url || result.images?.[0]?.url, ...result });
  }

  return Response.json({ status: statusData.status });
}
