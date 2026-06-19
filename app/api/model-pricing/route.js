import { getFalKey } from "@/lib/fal-key";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpointIds = searchParams.get("endpoint_ids");

  if (!endpointIds) {
    return Response.json({ error: "Missing endpoint_ids" }, { status: 400 });
  }

  const keyResult = await getFalKey();
  if (!keyResult.hasKey) {
    return Response.json({ success: false, setupRequired: true, error: keyResult.error }, { status: 200 });
  }

  const ids = endpointIds.split(",").filter(Boolean);
  const pricingMap = {};

  for (const eid of ids) {
    try {
      const url = `https://api.fal.ai/v1/models/pricing?endpoint_id=${encodeURIComponent(eid)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Key ${keyResult.key}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prices && data.prices.length > 0) {
          const p = data.prices[0];
          if (p.unit_price != null) {
            pricingMap[eid] = { unitPrice: p.unit_price, unit: p.unit, currency: p.currency };
          } else {
            pricingMap[eid] = { unitPrice: null, pricingUnavailable: true };
          }
        } else {
          pricingMap[eid] = { unitPrice: null, pricingUnavailable: true };
        }
      } else {
        pricingMap[eid] = { unitPrice: null, pricingUnavailable: true };
      }
    } catch {
      pricingMap[eid] = { unitPrice: null, pricingUnavailable: true };
    }
  }

  return Response.json({ success: true, prices: pricingMap });
}
