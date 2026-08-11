import React from "react";
import { Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { CollectionItem } from "../../types";

interface CollectionListProps {
  schedule: CollectionItem[];
}

export const CollectionList: React.FC<CollectionListProps> = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Group by date
  const grouped: Record<string, CollectionItem[]> = {};
  for (const item of schedule) {
    if (!grouped[item.date]) {
      grouped[item.date] = [];
    }
    grouped[item.date].push(item);
  }

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="glass-card p-6 border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span>Upcoming Collections</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Next {sortedDates.length} collection days
        </span>
      </div>

      <div className="space-y-3">
        {sortedDates.map((dateStr, idx) => {
          const bins = grouped[dateStr];
          const parsed = new Date(dateStr + "T00:00:00Z");
          const dayName = parsed.toLocaleDateString("en-GB", { weekday: "short" });
          const fullDate = parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
          const daysUntil = bins[0]?.days_until ?? 0;

          let badgeText = `In ${daysUntil}d`;
          let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";
          if (daysUntil === 0) {
            badgeText = "Today";
            badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
          } else if (daysUntil === 1) {
            badgeText = "Tomorrow";
            badgeClass = "bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold";
          }

          return (
            <div
              key={dateStr}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                idx === 0
                  ? "bg-slate-800/80 border-slate-700/80 shadow-md"
                  : "bg-slate-900/60 border-slate-800/70 hover:bg-slate-800/60"
              }`}
            >
              {/* Date Column */}
              <div className="flex items-center gap-3">
                <div className="w-12 text-center shrink-0">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">{dayName}</span>
                  <span className="text-base font-extrabold text-white leading-none">{fullDate}</span>
                </div>

                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
                  {badgeText}
                </span>
              </div>

              {/* Bins Column */}
              <div className="flex flex-wrap gap-2 items-center">
                {bins.map((bin, bIdx) => (
                  <div
                    key={bIdx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-700/60 text-xs font-semibold text-white shadow-xs"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 border border-white/30"
                      style={{ backgroundColor: bin.color || "#22c55e" }}
                    />
                    <span>{bin.display_name || bin.type}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
