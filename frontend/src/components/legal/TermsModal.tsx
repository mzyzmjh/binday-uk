import React from "react";
import { X, FileText } from "lucide-react";

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Terms of Service</h3>
              <p className="text-xs text-stone-500 font-medium">Last updated: August 2026</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-stone-700 leading-relaxed pr-2 font-medium">
          <div>
            <h4 className="text-sm font-black text-stone-900 mb-1">1. Acceptance of Terms</h4>
            <p>
              By accessing or using the BinDay UK application, you agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black text-stone-900 mb-1">2. Service Provision</h4>
            <p>
              BinDay provides automated aggregation of publicly available UK council waste collection schedules. While we make every effort to maintain accurate and timely schedules, council schedules may change due to severe weather, industrial action, or emergency route changes.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black text-stone-900 mb-1">3. Personal & Smart Home Use</h4>
            <p>
              Users are provided with personal API and iCal tokens for calendar subscriptions and smart home automations (e.g. Home Assistant). Users agree not to abuse or overwhelm backend proxy endpoints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
