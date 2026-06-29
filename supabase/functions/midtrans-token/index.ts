import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, email, name, amount } = await req.json();

    const SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY") || "";
    const IS_PRODUCTION = Deno.env.get("MIDTRANS_ENV") === "production";

    const BASE_URL = IS_PRODUCTION
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const orderId = `SEMBUHIN-${user_id.substring(0, 8)}-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        email: email,
        first_name: name || "Pengguna",
      },
      item_details: [
        {
          id: "PREMIUM_MEMBERSHIP",
          price: amount,
          quantity: 1,
          name: "Sembuhin Premium Membership",
        },
      ],
      callbacks: {
        finish: `${req.headers.get("origin") || "http://localhost:8084"}/membership?status=success`,
      },
    };

    const authHeader = "Basic " + btoa(SERVER_KEY + ":");

    const midtransRes = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      return new Response(
        JSON.stringify({ error: midtransData.error_messages?.[0] || "Midtrans error" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ token: midtransData.token, redirect_url: midtransData.redirect_url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
