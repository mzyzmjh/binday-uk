import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

export const NotificationSettings: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop push notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted" && onShowToast) {
      onShowToast("Push Alerts Enabled", "You will receive browser notifications before bin day.");
    }
  };

  return (
    <div className="glass-card p-6 border-slate-800 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span>Browser Web Push Alerts</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Receive direct browser notifications the evening before bin collection without relying on calendar apps.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            permission === "granted" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
          }`}>
            {permission === "granted" ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Push Status: {permission === "granted" ? "Active" : permission === "denied" ? "Blocked in Browser" : "Not Enabled"}
            </span>
            <span className="text-[11px] text-slate-400">
              {permission === "granted"
                ? "Browser push notifications are active."
                : "Grant notification permissions to receive timely reminders."}
            </span>
          </div>
        </div>

        {permission !== "granted" && (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="btn-primary text-xs py-2 px-4 shrink-0"
          >
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
};
