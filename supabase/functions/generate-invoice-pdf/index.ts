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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await anonClient.auth.getUser(token);
    if (claimsErr || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check ownership or admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", claimsData.user.id)
      .maybeSingle();

    if (invoice.user_id !== claimsData.user.id && roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", invoice.user_id)
      .single();

    // Fetch reservation + space if linked
    let spaceName = "";
    let reservationTitle = "";
    if (invoice.reservation_id) {
      const { data: res } = await supabase
        .from("reservations")
        .select("title, spaces(name)")
        .eq("id", invoice.reservation_id)
        .single();
      if (res) {
        reservationTitle = res.title || "";
        spaceName = (res.spaces as any)?.name || "";
      }
    }

    const pdf = generatePdfBytes(invoice, profile, spaceName, reservationTitle);

    return new Response(pdf, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Minimal PDF generator — no external deps
function generatePdfBytes(
  invoice: any,
  profile: any,
  spaceName: string,
  reservationTitle: string
): Uint8Array {
  const lines: string[] = [];
  let yPos = 750;
  const lineHeight = 16;

  const textObjects: string[] = [];

  function addLine(text: string, x = 50, bold = false, size = 11) {
    textObjects.push(
      `BT /F${bold ? "2" : "1"} ${size} Tf ${x} ${yPos} Td (${escapePdf(text)}) Tj ET`
    );
    yPos -= lineHeight;
  }

  function addGap(gap = 10) {
    yPos -= gap;
  }

  // Header
  yPos = 770;
  textObjects.push(
    `BT /F2 22 Tf 50 ${yPos} Td (INVOICE) Tj ET`
  );
  yPos -= 30;
  addLine(`#${invoice.invoice_number}`, 50, true, 14);
  addGap(10);

  // Company info
  addLine("SpaceHub Coworking", 50, true);
  addLine("Nairobi, Kenya");
  addGap(15);

  // Bill to
  addLine("BILL TO:", 50, true);
  addLine(profile?.full_name || "Customer");
  addLine(profile?.email || "");
  if (profile?.phone) addLine(profile.phone);
  addGap(15);

  // Dates
  addLine(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 50);
  addLine(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}`, 50);
  addLine(`Status: ${invoice.status.toUpperCase()}`, 50, true);
  addGap(15);

  // Details
  if (spaceName || reservationTitle) {
    addLine("DETAILS:", 50, true);
    if (reservationTitle) addLine(`Reservation: ${reservationTitle}`);
    if (spaceName) addLine(`Space: ${spaceName}`);
    addGap(15);
  }

  // Line separator
  textObjects.push(
    `0.8 0.8 0.8 RG 50 ${yPos + 8} m 550 ${yPos + 8} l 0.5 w S`
  );
  addGap(10);

  // Amounts
  addLine(`Subtotal:          KES ${Number(invoice.subtotal).toLocaleString()}`);
  addLine(`Tax (${Number(invoice.tax_rate)}%):       KES ${Number(invoice.tax_amount).toLocaleString()}`);
  if (Number(invoice.discount_amount) > 0) {
    addLine(`Discount:          KES -${Number(invoice.discount_amount).toLocaleString()}`);
  }
  addGap(5);
  textObjects.push(
    `0.8 0.8 0.8 RG 50 ${yPos + 8} m 550 ${yPos + 8} l 0.5 w S`
  );
  addGap(5);
  addLine(`TOTAL:             KES ${Number(invoice.total_amount).toLocaleString()}`, 50, true, 14);

  if (invoice.paid_at) {
    addGap(15);
    addLine(`Paid on: ${new Date(invoice.paid_at).toLocaleDateString()}`, 50, true);
  }

  // Footer
  textObjects.push(
    `BT /F1 9 Tf 50 40 Td (Thank you for your business!) Tj ET`
  );

  // Build PDF
  const stream = textObjects.join("\n");
  const streamBytes = new TextEncoder().encode(stream);

  const objects: string[] = [];

  // Obj 1 - Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  // Obj 2 - Pages
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  // Obj 3 - Page
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj"
  );
  // Obj 4 - Stream
  objects.push(
    `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj`
  );
  // Obj 5 - Font (Helvetica)
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
  );
  // Obj 6 - Font (Helvetica-Bold)
  objects.push(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj"
  );

  // Build xref
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj + "\n";
  }
  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (const off of offsets) {
    body += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(body);
}

function escapePdf(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]/g, " ");
}
