import type { NafdacCheck } from "@/lib/nafdacVerify";

export type ProductResultKind =
  | "loading"
  | "sample"
  | "catalog_match"
  | "no_catalog_match"
  | "lookup_error";

export function getProductResultKind(
  state: "loading" | "sample" | "found" | "not_found" | "error",
): ProductResultKind {
  switch (state) {
    case "loading":
      return "loading";
    case "sample":
      return "sample";
    case "found":
      return "catalog_match";
    case "not_found":
      return "no_catalog_match";
    case "error":
      return "lookup_error";
  }
}

export type NafdacStatusKind =
  | "nafdac_verified"
  | "nafdac_inactive"
  | "nafdac_not_found"
  | "nafdac_unavailable";

export function getNafdacStatusKind(check: NafdacCheck | undefined | null): NafdacStatusKind {
  switch (check?.status) {
    case "active":
      return "nafdac_verified";
    case "inactive":
      return "nafdac_inactive";
    case "not_found":
      return "nafdac_not_found";
    default:
      return "nafdac_unavailable";
  }
}
