import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const BarcodeScanner = ({ onScan, isActive, onToggle }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      return;
    }

    const scanner = new Html5Qrcode("barcode-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(() => {});
          onToggle();
        },
        () => {}
      )
      .catch((err) => {
        setError("Camera access denied. Please allow camera permissions or enter the barcode manually.");
        console.error(err);
        onToggle();
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [isActive, onScan, onToggle]);

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
      >
        {isActive ? (
          <>
            <CameraOff className="w-5 h-5" />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Scan Barcode
          </>
        )}
      </button>

      {isActive && (
        <div className="mt-4 relative rounded-lg overflow-hidden bg-foreground/5">
          <div id="barcode-reader" className="w-full" />
          <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 rounded-lg">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[260px] h-[160px]">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />
              <div className="absolute left-2 right-2 h-0.5 bg-primary/60 animate-scan-line" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default BarcodeScanner;