import { getFalKey } from "@/lib/fal-key";
import { getModule } from "@/lib/modules";

const FAL_BASE = "https://queue.fal.run";

export async function GET(request, { params }) {
  const { module_id } = await params;
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return Response.json({ error: "Missing requestId" }, { status: 400 });
  }

  const mod = getModule(module_id);
  if (!mod) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  const keyResult = await getFalKey();
  if (!keyResult.hasKey) {
    return Response.json({ error: keyResult.error, setupRequired: true }, { status: 200 });
  }

  const statusRes = await fetch(`${FAL_BASE}/${mod.endpoint_id}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${keyResult.key}` },
  });

  if (!statusRes.ok) {
    return Response.json({ error: `fal.ai status error: ${statusRes.status}` }, { status: statusRes.status });
  }

  const statusData = await statusRes.json();

  if (statusData.status === "COMPLETED") {
    const resultRes = await fetch(`${FAL_BASE}/${mod.endpoint_id}/requests/${requestId}`, {
      headers: { Authorization: `Key ${keyResult.key}` },
    });
    const result = await resultRes.json();

    const outputUrl = result.video?.url || result.video_url || result.image?.url || result.image_url || result.images?.[0]?.url || result.audio?.url || result.output?.url || null;

    return Response.json({ status: "COMPLETED", outputUrl, ...result });
  }

  return Response.json({ status: statusData.status, ...statusData });
}
