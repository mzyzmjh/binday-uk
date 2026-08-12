import React from "react";
import { X, Shield, Lock, Trash2, Download } from "lucide-react";

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Privacy Policy & GDPR Compliance</h3>
              <p className="text-xs text-stone-500 font-medium">Last updated: August 2026 • Version 1.0</p>
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
            <h4 className="text-sm font-black text-stone-900 mb-1">1. Information We Collect</h4>
            <p>
              To provide bin collection schedules, BinDay collects and processes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-1 text-stone-600">
              <li>Your address details (Unique Property Reference Number - UPRN, postcode, and council name).</li>
              <li>Your email address (for authentication and account management).</li>
              <li>Your customized preferences (bin color choices, custom alias names, and reminder preferences).</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-stone-900 mb-1">2. How We Use Your Data</h4>
            <p>
              Your data is exclusively used to fetch council collection schedules, generate your calendar subscription feed (.ics), and dispatch automated reminders. We do not sell your personal data or use third-party marketing tracking cookies.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 shadow-sm">
            <h4 className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>3. Your GDPR Rights</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Right to Data Portability:</span>
                  <p className="text-[11px] text-stone-500">Download a full JSON copy of your profile and data anytime from Settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Right to Erasure (Deletion):</span>
                  <p className="text-[11px] text-stone-500">Permanently delete your account and all stored records instantly in Settings.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-stone-900 mb-1">4. Data Security</h4>
            <p>
              All communications are encrypted via HTTPS/TLS. User data is stored securely in ISO/IEC 27001 certified Google Cloud Firestore datacenters with strict security rules enforcing authentication boundaries.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5 cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
