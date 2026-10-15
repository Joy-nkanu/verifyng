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