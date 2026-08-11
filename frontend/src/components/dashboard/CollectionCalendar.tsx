import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { CollectionItem } from "../../types";

interface CollectionCalendarProps {
  schedule: CollectionItem[];
}

export const CollectionCalendar: React.FC<CollectionCalendarProps> = ({ schedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ dateStr: string; items: CollectionItem[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // UK Monday first (0 = Monday ... 6 = Sunday)
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  // Map collections by date string YYYY-MM-DD
  const collectionsByDate: Record<string, CollectionItem[]> = {};
  for (const item of schedule) {
    if (!collectionsByDate[item.date]) {
      collectionsByDate[item.date] = [];
    }
    collectionsByDate[item.date].push(item);
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: startingDay }, (_, i) => i);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-card p-6 border-slate-800">
      {/* Header Month Nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-[11px] font-bold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {emptySlots.map((slot) => (
          <div key={`empty-${slot}`} className="h-14 sm:h-16 rounded-xl bg-slate-950/20" />
        ))}

        {daysArray.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const bins = collectionsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = selectedDayEvents?.dateStr === dateStr;

          return (
            <button
              key={day}
              type="button"
              onClick={() => bins.length > 0 && setSelectedDayEvents({ dateStr, items: bins })}
              className={`h-14 sm:h-16 rounded-xl p-1.5 text-left border flex flex-col justify-between transition-all relative ${
                isSelected
                  ? "bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40"
                  : isToday
                  ? "bg-slate-800/90 border-emerald-500/50 text-white"
                  : bins.length > 0
                  ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 cursor-pointer"
                  : "bg-slate-900/40 border-slate-800/50 text-slate-400"
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-emerald-400 font-bold" : ""}`}>
                {day}
              </span>

              {/* Bin indicators */}
              {bins.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {bins.map((b, idx) => (
                    <div
                      key={idx}
                      className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-xs"
                      style={{ backgroundColor: b.color || "#22c55e" }}
                      title={b.display_name || b.type}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDayEvents && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-700/80 animate-slide-up flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Collections on {new Date(selectedDayEvents.dateStr + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDayEvents.items.map((b, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.color || "#22c55e" }}
                  />
                  <span>{b.display_name || b.type}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedDayEvents(null)}
            className="text-xs text-slate-400 hover:text-white underline shrink-0 mt-1"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
