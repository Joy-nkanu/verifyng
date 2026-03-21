import { useState } from "react";
import { Search } from "lucide-react";

interface ManualEntryProps {
  onSubmit: (code: string) => void;
}

const ManualEntry = ({ onSubmit }: ManualEntryProps) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
      setCode("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Or enter barcode number manually
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 5901234123457"
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow font-mono text-sm"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="px-5 py-3 rounded-lg bg-foreground text-background font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ManualEntry;