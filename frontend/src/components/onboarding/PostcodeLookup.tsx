import React, { useState } from "react";
import { Search, Loader2, MapPin, Sparkles, ShieldCheck } from "lucide-react";

interface PostcodeLookupProps {
  onSearch: (postcode: string) => Promise<void>;
  isLoading: boolean;
}

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
      setValidationError("Please enter a valid UK postcode (e.g. W1T 4JZ).");
      return;
    }

    try {
      setValidationError(null);
      await onSearch(clean);
    } catch (err: any) {
      setValidationError(err.message || `No addresses found for postcode "${clean}". Please check and try again.`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
        <span>Automated UK Council Bin Scraping & Calendar Feeds</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 mb-4">
        Never miss <span className="gradient-text-brand">bin day</span> again.
      </h1>
      
      <p className="text-stone-600 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed font-medium">
        Look up your UK address, personalize your physical bin colors, and get live calendar alerts straight to your phone.
      </p>

      {/* Postcode Form */}
      <form onSubmit={handleSubmit} className="glass-card p-2.5 sm:p-3 max-w-xl mx-auto mb-4 border-stone-300/80 shadow-md shadow-emerald-950/5">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={postcodeInput}
              onChange={handleInputChange}
              placeholder="e.g. W1T 4JZ"
              disabled={isLoading}
              maxLength={8}
              autoFocus
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 font-bold uppercase tracking-wider text-base focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !postcodeInput.trim()}
            className="btn-primary w-full sm:w-auto py-3 px-6 text-base shrink-0 cursor-pointer"
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
          <p className="text-xs text-rose-600 font-bold text-left mt-2 pl-2">
            {validationError}
          </p>
        )}
      </form>

      {/* Privacy Notice Subtext */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>No sign-up required to search your address and check council compatibility.</span>
      </div>
    </div>
  );
};
