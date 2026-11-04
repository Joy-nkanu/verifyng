export interface GreenbookRecord {
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

export type RegistrationStatus = "active" | "inactive" | "not_found";

export interface RegistrationCheck {
  status: RegistrationStatus;
  records: GreenbookRecord[];
}

export interface GreenbookQuery {
  productName?: string;
  nafdacNumber?: string;
  brand?: string;
}

export const GREENBOOK_URL = "https://greenbook.nafdac.gov.ng";

export function isValidBarcode(value: unknown): value is string {
  return typeof value === "string" && /^\d{8,14}$/.test(value);
}

export function isMeaningfulQuery(query: GreenbookQuery): boolean {
  const name = (query.productName || "").trim();
  const nrn = (query.nafdacNumber || "").trim();
  return (name.length >= 3 && name.length <= 200) || nrn.length > 0;
}

export function buildGreenbookSearchUrl(query: GreenbookQuery): string {
  const nrn = (query.nafdacNumber || "").trim();
  const name = (query.productName || "").trim();
  const params = new URLSearchParams({
    draw: "1",
    start: "0",
    length: "10",
    "search[value]": "",
    "search[regex]": "false",
    search_ingredient: "",
    "columns[0][data]": "product_name",
    "columns[0][name]": "product_name",
    "columns[0][searchable]": "true",
    "columns[0][search][regex]": "false",
    "columns[5][data]": "NAFDAC",
    "columns[5][name]": "NAFDAC",
    "columns[5][searchable]": "true",
    "columns[5][search][regex]": "false",
    "columns[9][data]": "applicant.name",
    "columns[9][name]": "applicant.name",
    "columns[9][searchable]": "true",
    "columns[9][search][regex]": "false",
  });
  if (nrn) {
    params.set("columns[5][search][value]", nrn);
  } else {
    params.set("columns[0][search][value]", name);
  }
  return `${GREENBOOK_URL}?${params.toString()}`;
}

export function cleanGreenbookText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[#*$"'\\]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || /^(n\/?a|nil|null|-)$/i.test(cleaned)) return undefined;
  return cleaned;
}

export function normalizeRegNumber(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").trim();
}

export function normalizeName(value: string): string[] {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !/^\d/.test(token))
    .map((token) => (token.length > 3 && token.endsWith("S") ? token.slice(0, -1) : token));
}

export function namesMatch(queryTokens: string[], recordTokens: string[]): boolean {
  if (queryTokens.length === 0 || recordTokens.length === 0) return false;
  const recordSet = new Set(recordTokens);
  const overlap = queryTokens.filter((token) => recordSet.has(token)).length;
  const enoughOverlap = overlap >= 2 || (queryTokens.length === 1 && recordTokens.length === 1);
  return enoughOverlap && overlap / Math.min(queryTokens.length, recordTokens.length) >= 0.6;
}

export function normalizeGreenbookResponse(payload: unknown): GreenbookRecord[] {
  const data = payload && typeof payload === "object" ? (payload as { data?: unknown }).data : undefined;
  if (!Array.isArray(data)) return [];

  const records: GreenbookRecord[] = [];
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const name = cleanGreenbookText(row.product_name);
    const nafdac = cleanGreenbookText(row.NAFDAC);
    if (!name || !nafdac) continue;

    const nested = (key: string, field: string) =>
      row[key] && typeof row[key] === "object"
        ? cleanGreenbookText((row[key] as Record<string, unknown>)[field])
        : undefined;
    const productId = typeof row.product_id === "number" ? row.product_id : undefined;
    const ingredient = nested("ingredient", "ingredient_name");

    records.push({
      productId,
      productName: name,
      nafdacNumber: normalizeRegNumber(nafdac),
      status: typeof row.status === "string" ? row.status.trim() : "Unknown",
      approvalDate: cleanGreenbookText(row.approval_date),
      expiryDate: cleanGreenbookText(row.expiry_date),
      applicant: nested("applicant", "name"),
      category: nested("product_category", "name"),
      dosageForm: nested("form", "name"),
      strength: cleanGreenbookText(row.strength),
      packSize: cleanGreenbookText(row.pack_size),
      composition: cleanGreenbookText(row.composition),
      activeIngredients: ingredient ? [ingredient] : undefined,
      detailsUrl: productId ? `${GREENBOOK_URL}/products/details/${productId}` : undefined,
    });
  }
  return records;
}

export function evaluateRegistration(records: GreenbookRecord[], query: GreenbookQuery): RegistrationCheck {
  const nrn = query.nafdacNumber ? normalizeRegNumber(query.nafdacNumber) : "";
  if (nrn) {
    const matched = records.filter((record) => record.nafdacNumber === nrn);
    return { status: registrationStatus(matched), records: matched };
  }

  const queryTokens = normalizeName(`${query.brand ?? ""} ${query.productName ?? ""}`);
  const matched = records.filter((record) => namesMatch(queryTokens, normalizeName(record.productName)));
  return { status: registrationStatus(matched), records: matched };
}

function registrationStatus(matched: GreenbookRecord[]): RegistrationStatus {
  if (matched.length === 0) return "not_found";
  return matched.some((record) => record.status.toLowerCase() === "active") ? "active" : "inactive";
}

export async function searchGreenbook(query: GreenbookQuery): Promise<GreenbookRecord[]> {
  const response = await fetch(buildGreenbookSearchUrl(query), {
    headers: {
      "User-Agent": "VerifyNG/1.0 (public NAFDAC registration lookup)",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`NAFDAC register search failed with status ${response.status}`);
  }
  return normalizeGreenbookResponse(await response.json());
}
