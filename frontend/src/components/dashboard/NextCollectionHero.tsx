import React from "react";
import { Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { CollectionItem } from "../../types";

interface NextCollectionHeroProps {
  schedule: CollectionItem[];
  councilName: string;
}

export const NextCollectionHero: React.FC<NextCollectionHeroProps> = ({ schedule, councilName }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p className="text-sm font-semibold text-slate-300">No upcoming collections scheduled</p>
        <p className="text-xs text-slate-500 mt-1">We are syncing your schedule with {councilName}.</p>
      </div>
    );
  }

  // Find all bins on the nearest upcoming date
  const firstDate = schedule[0].date;
  const nextBins = schedule.filter((c) => c.date === firstDate);

  const parsedDate = new Date(firstDate + "T00:00:00Z");
  const formattedDay = parsedDate.toLocaleDateString("en-GB", { weekday: "long" });
  const formattedFullDate = parsedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const daysUntil = schedule[0].days_until ?? 0;
  let countdownText = `In ${daysUntil} days`;
  if (daysUntil === 0) countdownText = "Today!";
  else if (daysUntil === 1) countdownText = "Tomorrow";

  const primaryColor = nextBins[0]?.color || "#22c55e";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
      {/* Background glow accent */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Next Collection Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md animate-pulse-subtle"
              style={{ backgroundColor: primaryColor }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Next Collection: {countdownText}</span>
            </span>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              • {councilName}
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formattedDay}
            </h2>
            <p className="text-base text-slate-300 font-medium mt-0.5">
              {formattedFullDate}
            </p>
          </div>

          {/* Bins on this day */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {nextBins.map((bin, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/40 shrink-0 shadow-sm"
                  style={{ backgroundColor: bin.color || "#22c55e" }}
                />
                <span className="text-sm font-bold text-white">
                  {bin.display_name || bin.type}
                </span>
                {bin.raw_type && bin.raw_type !== bin.display_name && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({bin.raw_type})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual Bin Icon Card */}
        <div className="flex items-center gap-3 shrink-0">
          {nextBins.map((bin, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-700/60 bg-slate-950/50 backdrop-blur-md min-w-[110px] shadow-lg text-center"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-inner ring-1 ring-white/10"
                style={{ backgroundColor: bin.color || "#22c55e" }}
              >
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-white max-w-[100px] truncate">
                {bin.display_name || bin.type}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Put out tonight
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
