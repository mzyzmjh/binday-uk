import React, { useState } from "react";
import { Calendar, Copy, Check, Bell, BellOff, Smartphone, Monitor, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CalendarFeedSettings: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user, updateAlerts } = useAuth();
  const [copied, setCopied] = useState(false);
  const [leadTime, setLeadTime] = useState(
    user?.alertPreferences?.enabled === false || user?.alertPreferences?.leadTimeHours === 0
      ? 0
      : (user?.alertPreferences?.leadTimeHours ?? 17)
  );

  const calToken = user?.tokens?.calendarToken || "demo-token";
  const origin = window.location.origin;
  const httpsUrl = `${origin}/api/ical/${calToken}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");

  // Google Calendar 1-Click Subscribe URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(httpsUrl)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onShowToast) {
      onShowToast("Copied to Clipboard", "Calendar subscription URL copied.");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeadTimeChange = async (hours: number, triggerStr: string) => {
    setLeadTime(hours);
    const isEnabled = hours > 0 && triggerStr !== "none";
    await updateAlerts({
      enabled: isEnabled,
      leadTimeHours: hours,
      valarmTrigger: triggerStr
    });
    if (onShowToast) {
      if (isEnabled) {
        onShowToast("Alarm Preferences Updated", `Calendar alerts will fire ${hours} hours prior.`);
      } else {
        onShowToast("Alarms Disabled", "Calendar feed will include no alerts (silent).");
      }
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

      {/* 1-Click Instant Calendar Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Google Calendar 1-Click */}
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60 hover:border-blue-500/80 text-white font-semibold text-xs shadow-lg transition-all group hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-3V1.5H15V3H9V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                Add to Google Calendar
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                1-Click live auto-updating subscription
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </a>

        {/* Apple Calendar 1-Click */}
        <a
          href={webcalUrl}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-950/80 border border-slate-700/60 hover:border-emerald-500/80 text-white font-semibold text-xs shadow-lg transition-all group hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                Subscribe on iPhone / Mac
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Opens native Apple Calendar
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </a>
      </div>

      {/* Subscription URL Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Or Copy Your Unique Calendar URL Manually
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
          Choose when your calendar app should alert you before bin day:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { hours: 17, trigger: "-PT17H", label: "19:00 Night Before (Recommended)" },
            { hours: 12, trigger: "-PT12H", label: "00:00 Midnight" },
            { hours: 1, trigger: "-PT1H", label: "07:00 Morning of Collection" },
            { hours: 0, trigger: "none", label: "No Reminder (Silent)" }
          ].map((opt) => (
            <button
              key={opt.hours}
              type="button"
              onClick={() => handleLeadTimeChange(opt.hours, opt.trigger)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                leadTime === opt.hours
                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt.label}</span>
                {leadTime === opt.hours && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>
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
            <li>Click <b>Subscribe on iPhone / Mac</b> above, or copy the <span className="font-mono text-emerald-400">webcal://</span> link.</li>
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
            <li>Click <b>Add to Google Calendar</b> above for instant 1-click import!</li>
            <li>Or in Outlook/Google Calendar: Click <b>+ Other calendars</b> → <b>From URL</b> and paste the link.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
