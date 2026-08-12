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
    <div className="glass-card p-6 border-stone-200/90 shadow-sm">
      {/* Header Month Nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-black text-stone-900">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-[11px] font-bold text-stone-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {emptySlots.map((slot) => (
          <div key={`empty-${slot}`} className="h-14 sm:h-16 rounded-xl bg-stone-100/40" />
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
                  ? "bg-emerald-100/80 border-emerald-500 ring-2 ring-emerald-500/30"
                  : isToday
                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                  : bins.length > 0
                  ? "bg-stone-50 hover:bg-emerald-50/50 border-stone-200 cursor-pointer shadow-sm"
                  : "bg-white/80 border-stone-200/60 text-stone-400"
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-emerald-800 font-black" : "text-stone-700"}`}>
                {day}
              </span>

              {/* Bin indicators */}
              {bins.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {bins.map((b, idx) => (
                    <div
                      key={idx}
                      className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: b.color || "#16a34a" }}
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
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 animate-slide-up flex items-start justify-between gap-3 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Collections on {new Date(selectedDayEvents.dateStr + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDayEvents.items.map((b, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-bold text-stone-800 shadow-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.color || "#16a34a" }}
                  />
                  <span>{b.display_name || b.type}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedDayEvents(null)}
            className="text-xs text-stone-500 hover:text-stone-800 underline shrink-0 mt-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
