import { videoModels, imageModels } from "@/app/lib/capabilities";
import { syncAllModulePrices } from "@/lib/pricing";

export async function POST() {
  const allModules = [...videoModels, ...imageModels];
  const result = await syncAllModulePrices(allModules);
  return Response.json({ success: true, ...result });
}
