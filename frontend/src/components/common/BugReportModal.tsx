import React, { useState } from "react";
import { X, Bug, Send, Loader2, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { submitBugReport } from "../../firebase/firestoreService";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (title: string, message: string) => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>("Incorrect bin dates");
  const [description, setDescription] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>(user?.email || "");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    "Incorrect bin dates",
    "Missing bin types",
    "Address / Postcode issue",
    "Calendar subscription (.ics)",
    "UI / Display glitch",
    "Other issue"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Please describe the issue you encountered.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Diagnostic metadata collected automatically to help reproduce
      const metadata = {
        uid: user?.uid || "anonymous",
        councilName: user?.address?.councilName || "Unknown",
        custodianCode: user?.address?.custodianCode || "Unknown",
        uprn: user?.address?.uprn || "Unknown",
        postcode: user?.address?.postcode || "Unknown",
        singleLineAddress: user?.address?.singleLineAddress || "Unknown",
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        appUrl: window.location.href,
        timestamp: new Date().toISOString()
      };

      await submitBugReport({
        category,
        description: description.trim(),
        contactEmail: contactEmail.trim() || user?.email || "anonymous@binday.app",
        metadata
      });

      setSubmitted(true);
      if (onShowToast) {
        onShowToast("Report Submitted", "Thank you for helping improve BinDay UK!");
      }
      setTimeout(() => {
        setSubmitted(false);
        setDescription("");
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error("Bug report submission error:", err);
      setErrorMessage("Failed to submit bug report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Report an Issue</h2>
              <p className="text-xs text-slate-400 font-medium">Help us fix incorrect council dates or bugs</p>
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

        {/* Form Content */}
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Report Received!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your feedback has been saved with diagnostic details. We'll look into it right away.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto py-5 space-y-4 text-xs pr-1">
            {/* Issue Category */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                What type of problem are you experiencing?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                Description of the issue <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Please describe what went wrong (e.g. My recycling is actually on Thursdays, but the app shows Wednesdays)..."
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                Your Email (Optional, if you'd like a response)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Metadata Preview Card */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Automatic Diagnostic Context Included:</span>
              </div>
              <p className="text-slate-500">
                Council: <span className="text-slate-300 font-mono">{user?.address?.councilName || "Not logged in"}</span> • UPRN: <span className="text-slate-300 font-mono">{user?.address?.uprn || "N/A"}</span>
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border-amber-600"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Bug Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
