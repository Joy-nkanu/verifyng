import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isValidBarcode, normalizeCatalogResponse } from "./lookup.ts";

Deno.test("accepts retail barcodes from 8 to 14 digits", () => {
  assertEquals(isValidBarcode("12345670"), true);
  assertEquals(isValidBarcode("5901234123457"), true);
  assertEquals(isValidBarcode("1234567"), false);
  assertEquals(isValidBarcode("123456789012345"), false);
  assertEquals(isValidBarcode("12345abc"), false);
});

Deno.test("recognizes only a product catalog listing as a match", () => {
  assertEquals(normalizeCatalogResponse({ status: 1, product: { product_name: "Sample" } }).found, true);
  assertEquals(normalizeCatalogResponse({ status: 0, product: null }).found, false);
  assertEquals(normalizeCatalogResponse(null).found, false);
});