import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Address, CouncilConfig } from "../../types";
import { submitFeatureRequest } from "../../firebase/firestoreService";

interface WaitlistFormProps {
  address: Address;
  councilConfig: CouncilConfig;
  onReset: () => void;
}

export const WaitlistForm: React.FC<WaitlistFormProps> = ({ address, councilConfig, onReset }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitFeatureRequest({
        email: email.trim(),
        postcode: address.postcode,
        councilName: councilConfig.councilName,
        custodianCode: councilConfig.custodianCode,
        addressString: address.singleLineAddress
      });
      setSubmitted(true);
    } catch (err: any) {
      setError("Failed to register request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border-amber-500/30 max-w-xl mx-auto mt-6 animate-slide-up text-left">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Coming Soon
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            We don't currently support {councilConfig.councilName}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Our scrapers are continuously expanding to cover all 300+ UK councils. Join the priority waitlist to be notified the moment support is released for <span className="font-semibold text-slate-100">{address.postcode}</span>.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">You're on the priority waitlist!</p>
            <p className="text-slate-300 mt-0.5">
              We'll email <span className="font-mono text-emerald-300">{email}</span> as soon as {councilConfig.councilName} scraping goes live.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="flex-1 px-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2.5 px-4 text-xs shrink-0 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Submitting..." : "Notify Me"}</span>
              </button>
            </div>
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>
        </form>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-white underline font-medium"
        >
          Try another postcode
        </button>
        <span className="text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Zero Spam Guarantee
        </span>
      </div>
    </div>
  );
};
