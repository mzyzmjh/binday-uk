import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { CollectionItem } from "../../types";

interface CollectionListProps {
  schedule: CollectionItem[];
  itemsPerPage?: number;
}

export const CollectionList: React.FC<CollectionListProps> = ({ schedule, itemsPerPage = 6 }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Group collections by date
  const grouped: Record<string, CollectionItem[]> = {};
  for (const item of schedule) {
    if (!grouped[item.date]) {
      grouped[item.date] = [];
    }
    grouped[item.date].push(item);
  }

  const sortedDates = Object.keys(grouped).sort();
  const totalPages = Math.ceil(sortedDates.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDates = sortedDates.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="glass-card p-6 border-slate-800/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Upcoming Collections</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {sortedDates.length} collection days total
          </span>
        </div>

        <div className="space-y-2.5">
          {currentDates.map((dateStr, idx) => {
            const bins = grouped[dateStr];
            const parsed = new Date(dateStr + "T00:00:00Z");
            const dayName = parsed.toLocaleDateString("en-GB", { weekday: "short" });
            const fullDate = parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
            const daysUntil = bins[0]?.days_until ?? 0;

            let badgeText = `In ${daysUntil}d`;
            let badgeClass = "bg-slate-800/80 text-slate-300 border-slate-700/80";
            if (daysUntil === 0) {
              badgeText = "Today";
              badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
            } else if (daysUntil === 1) {
              badgeText = "Tomorrow";
              badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold";
            }

            const isFirstOverall = currentPage === 1 && idx === 0;

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isFirstOverall
                    ? "bg-slate-900/90 border-emerald-800/40 shadow-sm"
                    : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/50"
                }`}
              >
                {/* Date Column */}
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{dayName}</span>
                    <span className="text-sm font-extrabold text-white leading-none">{fullDate}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Bins Column */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {bins.map((bin, bIdx) => (
                    <div
                      key={bIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-white shadow-xs"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: bin.color || "#22c55e" }}
                      />
                      <span className="text-xs">{bin.display_name || bin.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{startIndex + 1}</span>–
            <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, sortedDates.length)}</span> of{" "}
            <span className="font-semibold text-white">{sortedDates.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-slate-300 font-medium px-1">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
