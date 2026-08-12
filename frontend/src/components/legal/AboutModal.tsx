import React from "react";
import { X, Heart, Github, ExternalLink, Info, Code, ShieldCheck, Sparkles } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">About BinDay UK</h2>
              <p className="text-xs text-slate-400 font-medium">Personal Project & Open-Source Attribution</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed pr-2">
          {/* Project Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Independent Personal Project</span>
            </h3>
            <p className="text-slate-300">
              BinDay UK is an independent, non-commercial personal project developed to help UK residents easily track their household bin collection schedules, receive automatic calendar reminders, and integrate with smart home systems.
            </p>
            <p className="text-slate-400 text-xs">
              This application is not officially affiliated with, endorsed by, or operated by any UK local government council or municipality.
            </p>
          </div>

          {/* Open-Source Attribution */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Open-Source Scraping Engine Attribution</span>
            </h3>
            <p className="text-slate-300">
              The automated council scraping functionality is powered by the fantastic open-source library{" "}
              <a
                href="https://github.com/robbrad/UKBinCollectionData"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>robbrad/UKBinCollectionData</span>
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
              .
            </p>
            <p className="text-slate-400 text-xs">
              Enormous gratitude and credit to <strong>@robbrad</strong> and the community of open-source contributors who write and maintain Python scraper modules for hundreds of UK councils.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/robbrad/UKBinCollectionData"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs hover:border-emerald-500 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View robbrad/UKBinCollectionData on GitHub</span>
              </a>
            </div>
          </div>

          {/* Technology & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <Code className="w-4 h-4 text-sky-400" />
                <span>Built With Modern Web Tech</span>
              </div>
              <p className="text-xs text-slate-400">
                React, TypeScript, Tailwind CSS, Google Cloud Functions, Firebase Firestore & Ordnance Survey / Postcoder APIs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Privacy & GDPR Compliant</span>
              </div>
              <p className="text-xs text-slate-400">
                No tracking cookies or advertising. You can export or delete all personal data at any time from your account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            BinDay UK v1.2.0 • Made with care
          </span>
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
