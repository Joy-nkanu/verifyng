import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, Calendar, Factory, MapPin, Hash, FileText, Users, ArrowLeft, AlertTriangle } from "lucide-react";
import type { ProductInfo } from "@/lib/mockProducts";

interface VerificationResultProps {
  product: ProductInfo | null;
  scannedCode: string;
  onReset: () => void;
}

const VerificationResult = ({ product, scannedCode, onReset }: VerificationResultProps) => {
  const isExpired = product ? new Date(product.expiryDate) < new Date() : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 active:scale-[0.97]"
      >
        <ArrowLeft className="w-4 h-4" />
        Scan another product
      </button>

      {!product ? (
        <div className="bg-card rounded-2xl p-8 shadow-sm shadow-foreground/5 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            No product with barcode <span className="font-mono font-semibold text-foreground">{scannedCode}</span> was found in our database. This product may be counterfeit or unregistered.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Do not consume this product. Report to NAFDAC if suspicious.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Banner */}
          <div
            className={`rounded-2xl p-6 flex items-center gap-4 ${
              product.isAuthentic && !isExpired
                ? "bg-primary/10 border border-primary/20"
                : "bg-destructive/10 border border-destructive/20"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                product.isAuthentic && !isExpired ? "bg-primary" : "bg-destructive"
              }`}
            >
              {product.isAuthentic && !isExpired ? (
                <ShieldCheck className="w-7 h-7 text-primary-foreground" />
              ) : (
                <ShieldX className="w-7 h-7 text-destructive-foreground" />
              )}
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  product.isAuthentic && !isExpired ? "text-primary" : "text-destructive"
                }`}
              >
                {product.isAuthentic && !isExpired
                  ? "Verified Authentic"
                  : isExpired
                  ? "Product Expired"
                  : "Potentially Counterfeit"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {product.isAuthentic && !isExpired
                  ? "This product is registered and verified."
                  : isExpired
                  ? "This product has passed its expiry date."
                  : "This product could not be verified. Exercise caution."}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-2xl p-6 shadow-sm shadow-foreground/5">
            <h3 className="font-display font-bold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">{product.brand} · {product.category}</p>

            <div className="space-y-4">
              <DetailRow icon={Hash} label="Barcode" value={product.barcode} mono />
              <DetailRow icon={FileText} label="NAFDAC Reg. No." value={product.nafdacNumber} mono />
              <DetailRow icon={Hash} label="Batch Number" value={product.batchNumber} mono />
              <DetailRow icon={Calendar} label="Production Date" value={formatDate(product.productionDate)} />
              <DetailRow
                icon={Calendar}
                label="Expiry Date"
                value={formatDate(product.expiryDate)}
                alert={isExpired}
              />
              <DetailRow icon={Factory} label="Manufacturer" value={product.manufacturer} />
              <DetailRow icon={MapPin} label="Country of Origin" value={product.countryOfOrigin} />
              <DetailRow icon={Users} label="Times Verified" value={product.verificationCount.toLocaleString()} />
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-card rounded-2xl p-6 shadow-sm shadow-foreground/5">
            <h4 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Ingredients / Composition
            </h4>
            <p className="text-sm leading-relaxed">{product.ingredients}</p>
          </div>

          {isExpired && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm">
                This product expired on <strong>{formatDate(product.expiryDate)}</strong>. Do not consume expired products.
              </p>
            </div>
          )}
        </div>
      )}
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
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default VerificationResult;