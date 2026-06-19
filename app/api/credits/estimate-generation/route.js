import { estimateGenerationCredits } from "@/lib/pricing";

export async function POST(request) {
  const { module_id, input } = await request.json();

  if (!module_id) {
    return Response.json({ error: "Missing module_id" }, { status: 400 });
  }

  const result = estimateGenerationCredits(module_id, input || {});

  return Response.json(result);
}
