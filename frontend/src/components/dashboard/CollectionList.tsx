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
    <div className="glass-card p-6 border-stone-200/90 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>Upcoming Collections</span>
          </h3>
          <span className="text-xs text-stone-500 font-semibold">
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
            let badgeClass = "bg-stone-100 text-stone-700 border-stone-200";
            if (daysUntil === 0) {
              badgeText = "Today";
              badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
            } else if (daysUntil === 1) {
              badgeText = "Tomorrow";
              badgeClass = "bg-amber-100 text-amber-900 border-amber-300 font-bold";
            }

            const isFirstOverall = currentPage === 1 && idx === 0;

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isFirstOverall
                    ? "bg-emerald-50/80 border-emerald-300 shadow-sm"
                    : "bg-stone-50/80 border-stone-200 hover:bg-stone-100/80"
                }`}
              >
                {/* Date Column */}
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">{dayName}</span>
                    <span className="text-sm font-black text-stone-900 leading-none">{fullDate}</span>
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-bold text-stone-800 shadow-sm"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-300 shadow-sm"
                        style={{ backgroundColor: bin.color || "#16a34a" }}
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
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-200 text-xs text-stone-500">
          <div>
            Showing <span className="font-bold text-stone-800">{startIndex + 1}</span>–
            <span className="font-bold text-stone-800">{Math.min(startIndex + itemsPerPage, sortedDates.length)}</span> of{" "}
            <span className="font-bold text-stone-800">{sortedDates.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-stone-700 font-bold px-1">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
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
