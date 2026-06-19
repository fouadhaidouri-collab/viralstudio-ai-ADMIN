import { getCreditSettings } from "@/lib/pricing";

export async function GET() {
  const settings = getCreditSettings();
  return Response.json(settings);
}
