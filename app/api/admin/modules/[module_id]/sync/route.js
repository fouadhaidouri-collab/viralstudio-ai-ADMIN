import { syncModule } from "@/lib/modules";

export async function POST(request, { params }) {
  const { module_id } = await params;
  const result = await syncModule(module_id);
  return Response.json(result);
}
