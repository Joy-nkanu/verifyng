import { describe, expect, it } from "vitest";
import { getProductResultKind } from "@/lib/productStatus";

describe("product result status", () => {
  it("keeps sample records distinct from live catalog matches", () => {
    expect(getProductResultKind("sample")).toBe("sample");
    expect(getProductResultKind("found")).toBe("catalog_match");
  });

  it("does not treat a missing catalog entry as proof of counterfeit", () => {
    expect(getProductResultKind("not_found")).toBe("no_catalog_match");
  });

  it("keeps loading and catalog errors distinct from product results", () => {
    expect(getProductResultKind("loading")).toBe("loading");
    expect(getProductResultKind("error")).toBe("lookup_error");
  });
});