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
      <div className="glass-card p-6 border-stone-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-700" />
            <span>Property & Address</span>
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
            Moved house or selected the wrong flat? You can change your registered property at any time.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{user?.address?.singleLineAddress || "No address set"}</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Council: <span className="font-semibold text-stone-700">{user?.address?.councilName}</span> • UPRN: <span className="font-mono">{user?.address?.uprn}</span>
            </p>
          </div>

          {onOpenChangeAddress && (
            <button
              type="button"
              onClick={onOpenChangeAddress}
              className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Change Address</span>
            </button>
          )}
        </div>
      </div>

      {/* GDPR Privacy & Token Management */}
      <div className="glass-card p-6 border-stone-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>GDPR Privacy & Account Management</span>
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
            Manage your personal data portability, rotate secret feed tokens, or report issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GDPR Data Portability Export */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-700" />
                <span>Download My Data (JSON)</span>
              </span>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                Under GDPR Article 20, export a full machine-readable JSON archive of your profile and schedule history.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Archive</span>
            </button>
          </div>

          {/* Token Revocation / Reset */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Regenerate Secret Tokens</span>
              </span>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                Immediately revoke and rotate your calendar URL and API tokens if accidentally shared.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetTokens}
              disabled={resetting}
              className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 hover:text-amber-700 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Rotating..." : "Reset Tokens"}</span>
            </button>
          </div>

          {/* Bug Report */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-amber-700" />
                <span>Report an Issue</span>
              </span>
              <p className="text-[11px] text-stone-500 mt-1 font-medium">
                Found incorrect collection dates or a bug? Submit a report with automatic diagnostics.
              </p>
            </div>

            {onOpenBugReport && (
              <button
                type="button"
                onClick={onOpenBugReport}
                className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 hover:text-amber-800 cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-amber-700" />
                <span>Report Bug</span>
              </button>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Permanent Account Erasure</span>
            </span>
            <p className="text-[11px] text-rose-700/80 mt-0.5 font-medium">
              Permanently hard-delete your account profile, customized aliases, and webhooks under GDPR Article 17.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-rose-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Permanent Account Deletion</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              This action cannot be undone. All your profile settings, custom aliases, and calendar subscription feeds will be immediately erased.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-stone-600 font-semibold">
                Type <strong className="text-rose-600 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-mono focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-2 px-3 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmInput !== "DELETE" || deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
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
