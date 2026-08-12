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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Report an Issue</h2>
              <p className="text-xs text-stone-500 font-medium">Help us fix incorrect council dates or bugs</p>
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

        {/* Form Content */}
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto animate-bounce-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Report Received!</h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto font-medium">
              Your feedback has been saved with diagnostic details. We'll look into it right away.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto py-5 space-y-4 text-xs pr-1">
            {/* Issue Category */}
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-800">
                What type of problem are you experiencing?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-sm cursor-pointer"
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
              <label className="block font-bold text-stone-800">
                Description of the issue <span className="text-amber-700 font-bold">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Please describe what went wrong (e.g. My recycling is actually on Thursdays, but the app shows Wednesdays)..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-medium placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 resize-none shadow-sm"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-800">
                Your Email (Optional, if you'd like a response)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-medium placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-sm"
              />
            </div>

            {/* Metadata Preview Card */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1 shadow-sm">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Automatic Diagnostic Context Included:</span>
              </div>
              <p className="text-stone-500 font-medium">
                Council: <span className="text-stone-800 font-bold font-mono">{user?.address?.councilName || "Not logged in"}</span> • UPRN: <span className="text-stone-800 font-mono font-bold">{user?.address?.uprn || "N/A"}</span>
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 border-amber-700/30 cursor-pointer"
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
