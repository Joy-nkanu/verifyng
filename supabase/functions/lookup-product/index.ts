import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isValidBarcode, normalizeCatalogResponse } from "./lookup.ts";

const fields = "code,product_name,brands,categories,ingredients_text,manufacturing_places,countries,manufacturing_date,expiration_date";

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

  const barcode = body && typeof body === "object" ? (body as { barcode?: unknown }).barcode : undefined;
  if (!isValidBarcode(barcode)) {
    return Response.json(
      { error: "Enter a barcode containing 8 to 14 digits." },
      { status: 400, headers: corsHeaders },
    );
  }

  const sourceUrl = `https://world.openfoodfacts.org/product/${barcode}`;
  const apiUrl = new URL(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  apiUrl.searchParams.set("product_type", "all");
  apiUrl.searchParams.set("fields", fields);

  try {
    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "VerifyNG/1.0 (public product lookup)" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      console.error(`Product catalog request failed with status ${response.status}`);
      return Response.json(
        { error: "The product catalog is temporarily unavailable." },
        { status: 502, headers: corsHeaders },
      );
    }

    const result = normalizeCatalogResponse(await response.json());
    return Response.json(
      { ...result, sourceUrl },
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown catalog error";
    console.error(`Product catalog lookup failed: ${message}`);
    return Response.json(
      { error: "The product catalog could not be reached. Please try again." },
      { status: 502, headers: corsHeaders },
    );
  }
});