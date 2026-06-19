import { videoModels, imageModels } from "@/app/lib/capabilities";
import { syncAllModulePrices } from "@/lib/pricing";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const authHeader = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const headerToken = authHeader.replace("Bearer ", "").trim();
    if (headerToken !== secret && token !== secret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const allModules = [...videoModels, ...imageModels];
  const result = await syncAllModulePrices(allModules);

  return Response.json({ success: true, ...result, ran_at: new Date().toISOString() });
}
