import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";
import ManualEntry from "@/components/ManualEntry";
import VerificationResult from "@/components/VerificationResult";
import HowItWorks from "@/components/HowItWorks";
import { verifyProduct, type ProductInfo } from "@/lib/mockProducts";

const Index = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [result, setResult] = useState<{ product: ProductInfo | null; code: string } | null>(null);

  const handleVerify = useCallback((code: string) => {
    const product = verifyProduct(code);
    setResult({ product, code });
    setScannerActive(false);
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center gap-2.5 h-14">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">VerifyNG</span>
        </div>
      </header>

      <main className="container max-w-lg mx-auto pb-20">
        {!result ? (
          <>
            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-12 pb-8 text-center"
            >
              <h1 className="text-3xl sm:text-4xl font-bold leading-[1.1] mb-3">
                Is your product{" "}
                <span className="text-primary">genuine?</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                Scan any product barcode to instantly verify its authenticity, expiry date, and registration status.
              </p>
            </motion.section>

            {/* Scanner + Manual Entry */}
            <motion.section
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <BarcodeScanner
                onScan={handleVerify}
                isActive={scannerActive}
                onToggle={() => setScannerActive((v) => !v)}
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <ManualEntry onSubmit={handleVerify} />
            </motion.section>

            {/* Demo codes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 p-4 rounded-xl bg-secondary/60 border border-border/50"
            >
              <p className="text-xs text-muted-foreground mb-2 font-medium">Try these demo barcodes:</p>
              <div className="flex flex-wrap gap-2">
                {["5901234123457", "8901234567890", "6161100000001", "1234567890123"].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleVerify(code)}
                    className="px-3 py-1.5 text-xs font-mono bg-card rounded-md border border-border hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.97]"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </motion.div>

            <HowItWorks />
          </>
        ) : (
          <div className="pt-8">
            <VerificationResult
              product={result.product}
              scannedCode={result.code}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VerifyNG · Protecting Nigerian consumers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;