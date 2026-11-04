import { supabase } from "@/integrations/supabase/client";

export interface NafdacRecord {
  productId?: number;
  productName: string;
  nafdacNumber: string;
  status: string;
  approvalDate?: string;
  expiryDate?: string;
  applicant?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  packSize?: string;
  composition?: string;
  activeIngredients?: string[];
  detailsUrl?: string;
}

export interface NafdacCheck {
  status: "active" | "inactive" | "not_found" | "unavailable";
  records: NafdacRecord[];
  sourceUrl?: string;
}

interface VerifyResponse {
  status: unknown;
  records: unknown;
  sourceUrl: unknown;
}

const VALID_STATUSES: NafdacCheck["status"][] = ["active", "inactive", "not_found"];

export async function verifyNafdac(input: {
  barcode: string;
  productName: string;
  brand?: string;
}): Promise<NafdacCheck> {
  try {
    const { data, error } = await supabase.functions.invoke<VerifyResponse>("verify-nafdac", {
      body: input,
    });

    if (error) throw error;
    if (
      !data ||
      typeof data.status !== "string" ||
      !VALID_STATUSES.includes(data.status as NafdacCheck["status"])
    ) {
      throw new Error("The registration check returned an unexpected response.");
    }

    return {
      status: data.status as NafdacCheck["status"],
      records: Array.isArray(data.records) ? (data.records as NafdacRecord[]) : [],
      sourceUrl: typeof data.sourceUrl === "string" ? data.sourceUrl : undefined,
    };
  } catch {
    return { status: "unavailable", records: [] };
  }
}
