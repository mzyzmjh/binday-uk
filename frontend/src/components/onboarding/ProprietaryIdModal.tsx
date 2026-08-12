import React, { useState } from "react";
import { X, Key, ExternalLink, ArrowRight, Info } from "lucide-react";
import { CouncilConfig } from "../../types";

interface ProprietaryIdModalProps {
  councilConfig: CouncilConfig;
  currentId?: string;
  onSave: (id: string) => void;
  onClose: () => void;
}

export const ProprietaryIdModal: React.FC<ProprietaryIdModalProps> = ({
  councilConfig,
  currentId = "",
  onSave,
  onClose
}) => {
  const [val, setVal] = useState(currentId);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) {
      setError("Please enter the reference ID from your council website.");
      return;
    }
    onSave(val.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-slide-up text-stone-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900">Council Reference Required</h3>
            <p className="text-xs text-stone-500 font-medium">{councilConfig.councilName}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 mb-5 space-y-2 text-xs text-stone-700 shadow-sm">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-medium">
              Unlike most UK councils that use standard UPRNs, {councilConfig.councilName} requires a proprietary reference number to look up bin dates.
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1 font-medium">
            <li>Visit your council bin lookup webpage.</li>
            <li>Search for your address and copy the property ID number from the URL or results page.</li>
            <li>Paste the reference number below.</li>
          </ol>
        </div>

        {councilConfig.proprietaryIdHelpUrl && (
          <a
            href={councilConfig.proprietaryIdHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-bold mb-4"
          >
            <span>Open {councilConfig.councilName} Lookup Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              {councilConfig.proprietaryIdLabel || "Property Reference ID"}
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => {
                setError(null);
                setVal(e.target.value);
              }}
              placeholder="e.g. 10098234 or REF-8812"
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono text-sm font-bold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            />
            {error && <p className="text-xs text-rose-600 font-bold mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 cursor-pointer"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
