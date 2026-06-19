import { getModule, syncModule, updateModuleBusinessConfig, deleteModule } from "@/lib/modules";

export async function GET(request, { params }) {
  const { module_id } = await params;
  const mod = getModule(module_id);
  if (!mod) return Response.json({ error: "Module not found" }, { status: 404 });
  return Response.json({ success: true, module: mod });
}

export async function PATCH(request, { params }) {
  const { module_id } = await params;
  const body = await request.json();
  const updated = updateModuleBusinessConfig(module_id, body);
  if (!updated) return Response.json({ error: "Module not found" }, { status: 404 });
  return Response.json({ success: true, module: updated });
}

export async function DELETE(request, { params }) {
  const { module_id } = await params;
  deleteModule(module_id);
  return Response.json({ success: true });
}
