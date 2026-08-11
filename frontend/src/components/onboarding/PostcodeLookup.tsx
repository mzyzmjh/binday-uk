import React, { useState } from "react";
import { Search, Loader2, MapPin, Sparkles } from "lucide-react";

interface PostcodeLookupProps {
  onSearch: (postcode: string) => Promise<void>;
  isLoading: boolean;
}

export const SAMPLE_POSTCODES = [
  { postcode: "LS26 8XX", name: "Leeds", tag: "Supported" },
  { postcode: "M1 1AA", name: "Manchester", tag: "Supported" },
  { postcode: "BS1 5AH", name: "Bristol", tag: "Supported" },
  { postcode: "EX1 1ID", name: "Exeter Ref", tag: "Proprietary ID" },
  { postcode: "ZZ99 9ZZ", name: "Highlands", tag: "Unsupported Demo" }
];

export const PostcodeLookup: React.FC<PostcodeLookupProps> = ({ onSearch, isLoading }) => {
  const [postcodeInput, setPostcodeInput] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatPostcode = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length > 7) clean = clean.slice(0, 7);
    if (clean.length > 3) {
      return `${clean.slice(0, -3)} ${clean.slice(-3)}`;
    }
    return clean;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setPostcodeInput(formatPostcode(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = postcodeInput.trim().toUpperCase();
    if (!clean) {
      setValidationError("Please enter your UK postcode.");
      return;
    }

    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(clean)) {
      setValidationError("Please enter a valid UK postcode (e.g. LS26 8XX).");
      return;
    }

    await onSearch(clean);
  };

  const handleQuickSample = async (pc: string) => {
    setPostcodeInput(pc);
    setValidationError(null);
    await onSearch(pc);
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Automated UK Council Bin Scraping & Calendar Sync</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
        Never miss <span className="gradient-text-brand">bin day</span> again.
      </h1>
      
      <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
        Look up your UK address, personalize your physical bin colors, and get live calendar alerts straight to your phone.
      </p>

      {/* Postcode Form */}
      <form onSubmit={handleSubmit} className="glass-card p-2 sm:p-3 max-w-xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={postcodeInput}
              onChange={handleInputChange}
              placeholder="e.g. LS26 8XX"
              disabled={isLoading}
              maxLength={8}
              autoFocus
              className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-semibold uppercase tracking-wider text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !postcodeInput.trim()}
            className="btn-primary w-full sm:w-auto py-3 px-6 text-base shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Address</span>
              </>
            )}
          </button>
        </div>

        {validationError && (
          <p className="text-xs text-rose-400 font-medium text-left mt-2 pl-2">
            {validationError}
          </p>
        )}
      </form>

      {/* Quick Sample Postcodes */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="font-medium mr-1">Quick demo postcodes:</span>
        {SAMPLE_POSTCODES.map((item) => (
          <button
            key={item.postcode}
            type="button"
            onClick={() => handleQuickSample(item.postcode)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-mono active:scale-95"
          >
            {item.postcode} <span className="text-[10px] text-slate-400">({item.name})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
