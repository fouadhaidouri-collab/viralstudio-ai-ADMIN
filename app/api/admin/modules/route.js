import { getAllModules } from "@/lib/modules";
import { getProviderPrices } from "@/lib/pricing";

export async function GET() {
  const modules = getAllModules();
  const providerPrices = getProviderPrices();
  const result = Object.entries(modules).map(([id, mod]) => ({
    module_id: id,
    display_name: mod.display_name,
    endpoint_id: mod.endpoint_id,
    category: mod.fal_metadata?.category || "",
    status: mod.business_config?.enabled !== false ? "enabled" : "disabled",
    unit_price: mod.fal_pricing?.unit_price,
    unit: mod.fal_pricing?.unit,
    pricing_unavailable: mod.fal_pricing?.pricing_unavailable,
    estimated_credits: mod.credit_pricing?.estimated_credits,
    schema_hash: mod.fal_schema?.schema_hash,
    price_hash: mod.fal_pricing?.price_hash,
    last_schema_sync: mod.fal_schema?.last_synced_at,
    last_price_sync: mod.fal_pricing?.last_synced_at,
    last_credit_calc: mod.credit_pricing?.last_calculated_at,
    ui_order: mod.business_config?.ui_order || 0,
  }));

  result.sort((a, b) => (a.ui_order || 0) - (b.ui_order || 0));
  return Response.json({ success: true, modules: result });
}
