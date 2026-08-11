import React, { useState } from "react";
import { Calendar, Copy, Check, ExternalLink, Bell, Smartphone, Monitor } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CalendarFeedSettings: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user, updateAlerts } = useAuth();
  const [copied, setCopied] = useState(false);
  const [leadTime, setLeadTime] = useState(user?.alertPreferences?.leadTimeHours ?? 17);

  const calToken = user?.tokens?.calendarToken || "demo-token";
  const origin = window.location.origin;
  const httpsUrl = `${origin}/api/ical/${calToken}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Copied to Clipboard", "Calendar subscription URL copied.");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeadTimeChange = async (hours: number) => {
    setLeadTime(hours);
    const trigger = `-PT${hours}H`;
    await updateAlerts({
      enabled: true,
      leadTimeHours: hours,
      valarmTrigger: trigger
    });
    if (onShowToast) {
      onShowToast("Alarm Preferences Updated", `Calendar alerts will fire ${hours} hours prior.`);
    }
  };

  return (
    <div className="glass-card p-6 border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>Live Calendar Subscription (iCal / WebCal)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Subscribe once and let your phone's calendar stay automatically updated with custom bin names, colors, and alerts.
        </p>
      </div>

      {/* Subscription URL Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Your Unique Calendar Subscription URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webcalUrl}
            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs select-all focus:outline-none"
          />
          <button
            onClick={() => handleCopy(webcalUrl)}
            className="btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Compatible with Apple Calendar (iOS/Mac), Google Calendar, Outlook, and Thunderbird.
        </p>
      </div>

      {/* Default Alert Timing (VALARM) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Automatic Calendar Notification (VALARM)</span>
        </div>
        <p className="text-xs text-slate-300">
          Choose when your native calendar app should send you a push notification before bin day:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { hours: 17, label: "19:00 Night Before (Recommended)" },
            { hours: 12, label: "00:00 Midnight" },
            { hours: 1, label: "07:00 Morning of Collection" }
          ].map((opt) => (
            <button
              key={opt.hours}
              type="button"
              onClick={() => handleLeadTimeChange(opt.hours)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                leadTime === opt.hours
                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Setup Instructions Accordion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Apple Calendar (iPhone & Mac)</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
            <li>Copy the <span className="font-mono text-emerald-400">webcal://</span> link above.</li>
            <li>On iPhone: Open Calendar → Tap <b>Calendars</b> → <b>Add Subscription Calendar</b>.</li>
            <li>Paste link and tap <b>Subscribe</b>.</li>
          </ol>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>Google Calendar & Outlook</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
            <li>In Google Calendar: Click <b>+ Other calendars</b> → <b>From URL</b>.</li>
            <li>Paste the <span className="font-mono text-emerald-400">https://</span> link and click <b>Add Calendar</b>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
