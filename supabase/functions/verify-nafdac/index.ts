import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { evaluateRegistration, isMeaningfulQuery, isValidBarcode, searchGreenbook } from "./greenbook.ts";

const REGISTER_URL = "https://greenbook.nafdac.gov.ng";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400, headers: corsHeaders });
  }

  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (!isValidBarcode(raw.barcode)) {
    return Response.json(
      { error: "Enter a barcode containing 8 to 14 digits." },
      { status: 400, headers: corsHeaders },
    );
  }

  const query = {
    productName: typeof raw.productName === "string" ? raw.productName.slice(0, 200) : undefined,
    nafdacNumber: typeof raw.nafdacNumber === "string" ? raw.nafdacNumber.slice(0, 40) : undefined,
    brand: typeof raw.brand === "string" ? raw.brand.slice(0, 80) : undefined,
  };
  if (!isMeaningfulQuery(query)) {
    return Response.json(
      { error: "Provide a product name or NAFDAC registration number to check." },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const records = await searchGreenbook(query);
    const check = evaluateRegistration(records, query);
    return Response.json(
      { barcode: raw.barcode, status: check.status, records: check.records, sourceUrl: REGISTER_URL },
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown register error";
    console.error(`NAFDAC register lookup failed: ${message}`);
    return Response.json(
      { error: "The NAFDAC register could not be reached. Please try again." },
      { status: 502, headers: corsHeaders },
    );
  }
});
