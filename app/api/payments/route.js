export async function POST(req) {
  try {
    const { provider, plan, period, amount, currency } = await req.json();

    if (!provider || !amount) {
      return new Response(JSON.stringify({ error: "Missing provider or amount" }), { status: 400 });
    }

    if (provider === "youcanpay") {
      const privateKey = process.env.YOUCANPAY_PRIVATE_KEY;
      if (!privateKey) {
        return new Response(JSON.stringify({ error: "YouCanPay not configured" }), { status: 500 });
      }

      const isSandbox = privateKey.includes("sandbox");
      const baseUrl = isSandbox ? "https://sandbox.youcanpay.com" : "https://youcanpay.com";

      const body = {
        amount: Math.round(amount * 100),
        currency: currency || "USD",
        order_id: `VS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        customer: { name: "", email: "" },
        url: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/pricing?success=1`,
          cancel: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/pricing?canceled=1`,
          ipn: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/payments/webhook`,
        },
      };

      const res = await fetch(`${baseUrl}/api/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": privateKey,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.message || "YouCanPay request failed" }), { status: res.status });
      }

      return new Response(JSON.stringify({ redirectUrl: data.redirect_url || data.url, paymentId: data.id }));
    }

    if (provider === "paypal") {
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

      const accessToken = tokenData.access_token;

      const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: `VS-${Date.now()}`,
            description: `${plan || "ViralStudio"} - ${period || "monthly"}`,
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
          }],
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        return new Response(JSON.stringify({ error: orderData.message || "PayPal order failed" }), { status: orderRes.status });
      }

      return new Response(JSON.stringify({ orderId: orderData.id }));
    }

    return new Response(JSON.stringify({ error: "Unsupported provider" }), { status: 400 });
  } catch (err) {
    console.error("Payment error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
