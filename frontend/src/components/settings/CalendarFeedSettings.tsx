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
    <div className="glass-card p-6 border-stone-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <span>Live Calendar Subscription (iCal / WebCal)</span>
        </h3>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
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
          className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 hover:border-blue-400 text-stone-900 font-bold text-xs shadow-sm transition-all group hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-300 flex items-center justify-center text-blue-700">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-3V1.5H15V3H9V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-stone-900 group-hover:text-blue-800 transition-colors">
                Add to Google Calendar
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                1-Click live auto-updating subscription
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-blue-700 transition-colors" />
        </a>

        {/* Apple Calendar 1-Click */}
        <a
          href={webcalUrl}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200 hover:border-emerald-400 text-stone-900 font-bold text-xs shadow-sm transition-all group hover:scale-[1.01]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
                Subscribe on iPhone / Mac
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                Opens native Apple Calendar
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
        </a>
      </div>

      {/* Manual Subscription URLs */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-sm">
        <label className="block text-xs font-bold text-stone-800">
          Or Copy Your Unique Calendar URL Manually
        </label>

        {/* HTTPS URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              Standard HTTPS URL (Google Calendar / Outlook / Thunderbird)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={httpsUrl}
              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-blue-800 font-mono text-xs select-all focus:outline-none shadow-sm font-semibold"
            />
            <button
              onClick={() => handleCopy(httpsUrl, "https")}
              className="btn-primary text-xs py-2 px-3.5 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHttps ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHttps ? "Copied!" : "Copy HTTPS"}</span>
            </button>
          </div>
        </div>

        {/* Webcal URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              WebCal URL (Apple Calendar / iOS / macOS)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webcalUrl}
              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-emerald-800 font-mono text-xs select-all focus:outline-none shadow-sm font-semibold"
            />
            <button
              onClick={() => handleCopy(webcalUrl, "webcal")}
              className="btn-secondary text-xs py-2 px-3.5 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedWebcal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebcal ? "Copied!" : "Copy WebCal"}</span>
            </button>
          </div>
        </div>

        {/* Setup Help Guide */}
        <div className="p-3 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-600 space-y-1.5 shadow-sm">
          <div className="font-bold text-stone-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            How to manually subscribe in Google Calendar:
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-stone-600 font-medium">
            <li>Open <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-700 font-semibold underline">Google Calendar on desktop</a>.</li>
            <li>On the left sidebar, click the <strong>+</strong> next to <em>Other calendars</em> $\rightarrow$ <strong>From URL</strong>.</li>
            <li>Paste your <strong>HTTPS URL</strong> above and click <strong>Add calendar</strong>.</li>
          </ol>
        </div>
      </div>

      {/* Default Alert Timing (VALARM) */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
          <Bell className="w-4 h-4 text-emerald-700" />
          <span>Automatic Calendar Notification (VALARM)</span>
        </div>
        <p className="text-xs text-stone-600 font-medium">
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
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                leadTime === item.hours
                  ? "bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-900 shadow-sm"
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
