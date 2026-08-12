import React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Address, CouncilConfig } from "../../types";

interface CouncilStatusCardProps {
  address: Address;
  councilConfig: CouncilConfig;
  onProceedToAuth: () => void;
  onOpenProprietaryModal: () => void;
  proprietaryId?: string;
}

export const CouncilStatusCard: React.FC<CouncilStatusCardProps> = ({
  address,
  councilConfig,
  onProceedToAuth,
  onOpenProprietaryModal,
  proprietaryId
}) => {
  const isSupported = councilConfig.isSupported;
  const isDegraded = councilConfig.status === "degraded";
  const needsProprietary = councilConfig.requiresProprietaryId && !proprietaryId;

  return (
    <div className="glass-card p-6 border-emerald-200 shadow-sm max-w-xl mx-auto mt-6 animate-slide-up">
      {/* Header status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-800">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Council Supported
            </span>
            {isDegraded && (
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Service Degraded
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-stone-900">
            We track collections for {address.councilName || councilConfig.councilName}
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Selected Address: <span className="text-stone-900 font-bold">{address.singleLineAddress}</span>
          </p>
        </div>
      </div>

      {/* Proprietary ID notice if required */}
      {councilConfig.requiresProprietaryId && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 mb-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              {proprietaryId
                ? `Reference ID set: ${proprietaryId}`
                : `This council requires a ${councilConfig.proprietaryIdLabel || "Web Reference ID"} from their portal.`}
            </span>
          </div>

          <button
            onClick={onOpenProprietaryModal}
            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{proprietaryId ? "Edit ID" : "Enter ID"}</span>
          </button>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={needsProprietary ? onOpenProprietaryModal : onProceedToAuth}
        className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
      >
        <span>
          {needsProprietary
            ? `Enter ${councilConfig.proprietaryIdLabel || "Council ID"} to Continue`
            : "Continue to Sign In & Setup Bins"}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
