import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Address } from "../../types";
import { PrivacyConsentCheckbox } from "./PrivacyConsentCheckbox";

interface AuthModalProps {
  onClose: () => void;
  pendingAddress?: Address | null;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  pendingAddress,
  onOpenPrivacy,
  onOpenTerms,
  onSuccess
}) => {
  const { register, login, loginGoogle, loginDemo } = useAuth();
  const [mode, setMode] = useState<"register" | "login">(pendingAddress ? "register" : "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultMockAddress: Address = {
    uprn: "100051234501",
    buildingNumber: "1",
    thoroughfareName: "Church Street",
    singleLineAddress: "1, Church Street, Rothwell, Leeds, LS26 8XX",
    postcode: "LS26 8XX",
    custodianCode: "4720",
    councilName: "Leeds City Council"
  };

  const targetAddress = pendingAddress || defaultMockAddress;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !privacyAccepted) {
      setPrivacyError(true);
      setError("You must accept the Privacy Policy to create an account.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, name, targetAddress, privacyAccepted);
      } else {
        const res = await login(email, password);
        if (!res) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (mode === "register" && !privacyAccepted) {
      setPrivacyError(true);
      setError("Please accept the Privacy Policy to proceed.");
      return;
    }

    setLoading(true);
    try {
      await loginGoogle(targetAddress, privacyAccepted);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    setLoading(true);
    try {
      await loginDemo(targetAddress);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Demo sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 border-slate-700 relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <h3 className="text-2xl font-black text-white">
            {mode === "register" ? "Create your BinDay Account" : "Welcome Back"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "register"
              ? "Sync your schedule with your calendars and smart home."
              : "Sign in to access your customized bin schedule."}
          </p>

          {/* Pending Address Pill */}
          {pendingAddress && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[260px]">{pendingAddress.singleLineAddress}</span>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Social / Google Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="btn-secondary w-full py-2.5 mb-4 text-xs font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or with email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* GDPR Consent Checkbox on Registration */}
          {mode === "register" && (
            <PrivacyConsentCheckbox
              checked={privacyAccepted}
              onChange={(c) => {
                setPrivacyAccepted(c);
                setPrivacyError(false);
              }}
              onOpenPrivacy={onOpenPrivacy}
              onOpenTerms={onOpenTerms}
              error={privacyError}
            />
          )}

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "register" ? "Create Account & Sync" : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Instant Demo Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoAuth}
            disabled={loading}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5 p-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant 1-Click Demo Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
