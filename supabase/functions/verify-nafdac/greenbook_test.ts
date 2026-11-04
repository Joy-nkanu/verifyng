import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildGreenbookSearchUrl,
  evaluateRegistration,
  isMeaningfulQuery,
  isValidBarcode,
  namesMatch,
  normalizeGreenbookResponse,
  normalizeName,
  type GreenbookRecord,
} from "./greenbook.ts";

Deno.test("accepts retail barcodes from 8 to 14 digits", () => {
  assertEquals(isValidBarcode("5901234123457"), true);
  assertEquals(isValidBarcode("12345abc"), false);
  assertEquals(isValidBarcode("1234567"), false);
});

Deno.test("requires a product name or registration number to search", () => {
  assertEquals(isMeaningfulQuery({ productName: "Paracetamol 500mg" }), true);
  assertEquals(isMeaningfulQuery({ nafdacNumber: "A11-101363" }), true);
  assertEquals(isMeaningfulQuery({ productName: "  " }), false);
  assertEquals(isMeaningfulQuery({}), false);
});

Deno.test("searches the register by registration number when provided", () => {
  const url = new URL(buildGreenbookSearchUrl({ nafdacNumber: "A11-101363" }));
  assertEquals(url.searchParams.get("columns[5][search][value]"), "A11-101363");
  assertEquals(url.searchParams.get("columns[0][search][value]"), "");
});

Deno.test("falls back to product-name search", () => {
  const url = new URL(buildGreenbookSearchUrl({ productName: "Paracetamol" }));
  assertEquals(url.searchParams.get("columns[0][search][value]"), "Paracetamol");
  assertEquals(url.searchParams.get("columns[5][search][value]"), "");
});

Deno.test("parses register rows into clean records", () => {
  const records = normalizeGreenbookResponse({
    data: [
      {
        product_id: 12458,
        product_name: "Analife Paracetamol 500mg $",
        NAFDAC: "A11-101363",
        status: "Active",
        approval_date: "2026-08-26",
        expiry_date: "2031-08-25",
        pack_size: "96 tablets",
        applicant: { name: "Analife Healthcare Limited" },
        product_category: { name: "Drugs" },
        form: { name: "Tablet" },
        ingredient: { ingredient_name: "Paracetamol" },
      },
      { product_name: "", NAFDAC: "X1-1" },
    ],
  });
  assertEquals(records.length, 1);
  assertEquals(records[0].productName, "Analife Paracetamol 500mg");
  assertEquals(records[0].nafdacNumber, "A11-101363");
  assertEquals(records[0].status, "Active");
  assertEquals(records[0].applicant, "Analife Healthcare Limited");
  assertEquals(records[0].detailsUrl, "https://greenbook.nafdac.gov.ng/products/details/12458");
});

Deno.test("name matching needs substantial token overlap", () => {
  assertEquals(namesMatch(normalizeName("Emzor Pharma Paracetamol 500mg Tablet"), normalizeName("Emzor Paracetamol Tablet")), true);
  assertEquals(namesMatch(normalizeName("Paracetamol"), normalizeName("Marley Paracetamol Injection")), false);
  assertEquals(namesMatch(normalizeName("Golden Penny Semovita"), normalizeName("Amatem Softgel")), false);
});

Deno.test("confirms verified status only for active registrations", () => {
  const record: GreenbookRecord = {
    productName: "Analife Paracetamol 500mg",
    nafdacNumber: "A11-101363",
    status: "Active",
  };

  assertEquals(evaluateRegistration([record], { nafdacNumber: "A11-101363" }).status, "active");
  assertEquals(evaluateRegistration([record], { productName: "Emzor Paracetamol 500mg Tablet" }).status, "active");
  assertEquals(evaluateRegistration([record], { productName: "Golden Penny Semovita" }).status, "not_found");

  const inactive: GreenbookRecord = { ...record, status: "Inactive" };
  assertEquals(evaluateRegistration([inactive], { nafdacNumber: "A11-101363" }).status, "inactive");

  assertEquals(evaluateRegistration([], { productName: "Paracetamol Tablet" }).status, "not_found");
});
