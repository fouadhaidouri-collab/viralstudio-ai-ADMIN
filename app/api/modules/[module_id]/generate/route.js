import { getFalKey } from "@/lib/fal-key";
import { getModule, validateModuleInput, estimateModuleCredits, calculateModuleCredits } from "@/lib/modules";
import { getUserCredits, deductUserCredits, refundUserCredits } from "@/lib/pricing";
import { buildFalPayload } from "@/lib/schema-parser";

const FAL_BASE = "https://queue.fal.run";
const DEFAULT_USER = "default";

const STALE_HOURS = 12;

export async function POST(request, { params }) {
  const { module_id } = await params;
  const userInput = await request.json();

  // 1. Load module
  const mod = getModule(module_id);
  if (!mod) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  // 2. Refresh pricing if stale
  if (mod.fal_pricing?.last_synced_at) {
    const ageHours = (Date.now() - new Date(mod.fal_pricing.last_synced_at).getTime()) / (1000 * 60 * 60);
    if (ageHours > STALE_HOURS) {
      await calculateModuleCredits(module_id);
    }
  }

  // 3. Validate input
  const validation = validateModuleInput(module_id, userInput);
  if (!validation.valid) {
    return Response.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
  }

  // 4. Estimate credits
  const estimate = estimateModuleCredits(module_id, userInput);
  if (estimate.pricing_unavailable || estimate.credits_required == null) {
    return Response.json({ error: "Pricing unavailable for this module. Cannot generate." }, { status: 402 });
  }

  // 5. Check credits
  const user = getUserCredits(DEFAULT_USER);
  if ((user.balance_credits || 0) < estimate.credits_required) {
    return Response.json({
      error: "Not enough credits",
      credits_required: estimate.credits_required,
      balance: user.balance_credits || 0,
    }, { status: 402 });
  }

  // 6. Deduct credits (reserve)
  const deduction = deductUserCredits(DEFAULT_USER, estimate.credits_required, module_id, mod.endpoint_id, {
    input: userInput,
    estimate,
  });

  if (!deduction.success) {
    return Response.json({ error: deduction.error }, { status: 402 });
  }

  // 7. Build payload and call fal.ai
  const keyResult = await getFalKey();
  if (!keyResult.hasKey) {
    refundUserCredits(DEFAULT_USER, deduction.transaction);
    return Response.json({ error: keyResult.error, setupRequired: true }, { status: 200 });
  }

  const payload = buildFalPayload(mod.fal_schema?.fields || [], userInput);

  try {
    const res = await fetch(`${FAL_BASE}/${mod.endpoint_id}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${keyResult.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      refundUserCredits(DEFAULT_USER, deduction.transaction);
      return Response.json({ error: `fal.ai error (${res.status}): ${text}` }, { status: res.status });
    }

    const data = await res.json();

    return Response.json({
      success: true,
      requestId: data.request_id,
      module_id,
      credits_used: estimate.credits_required,
      balance: deduction.balance,
    });
  } catch (err) {
    refundUserCredits(DEFAULT_USER, deduction.transaction);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
