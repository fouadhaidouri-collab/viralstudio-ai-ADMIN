import { syncAllModules } from "@/lib/modules";

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

  const result = await syncAllModules();
  return Response.json({ success: true, ...result, ran_at: new Date().toISOString() });
}
