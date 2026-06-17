export async function POST(req) {
  try {
    const { orderId, plan, period } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const useSandbox = process.env.PAYPAL_USE_SANDBOX !== "false";
    const paypalBase = useSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: "PayPal not configured" }), { status: 500 });
    }

    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("PayPal auth error:", tokenData);
      return new Response(JSON.stringify({ error: `PayPal auth failed: ${tokenData.error_description || tokenData.error || "unknown"}` }), { status: 500 });
    }

    const captureRes = await fetch(`${paypalBase}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      return new Response(JSON.stringify({ error: captureData.message || "Capture failed" }), { status: captureRes.status });
    }

    return new Response(JSON.stringify({ status: "COMPLETED", details: captureData }));
  } catch (err) {
    console.error("Capture error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
