import { syncAllModules } from "@/lib/modules";

export async function POST() {
  const result = await syncAllModules();
  return Response.json({ success: true, ...result });
}
