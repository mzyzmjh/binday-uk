import React, { useState } from "react";
import { Calendar, Copy, Check, Bell, Smartphone, ArrowUpRight, Globe, HelpCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CalendarFeedSettings: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user, updateAlerts } = useAuth();
  const [copiedHttps, setCopiedHttps] = useState(false);
  const [copiedWebcal, setCopiedWebcal] = useState(false);
  const [leadTime, setLeadTime] = useState(
    user?.alertPreferences?.enabled === false || user?.alertPreferences?.leadTimeHours === 0
      ? 0
      : (user?.alertPreferences?.leadTimeHours ?? 17)
  );

  const calToken = user?.tokens?.calendarToken || user?.uid || "demo-token";
  const origin = window.location.origin;
  const httpsUrl = `${origin}/api/ical/${calToken}.ics`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");

  // Google Calendar 1-Click Subscribe URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;

  const handleCopy = (text: string, type: "https" | "webcal") => {
    navigator.clipboard.writeText(text);
    if (type === "https") {
      setCopiedHttps(true);
      setTimeout(() => setCopiedHttps(false), 2500);
    } else {
      setCopiedWebcal(true);
      setTimeout(() => setCopiedWebcal(false), 2500);
    }
    if (onShowToast) {
      onShowToast("Copied to Clipboard", "Calendar subscription URL copied.");
    }
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

      {/* Manual Subscription URLs */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
        <label className="block text-xs font-semibold text-slate-300">
          Or Copy Your Unique Calendar URL Manually
        </label>

        {/* HTTPS URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Standard HTTPS URL (Google Calendar / Outlook / Thunderbird)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={httpsUrl}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-blue-400 font-mono text-xs select-all focus:outline-none"
            />
            <button
              onClick={() => handleCopy(httpsUrl, "https")}
              className="btn-primary text-xs py-2 px-3.5 shrink-0 flex items-center gap-1.5"
            >
              {copiedHttps ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHttps ? "Copied!" : "Copy HTTPS"}</span>
            </button>
          </div>
        </div>

        {/* Webcal URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              WebCal URL (Apple Calendar / iOS / macOS)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webcalUrl}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs select-all focus:outline-none"
            />
            <button
              onClick={() => handleCopy(webcalUrl, "webcal")}
              className="btn-secondary text-xs py-2 px-3.5 shrink-0 flex items-center gap-1.5"
            >
              {copiedWebcal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebcal ? "Copied!" : "Copy WebCal"}</span>
            </button>
          </div>
        </div>

        {/* Setup Help Guide */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            How to manually subscribe in Google Calendar:
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
            <li>Open <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Calendar on desktop</a>.</li>
            <li>On the left sidebar, click the <strong>+</strong> next to <em>Other calendars</em> $\rightarrow$ <strong>From URL</strong>.</li>
            <li>Paste your <strong>HTTPS URL</strong> above and click <strong>Add calendar</strong>.</li>
          </ol>
        </div>
      </div>

      {/* Default Alert Timing (VALARM) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Automatic Calendar Notification (VALARM)</span>
        </div>
        <p className="text-xs text-slate-300">
          When subscribed, your calendar will automatically send you a notification reminding you to put your bins out.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { label: "Night Before (19:00)", hours: 17, trigger: "-PT17H" },
            { label: "Night Before (21:00)", hours: 15, trigger: "-PT15H" },
            { label: "Morning Of (07:00)", hours: 5, trigger: "-PT5H" },
            { label: "No Reminder (Silent)", hours: 0, trigger: "none" }
          ].map((item) => (
            <button
              key={item.hours}
              onClick={() => handleLeadTimeChange(item.hours, item.trigger)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                leadTime === item.hours
                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
