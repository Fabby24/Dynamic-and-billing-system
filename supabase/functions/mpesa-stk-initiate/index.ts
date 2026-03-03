import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  { attempts = 3, timeoutMs = 15000 }: { attempts?: number; timeoutMs?: number } = {}
) => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("Request timeout"), timeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });

      if (response.status >= 500 && attempt < attempts) {
        const body = await response.text();
        console.warn(`Retrying ${url} (attempt ${attempt}/${attempts}) due to ${response.status}: ${body.slice(0, 180)}`);
        await delay(500 * attempt);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts) {
        console.warn(`Retrying ${url} (attempt ${attempt}/${attempts}) after network error: ${lastError.message}`);
        await delay(500 * attempt);
        continue;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error("Network request failed");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { phone_number, amount, invoice_id } = await req.json();
    if (!phone_number || !amount || !invoice_id) {
      return new Response(
        JSON.stringify({ error: "phone_number, amount, and invoice_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get M-Pesa credentials from secrets
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const mpesaBaseUrl = (Deno.env.get("MPESA_BASE_URL")?.trim() || "https://sandbox.safaricom.co.ke").replace(/\/+$/, "");

    if (!consumerKey || !consumerSecret) {
      throw new Error("M-Pesa credentials not configured");
    }

    // Step 1: Get OAuth token
    const authString = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenRes = await fetchWithRetry(
      `${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${authString}` } },
      { attempts: 3, timeoutMs: 15000 }
    );
    const tokenText = await tokenRes.text();
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      console.error("OAuth response not JSON:", tokenText);
      throw new Error(`M-Pesa OAuth failed (${tokenRes.status}): ${tokenText.slice(0, 200)}`);
    }
    if (!tokenData.access_token) {
      console.error("No access_token in response:", tokenText);
      throw new Error("Failed to get M-Pesa access token");
    }

    // Step 2: Initiate STK Push
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const shortcode = "174379"; // Safaricom sandbox shortcode
    const passkey =
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Sandbox passkey
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone: ensure 254 prefix
    const formattedPhone = phone_number.replace(/^0/, "254").replace(/^\+/, "");

    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-stk-callback`;

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(Number(amount)),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `INV-${invoice_id.slice(0, 8)}`,
      TransactionDesc: `Payment for invoice`,
    };

    const stkRes = await fetchWithRetry(
      `${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      },
      { attempts: 3, timeoutMs: 20000 }
    );

    const stkText = await stkRes.text();
    let stkData;
    try {
      stkData = JSON.parse(stkText);
    } catch {
      console.error("STK Push response not JSON:", stkText);
      throw new Error(`STK Push failed (${stkRes.status}): ${stkText.slice(0, 200)}`);
    }
    console.log("STK Push response:", JSON.stringify(stkData));

    if (stkData.ResponseCode !== "0") {
      throw new Error(stkData.errorMessage || stkData.ResponseDescription || "STK Push failed");
    }

    // Step 3: Create a pending payment record
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("payments").insert({
      user_id: userData.user.id,
      invoice_id,
      amount: Math.ceil(Number(amount)),
      payment_method: "mpesa",
      phone_number: formattedPhone,
      transaction_id: stkData.CheckoutRequestID,
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        success: true,
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
        message: "STK Push sent. Check your phone.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("STK Push error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const isGatewayIssue = /(upstream connect error|connection timeout|temporarily unavailable|request timeout|network)/i.test(message);

    return new Response(
      JSON.stringify({
        error: isGatewayIssue
          ? "M-Pesa gateway is temporarily unavailable. Please retry in a few minutes."
          : message,
        details: message,
      }),
      {
        status: isGatewayIssue ? 503 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
