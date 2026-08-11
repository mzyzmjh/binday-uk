import React from "react";
import { CheckSquare, Square, Shield } from "lucide-react";

interface PrivacyConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  error?: boolean;
}

export const PrivacyConsentCheckbox: React.FC<PrivacyConsentCheckboxProps> = ({
  checked,
  onChange,
  onOpenPrivacy,
  onOpenTerms,
  error
}) => {
  return (
    <div className={`p-3 rounded-xl border transition-all ${
      error
        ? "bg-rose-950/20 border-rose-500/50"
        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
    }`}>
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="mt-0.5 text-emerald-400 hover:text-emerald-300 shrink-0 focus:outline-none"
        >
          {checked ? (
            <CheckSquare className="w-4 h-4 fill-emerald-500/20" />
          ) : (
            <Square className={`w-4 h-4 ${error ? "text-rose-400" : "text-slate-500"}`} />
          )}
        </button>

        <div className="text-xs text-slate-300 leading-normal">
          <span>I agree to the </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTerms();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
          >
            Terms of Service
          </button>
          <span> and </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPrivacy();
            }}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
          >
            Privacy Policy
          </button>
          <span className="text-slate-500 text-[10px] block mt-0.5">
            (GDPR Compliant • We only store your address for bin collection sync)
          </span>
        </div>
      </label>
    </div>
  );
};
