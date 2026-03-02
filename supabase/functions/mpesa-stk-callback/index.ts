import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      console.error("Invalid callback payload");
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (resultCode === 0) {
      // Payment successful — extract metadata
      const items = callback.CallbackMetadata?.Item || [];
      const getMeta = (name: string) =>
        items.find((i: any) => i.Name === name)?.Value;

      const mpesaReceipt = getMeta("MpesaReceiptNumber") || "";
      const amount = getMeta("Amount") || 0;
      const phone = String(getMeta("PhoneNumber") || "");

      // Update payment record
      const { data: payment } = await supabase
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt: mpesaReceipt,
          phone_number: phone,
          amount,
        })
        .eq("transaction_id", checkoutRequestId)
        .select("invoice_id")
        .single();

      // Mark invoice as paid
      if (payment?.invoice_id) {
        await supabase
          .from("invoices")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", payment.invoice_id);
      }

      console.log("Payment completed:", mpesaReceipt);
    } else {
      // Payment failed or cancelled
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("transaction_id", checkoutRequestId);

      console.log("Payment failed/cancelled. ResultCode:", resultCode);
    }

    // Always respond with success to M-Pesa
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Callback processing error:", err);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
