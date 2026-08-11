import React from "react";
import { X, FileText } from "lucide-react";

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full p-6 border-slate-700 relative animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Terms of Service</h3>
              <p className="text-xs text-slate-400">Last updated: August 2026</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-slate-300 leading-relaxed pr-2">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">1. Acceptance of Terms</h4>
            <p>
              By accessing or using the BinDay UK application, you agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1">2. Service Provision</h4>
            <p>
              BinDay provides automated aggregation of publicly available UK council waste collection schedules. While we make every effort to maintain accurate and timely schedules, council schedules may change due to severe weather, industrial action, or emergency route changes.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-1">3. Personal & Smart Home Use</h4>
            <p>
              Users are provided with personal API and iCal tokens for calendar subscriptions and smart home automations (e.g. Home Assistant). Users agree not to abuse or overwhelm backend proxy endpoints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
