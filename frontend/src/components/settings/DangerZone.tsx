import React, { useState } from "react";
import { Trash2, Download, RotateCcw, ShieldAlert, AlertTriangle, X, Home, Bug, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface DangerZoneProps {
  onShowToast?: (title: string, message: string) => void;
  onOpenChangeAddress?: () => void;
  onOpenBugReport?: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  onShowToast,
  onOpenChangeAddress,
  onOpenBugReport
}) => {
  const { user, downloadData, resetTokens, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleDownload = async () => {
    await downloadData();
    if (onShowToast) {
      onShowToast("Data Exported", "Your GDPR personal data archive has been downloaded.");
    }
  };

  const handleResetTokens = async () => {
    setResetting(true);
    try {
      await resetTokens();
      if (onShowToast) {
        onShowToast("Tokens Revoked", "New calendar and API tokens generated. Previous links invalidated.");
      }
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmInput !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount();
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property & Address Management */}
      <div className="glass-card p-6 border-emerald-900/40 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <span>Property & Address</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Moved house or selected the wrong flat? You can change your registered property at any time.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{user?.address?.singleLineAddress || "No address set"}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Council: {user?.address?.councilName} • UPRN: {user?.address?.uprn}
            </p>
          </div>

          {onOpenChangeAddress && (
            <button
              type="button"
              onClick={onOpenChangeAddress}
              className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Change Address</span>
            </button>
          )}
        </div>
      </div>

      {/* GDPR Privacy & Token Management */}
      <div className="glass-card p-6 border-rose-500/30 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>GDPR Privacy & Account Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Manage your personal data portability, rotate secret feed tokens, or report issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GDPR Data Portability Export */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-400" />
                <span>Download My Data (JSON)</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Under GDPR Article 20, export a full machine-readable JSON archive of your profile and schedule history.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Archive</span>
            </button>
          </div>

          {/* Token Revocation / Reset */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Regenerate Secret Tokens</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Immediately revoke and rotate your calendar URL and API tokens if accidentally shared.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetTokens}
              disabled={resetting}
              className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 hover:text-amber-400"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Rotating..." : "Reset Tokens"}</span>
            </button>
          </div>

          {/* Bug Report */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-amber-400" />
                <span>Report an Issue</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Found incorrect collection dates or a bug? Submit a report with automatic diagnostics.
              </p>
            </div>

            {onOpenBugReport && (
              <button
                type="button"
                onClick={onOpenBugReport}
                className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 hover:text-amber-300"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Report Bug</span>
              </button>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Permanent Account Erasure</span>
            </span>
            <p className="text-[11px] text-rose-300/70 mt-0.5">
              Permanently hard-delete your account profile, customized aliases, and webhooks under GDPR Article 17.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Permanent Account Deletion</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This action cannot be undone. All your profile settings, custom aliases, and calendar subscription feeds will be immediately erased.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">
                Type <strong className="text-rose-400 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-2 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmInput !== "DELETE" || deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
