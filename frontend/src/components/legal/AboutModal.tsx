import React from "react";
import { X, Heart, Github, ExternalLink, Info, Code, ShieldCheck, Sparkles } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">About BinDay UK</h2>
              <p className="text-xs text-stone-500 font-medium">Personal Project & Open-Source Attribution</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed pr-2">
          {/* Project Summary */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Independent Personal Project</span>
            </h3>
            <p className="text-stone-700 font-medium">
              BinDay UK is an independent, non-commercial personal project developed to help UK residents easily track their household bin collection schedules, receive automatic calendar reminders, and integrate with smart home systems.
            </p>
            <p className="text-stone-500 text-xs font-medium">
              This application is not officially affiliated with, endorsed by, or operated by any UK local government council or municipality.
            </p>
          </div>

          {/* Open-Source Attribution */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 shadow-sm">
            <h3 className="text-sm font-black text-emerald-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-700" />
              <span>Open-Source Scraping Engine Attribution</span>
            </h3>
            <p className="text-stone-800 font-medium">
              The automated council scraping functionality is powered by the fantastic open-source library{" "}
              <a
                href="https://github.com/robbrad/UKBinCollectionData"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>robbrad/UKBinCollectionData</span>
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
              .
            </p>
            <p className="text-stone-600 text-xs font-medium">
              Enormous gratitude and credit to <strong>@robbrad</strong> and the community of open-source contributors who write and maintain Python scraper modules for hundreds of UK councils.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/robbrad/UKBinCollectionData"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 font-bold text-xs hover:border-emerald-500 hover:text-emerald-900 transition-colors shadow-sm"
              >
                <Github className="w-4 h-4" />
                <span>View robbrad/UKBinCollectionData on GitHub</span>
              </a>
            </div>
          </div>

          {/* Technology & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs">
                <Code className="w-4 h-4 text-sky-700" />
                <span>Built With Modern Web Tech</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                React, TypeScript, Tailwind CSS, Google Cloud Functions, Firebase Firestore & Ordnance Survey / Postcoder APIs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Privacy & GDPR Compliant</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                No tracking cookies or advertising. You can export or delete all personal data at any time from your account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            BinDay UK • Made with care
          </span>
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
