import { getModuleCreditPrice, getProviderPrices } from "@/lib/pricing";

export async function GET(request, { params }) {
  const { module_id } = await params;
  const modulePrice = getModuleCreditPrice(module_id);
  const providerPrices = getProviderPrices();

  if (!modulePrice) {
    return Response.json({ error: "Module not found", module_id }, { status: 404 });
  }

  const providerRecord = providerPrices[modulePrice.endpoint_id];

  return Response.json({
    module_id: modulePrice.module_id,
    endpoint_id: modulePrice.endpoint_id,
    unit_price: modulePrice.unit_price,
    unit: modulePrice.unit,
    provider_cost_usd: modulePrice.provider_cost_usd,
    markup_multiplier: modulePrice.markup_multiplier,
    credits_required: modulePrice.credits_required,
    pricing_unavailable: modulePrice.pricing_unavailable,
    last_synced_at: providerRecord?.last_synced_at || null,
    last_calculated_at: modulePrice.last_calculated_at,
  });
}
