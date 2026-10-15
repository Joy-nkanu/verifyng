export interface CatalogLookupResult {
  found: boolean;
  product: Record<string, unknown> | null;
}

export function isValidBarcode(value: unknown): value is string {
  return typeof value === "string" && /^\d{8,14}$/.test(value);
}

export function normalizeCatalogResponse(payload: unknown): CatalogLookupResult {
  if (!payload || typeof payload !== "object") return { found: false, product: null };
  const response = payload as { status?: unknown; product?: unknown };
  if (response.status !== 1 || !response.product || typeof response.product !== "object") {
    return { found: false, product: null };
  }
  return { found: true, product: response.product as Record<string, unknown> };
}