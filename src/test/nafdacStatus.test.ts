import { describe, expect, it } from "vitest";
import { getNafdacStatusKind } from "@/lib/productStatus";

describe("nafdac registration status kinds", () => {
  it("marks verified only when the register confirms an active registration", () => {
    expect(getNafdacStatusKind({ status: "active", records: [] })).toBe("nafdac_verified");
  });

  it("never presents inactive or missing registrations as verified", () => {
    expect(getNafdacStatusKind({ status: "inactive", records: [] })).toBe("nafdac_inactive");
    expect(getNafdacStatusKind({ status: "not_found", records: [] })).toBe("nafdac_not_found");
  });

  it("treats an unreachable register as unverified, not as a failure of the product", () => {
    expect(getNafdacStatusKind({ status: "unavailable", records: [] })).toBe("nafdac_unavailable");
    expect(getNafdacStatusKind(undefined)).toBe("nafdac_unavailable");
  });
});
