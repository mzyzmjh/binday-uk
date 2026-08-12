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
        ? "bg-rose-50 border-rose-300"
        : "bg-stone-50 border-stone-200 hover:border-stone-300 shadow-sm"
    }`}>
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="mt-0.5 text-emerald-700 hover:text-emerald-900 shrink-0 focus:outline-none cursor-pointer"
        >
          {checked ? (
            <CheckSquare className="w-4 h-4 fill-emerald-100" />
          ) : (
            <Square className={`w-4 h-4 ${error ? "text-rose-500" : "text-stone-400"}`} />
          )}
        </button>

        <div className="text-xs text-stone-700 leading-normal font-medium">
          <span>I agree to the </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTerms();
            }}
            className="text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2 cursor-pointer"
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
            className="text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2 cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-stone-500 text-[10px] block mt-0.5">
            (GDPR Compliant • We only store your address for bin collection sync)
          </span>
        </div>
      </label>
    </div>
  );
};
