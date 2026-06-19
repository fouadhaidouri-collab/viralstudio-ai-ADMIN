import { getModule } from "@/lib/modules";

export async function GET(request, { params }) {
  const { module_id } = await params;
  const mod = getModule(module_id);

  if (!mod) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    module: {
      module_id: mod.module_id,
      display_name: mod.display_name,
      endpoint_id: mod.endpoint_id,
      category: mod.fal_metadata?.category || mod.business_config?.custom_category || "",
      description: mod.fal_metadata?.description || "",
      fields: mod.fal_schema?.fields || [],
      required_fields: mod.fal_schema?.required_fields || [],
      options: mod.fal_schema?.options || {},
      estimated_credits: mod.credit_pricing?.estimated_credits,
      pricing_unavailable: mod.fal_pricing?.pricing_unavailable,
      unit_price: mod.fal_pricing?.unit_price,
      unit: mod.fal_pricing?.unit,
      last_synced_at: mod.fal_pricing?.last_synced_at || mod.fal_schema?.last_synced_at,
      presets: mod.business_config?.business_presets || {},
      prompt_presets: mod.business_config?.prompt_presets || {},
    },
  });
}
