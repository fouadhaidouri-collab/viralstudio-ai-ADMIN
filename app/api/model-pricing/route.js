import { getFalKey } from "@/lib/fal-key";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "data", "provider-model-prices.json");

function readCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {}
  return {};
}

function writeCacheEntry(eid, entry) {
  try {
    const all = readCache();
    all[eid] = { ...entry, last_synced_at: new Date().toISOString() };
    const dir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(all, null, 2), "utf-8");
  } catch {}
}

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

  const cache = readCache();
  const ids = endpointIds.split(",").filter(Boolean);
  const pricingMap = {};

  for (const eid of ids) {
    // Try live fetch first
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
            const entry = { unitPrice: p.unit_price, unit: p.unit, currency: p.currency };
            pricingMap[eid] = entry;
            writeCacheEntry(eid, { unit_price: p.unit_price, unit: p.unit, currency: p.currency, pricing_unavailable: false });
            continue;
          }
        }
      }
    } catch {}

    // Fallback to cache
    if (cache[eid] && cache[eid].unit_price != null) {
      pricingMap[eid] = { unitPrice: cache[eid].unit_price, unit: cache[eid].unit, currency: cache[eid].currency || "USD" };
    } else {
      pricingMap[eid] = { unitPrice: null, pricingUnavailable: true };
    }
  }

  return Response.json({ success: true, prices: pricingMap });
}
