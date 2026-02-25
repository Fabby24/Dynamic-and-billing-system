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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reservation_id } = await req.json();
    if (!reservation_id) {
      return new Response(JSON.stringify({ error: "reservation_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch reservation with space
    const { data: reservation, error: resErr } = await supabase
      .from("reservations")
      .select("*, spaces(name)")
      .eq("id", reservation_id)
      .single();

    if (resErr || !reservation) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", reservation.user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const spaceName = (reservation.spaces as any)?.name || "your reserved space";
    const startDate = new Date(reservation.start_time).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const endDate = new Date(reservation.end_time).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Check if there's an invoice for this reservation to attach PDF
    let attachments: any[] = [];
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("reservation_id", reservation_id)
      .maybeSingle();

    if (invoice) {
      // Generate PDF inline (same logic as generate-invoice-pdf)
      const pdfBytes = generatePdfBytes(invoice, profile, spaceName, reservation.title || "");
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      attachments = [
        {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: base64,
        },
      ];
    }

    // Send email via Resend
    const emailBody = {
      from: "SpaceHub <onboarding@resend.dev>",
      to: [profile.email],
      subject: `Reservation Confirmed — ${spaceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Reservation Confirmed ✅</h1>
          <p>Hi <strong>${profile.full_name || "there"}</strong>,</p>
          <p>Your reservation has been confirmed. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #666;">Space</td><td style="padding: 8px 0; font-weight: bold;">${spaceName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Title</td><td style="padding: 8px 0;">${reservation.title || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Start</td><td style="padding: 8px 0;">${startDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">End</td><td style="padding: 8px 0;">${endDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Total Cost</td><td style="padding: 8px 0; font-weight: bold;">KES ${Number(reservation.total_cost).toLocaleString()}</td></tr>
          </table>
          ${invoice ? "<p>Your invoice is attached as a PDF.</p>" : ""}
          <p style="color: #666; font-size: 14px; margin-top: 30px;">Thank you for choosing SpaceHub!</p>
        </div>
      `,
      ...(attachments.length > 0 ? { attachments } : {}),
    };

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      throw new Error(`Resend API error [${resendRes.status}]: ${JSON.stringify(resendData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Email notification error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Same PDF generator as generate-invoice-pdf
function generatePdfBytes(invoice: any, profile: any, spaceName: string, reservationTitle: string): Uint8Array {
  const textObjects: string[] = [];
  let yPos = 770;
  const lineHeight = 16;

  function addLine(text: string, x = 50, bold = false, size = 11) {
    textObjects.push(`BT /F${bold ? "2" : "1"} ${size} Tf ${x} ${yPos} Td (${escapePdf(text)}) Tj ET`);
    yPos -= lineHeight;
  }
  function addGap(gap = 10) { yPos -= gap; }

  textObjects.push(`BT /F2 22 Tf 50 ${yPos} Td (INVOICE) Tj ET`);
  yPos -= 30;
  addLine(`#${invoice.invoice_number}`, 50, true, 14);
  addGap(10);
  addLine("SpaceHub Coworking", 50, true);
  addLine("Nairobi, Kenya");
  addGap(15);
  addLine("BILL TO:", 50, true);
  addLine(profile?.full_name || "Customer");
  addLine(profile?.email || "");
  addGap(15);
  addLine(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`);
  addLine(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}`);
  addLine(`Status: ${invoice.status.toUpperCase()}`, 50, true);
  addGap(15);
  if (spaceName || reservationTitle) {
    addLine("DETAILS:", 50, true);
    if (reservationTitle) addLine(`Reservation: ${reservationTitle}`);
    if (spaceName) addLine(`Space: ${spaceName}`);
    addGap(15);
  }
  textObjects.push(`0.8 0.8 0.8 RG 50 ${yPos + 8} m 550 ${yPos + 8} l 0.5 w S`);
  addGap(10);
  addLine(`Subtotal:          KES ${Number(invoice.subtotal).toLocaleString()}`);
  addLine(`Tax (${Number(invoice.tax_rate)}%):       KES ${Number(invoice.tax_amount).toLocaleString()}`);
  if (Number(invoice.discount_amount) > 0) addLine(`Discount:          KES -${Number(invoice.discount_amount).toLocaleString()}`);
  addGap(5);
  textObjects.push(`0.8 0.8 0.8 RG 50 ${yPos + 8} m 550 ${yPos + 8} l 0.5 w S`);
  addGap(5);
  addLine(`TOTAL:             KES ${Number(invoice.total_amount).toLocaleString()}`, 50, true, 14);
  textObjects.push(`BT /F1 9 Tf 50 40 Td (Thank you for your business!) Tj ET`);

  const stream = textObjects.join("\n");
  const streamBytes = new TextEncoder().encode(stream);
  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj");
  objects.push(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj`);
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
  objects.push("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) { offsets.push(body.length); body += obj + "\n"; }
  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (const off of offsets) body += `${String(off).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(body);
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]/g, " ");
}
