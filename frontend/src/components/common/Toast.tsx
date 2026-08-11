import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-slide-up ${
            t.type === "success"
              ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
              : t.type === "error"
              ? "bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10"
              : "bg-slate-900/95 border-sky-500/40 text-sky-300 shadow-sky-500/10"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {t.type === "info" && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">{t.title}</h4>
            {t.message && <p className="text-xs text-slate-300 mt-0.5">{t.message}</p>}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
