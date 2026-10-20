import { supabase } from "@/integrations/supabase/client";
import type { ProductInfo } from "@/lib/mockProducts";

interface CatalogProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  code?: string;
  ingredients_text?: string;
  manufacturing_places?: string;
  countries?: string;
  manufacturing_date?: string;
  expiration_date?: string;
}

interface LookupResponse {
  found: boolean;
  product: CatalogProduct | null;
  sourceUrl: string;
}

export async function lookupProduct(barcode: string): Promise<ProductInfo | null> {
  const { data, error } = await supabase.functions.invoke<LookupResponse>("lookup-product", {
    body: { barcode },
  });

  if (error) throw error;
  if (!data || typeof data.found !== "boolean") {
    throw new Error("The product lookup returned an unexpected response.");
  }
  if (!data.found || !data.product) return null;

  const item = data.product;
  return {
    name: item.product_name?.trim() || "Product name not listed",
    brand: item.brands?.trim() || "Brand not listed",
    category: item.categories?.split(",")[0]?.trim() || "Category not listed",
    barcode: item.code || barcode,
    productionDate: item.manufacturing_date?.trim() || undefined,
    expiryDate: item.expiration_date?.trim() || undefined,
    manufacturer: item.manufacturing_places?.trim() || undefined,
    countryOfOrigin: item.countries?.trim() || undefined,
    ingredients: item.ingredients_text?.trim() || undefined,
    source: "catalog",
    sourceUrl: data.sourceUrl,
  };
}