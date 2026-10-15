export interface ProductInfo {
  name: string;
  brand: string;
  category: string;
  barcode: string;
  nafdacNumber?: string;
  batchNumber?: string;
  productionDate?: string;
  expiryDate?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  ingredients?: string;
  source: "sample" | "catalog";
  sourceUrl?: string;
  imageUrl?: string;
}

export const mockProducts: Record<string, ProductInfo> = {
  "5901234123457": {
    name: "Paracetamol 500mg Tablets",
    brand: "Emzor Pharma",
    category: "Pharmaceutical",
    barcode: "5901234123457",
    nafdacNumber: "A4-0123",
    batchNumber: "BN-2025-0891",
    productionDate: "2025-01-15",
    expiryDate: "2027-01-15",
    manufacturer: "Emzor Pharmaceutical Industries Ltd",
    countryOfOrigin: "Nigeria",
    ingredients: "Paracetamol BP 500mg, Maize Starch, Povidone K30, Stearic Acid",
    source: "sample",
  },
  "8901234567890": {
    name: "Golden Penny Semovita 2kg",
    brand: "Golden Penny",
    category: "Food",
    barcode: "8901234567890",
    nafdacNumber: "B1-4567",
    batchNumber: "GP-2025-3421",
    productionDate: "2025-02-20",
    expiryDate: "2026-02-20",
    manufacturer: "Flour Mills of Nigeria Plc",
    countryOfOrigin: "Nigeria",
    ingredients: "100% Cassava Flour, Vitamins (A, B1, B2, Niacin, Folic Acid, Iron, Zinc)",
    source: "sample",
  },
  "1234567890123": {
    name: "Suspicious Paracetamol 500mg",
    brand: "Unknown Brand",
    category: "Pharmaceutical",
    barcode: "1234567890123",
    nafdacNumber: "UNREGISTERED",
    batchNumber: "XX-0000",
    productionDate: "2024-06-01",
    expiryDate: "2024-12-01",
    manufacturer: "Unverified Source",
    countryOfOrigin: "Unknown",
    ingredients: "Not verified",
    source: "sample",
  },
  "6161100000001": {
    name: "Peak Evaporated Milk 170g",
    brand: "Peak",
    category: "Dairy",
    barcode: "6161100000001",
    nafdacNumber: "C2-8901",
    batchNumber: "PK-2025-7712",
    productionDate: "2025-03-01",
    expiryDate: "2026-09-01",
    manufacturer: "FrieslandCampina WAMCO Nigeria Plc",
    countryOfOrigin: "Nigeria",
    ingredients: "Fresh Cow Milk, Vegetable Fat, Stabilizer (E339), Vitamins A, D3",
    source: "sample",
  },
};

export function verifyProduct(barcode: string): ProductInfo | null {
  return mockProducts[barcode] || null;
}