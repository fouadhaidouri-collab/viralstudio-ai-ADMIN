export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpointIds = searchParams.get("endpoint_ids");
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  if (!endpointIds) {
    return Response.json({ error: "Missing endpoint_ids" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.fal.ai/v1/models/pricing?endpoint_id=${endpointIds}`,
    {
      headers: { Authorization: `Key ${FAL_KEY}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: `fal.ai error (${res.status}): ${text}` }, { status: res.status });
  }

  const data = await res.json();

  const pricingMap = {};
  for (const p of data.prices) {
    pricingMap[p.endpoint_id] = { unitPrice: p.unit_price, unit: p.unit, currency: p.currency };
  }

  return Response.json({ prices: pricingMap });
}
