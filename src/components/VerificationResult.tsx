import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Calendar, Factory, MapPin, Hash, FileText, ArrowLeft, AlertTriangle, LoaderCircle, ExternalLink } from "lucide-react";
import type { ProductInfo } from "@/lib/mockProducts";
import { getProductResultKind } from "@/lib/productStatus";
import { Button } from "@/components/ui/button";

interface VerificationResultProps {
  product: ProductInfo | null;
  scannedCode: string;
  lookupState: "loading" | "sample" | "found" | "not_found" | "error";
  onReset: () => void;
}

const VerificationResult = ({ product, scannedCode, lookupState, onReset }: VerificationResultProps) => {
  const kind = getProductResultKind(lookupState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <Button
        onClick={onReset}
        variant="ghost"
        className="mb-6 px-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Scan another product
      </Button>

      {kind === "loading" ? (
        <div className="py-16 text-center" role="status" aria-live="polite">
          <LoaderCircle className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold mb-2">Looking up barcode</h2>
          <p className="text-sm text-muted-foreground font-mono">{scannedCode}</p>
        </div>
      ) : kind === "no_catalog_match" || kind === "lookup_error" ? (
        <div className="bg-card rounded-xl p-8 shadow-sm shadow-foreground/5 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${kind === "lookup_error" ? "bg-warning/10" : "bg-secondary"}`}>
            {kind === "lookup_error" ? <AlertTriangle className="w-8 h-8 text-warning" /> : <ShieldX className="w-8 h-8 text-muted-foreground" />}
          </div>
          <h2 className="text-xl font-bold mb-2">{kind === "lookup_error" ? "Lookup unavailable" : "No product listing found"}</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {kind === "lookup_error"
              ? "The product catalog could not be reached. Please try again."
              : <>No listing for barcode <span className="font-mono font-semibold text-foreground">{scannedCode}</span> was found in the product catalog.</>}
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            A missing listing does not prove a product is counterfeit. This catalog cannot confirm NAFDAC registration, batch authenticity, production date, or expiry date.
          </p>
        </div>
      ) : product ? (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className={`rounded-xl p-6 flex items-center gap-4 ${product.source === "sample" ? "bg-secondary border border-border" : "bg-primary/10 border border-primary/20"}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${product.source === "sample" ? "bg-muted" : "bg-primary"}`}>
              {product.source === "sample" ? <AlertTriangle className="w-7 h-7 text-muted-foreground" /> : <ShieldCheck className="w-7 h-7 text-primary-foreground" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold">
                {product.source === "sample" ? "Sample record" : "Product listing found"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {product.source === "sample"
                  ? "Example data only — this is not a live product check."
                  : "A catalog entry matches this barcode. Authenticity is not verified."}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-xl p-6 shadow-sm shadow-foreground/5">
            <h3 className="font-display font-bold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">{product.brand} · {product.category}</p>

            <div className="space-y-4">
              <DetailRow icon={Hash} label="Barcode" value={product.barcode} mono />
              <DetailRow icon={FileText} label="NAFDAC Reg. No." value={product.nafdacNumber || "Not available from this source"} mono />
              <DetailRow icon={Hash} label="Batch Number" value={product.batchNumber || "Not available from this source"} mono />
              <DetailRow icon={Calendar} label="Production Date" value={product.productionDate ? formatDate(product.productionDate) : "Not available from this source"} />
              <DetailRow icon={Calendar} label="Expiry Date" value={product.expiryDate ? formatDate(product.expiryDate) : "Not available from this source"} />
              <DetailRow icon={Factory} label="Manufacturer / Production place" value={product.manufacturer || "Not available from this source"} />
              <DetailRow icon={MapPin} label="Country" value={product.countryOfOrigin || "Not available from this source"} />
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-card rounded-xl p-6 shadow-sm shadow-foreground/5">
            <h4 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Ingredients / Composition
            </h4>
            <p className="text-sm leading-relaxed">{product.ingredients || "Not available from this source."}</p>
          </div>

          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm">
              {product.source === "sample"
                ? "Sample values are illustrative and may not describe any real package or batch."
                : "This public catalog does not verify NAFDAC registration, batch authenticity, production date, or expiry date."}
            </p>
          </div>

          {product.source === "catalog" && product.sourceUrl && (
            <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              View catalog record <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${alert ? "text-destructive" : "text-muted-foreground"}`} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? "font-mono" : ""} ${alert ? "text-destructive" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default VerificationResult;