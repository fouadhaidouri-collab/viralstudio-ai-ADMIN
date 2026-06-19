import { createModule, syncModule } from "@/lib/modules";

export async function POST(request) {
  const { endpoint_id, display_name, business_config } = await request.json();

  if (!endpoint_id) {
    return Response.json({ error: "Missing endpoint_id" }, { status: 400 });
  }

  if (!display_name) {
    return Response.json({ error: "Missing display_name" }, { status: 400 });
  }

  const createResult = await createModule({ endpoint_id, display_name, business_config });

  if (!createResult.success) {
    return Response.json(createResult, { status: 409 });
  }

  const syncResult = await syncModule(createResult.module.module_id);

  return Response.json({
    success: true,
    module: syncResult.module || createResult.module,
    sync: { schema_changed: syncResult.schema_changed, price_changed: syncResult.price_changed },
  });
}
