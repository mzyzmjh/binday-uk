import React, { useState } from "react";
import { Trash2, Download, RotateCcw, ShieldAlert, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const DangerZone: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { downloadData, resetTokens, deleteAccount } = useAuth();
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
    <div className="glass-card p-6 border-rose-500/30 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>GDPR Privacy & Account Management</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Manage your personal data portability, rotate compromised feed URLs, or exercise your right to permanent account erasure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GDPR Data Portability Export */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download My Data (JSON)</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Under GDPR Article 20, download a full machine-readable JSON archive of your profile, address records, customisations, and collection history.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data Archive</span>
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
              Immediately revoke and rotate your calendar subscription URL and Home Assistant API token if accidentally shared or exposed.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetTokens}
            disabled={resetting}
            className="btn-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5 mt-2 hover:text-amber-400"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Rotating..." : "Reset All Tokens"}</span>
          </button>
        </div>
      </div>

      {/* Account Erasure (Danger Zone) */}
      <div className="pt-4 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 block">Delete Account & All Data</span>
          <span className="text-[11px] text-slate-400">
            Permanently delete your profile, webhook endpoints, and linked schedule records. This action cannot be undone.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 border-rose-500/40 relative animate-slide-up space-y-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Permanently Delete Account?</h4>
                <p className="text-xs text-slate-400">GDPR Right to Erasure</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will immediately hard-delete your user record, calendar subscription feed, and all custom preferences from our database.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type <span className="font-mono text-rose-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmInput !== "DELETE" || deleting}
                className="btn-danger text-xs py-2 px-5 disabled:opacity-50"
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
