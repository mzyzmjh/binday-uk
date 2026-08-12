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
      <div className="glass-card p-8 text-center text-stone-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-400" />
        <p className="text-sm font-bold text-stone-800">No upcoming collections scheduled</p>
        <p className="text-xs text-stone-500 mt-1">We are syncing your schedule with {councilName}.</p>
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
  let actionLabel = daysUntil <= 7 ? "Due this week" : `In ${daysUntil} days`;
  
  if (daysUntil === 0) {
    countdownText = "Today!";
    actionLabel = "Collection today";
  } else if (daysUntil === 1) {
    countdownText = "Tomorrow";
    actionLabel = "Put out tonight";
  }

  const primaryColor = nextBins[0]?.color || "#16a34a";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/40 p-6 sm:p-8 shadow-md shadow-emerald-950/5 backdrop-blur-xl animate-fade-in">
      {/* Background glow accent */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Next Collection Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                daysUntil <= 1 ? "animate-pulse-subtle" : ""
              }`}
              style={{ backgroundColor: primaryColor }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Next Collection: {countdownText}</span>
            </span>

            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              • {councilName}
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {formattedDay}
            </h2>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              {formattedFullDate}
            </p>
          </div>

          {/* Bins on this day */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {nextBins.map((bin, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 border border-stone-200 shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-sm"
                  style={{ backgroundColor: bin.color || "#16a34a" }}
                />
                <span className="text-sm font-bold text-stone-800">
                  {bin.display_name || bin.type}
                </span>
                {bin.raw_type && bin.raw_type !== bin.display_name && (
                  <span className="text-[10px] text-stone-400 font-mono">
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
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border bg-white/95 min-w-[115px] shadow-sm text-center transition-all ${
                daysUntil === 1 
                  ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50/70" 
                  : "border-stone-200"
              }`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: bin.color || "#16a34a" }}
              >
                <Trash2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-stone-800 max-w-[105px] truncate">
                {bin.display_name || bin.type}
              </span>
              <span className={`text-[10px] font-semibold mt-0.5 ${
                daysUntil === 1 ? "text-amber-800 font-bold" : "text-stone-500"
              }`}>
                {actionLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
