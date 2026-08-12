import React, { useState } from "react";
import { Palette, Trash2, Check, Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSchedule } from "../../context/ScheduleContext";
import { ColorPicker } from "../common/ColorPicker";
import { BinAlias } from "../../types";

export const BinCustomizer: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user, updateAliases } = useAuth();
  const { schedule } = useSchedule();

  const currentAliases = user?.customisations?.binAliases || {};

  // Extract unique bin raw types
  const detectedTypes = Array.from(
    new Set([
      "Refuse",
      "Recycling",
      "Garden Waste",
      "Food Waste",
      ...schedule.map((s) => s.type)
    ])
  );

  const [aliasesState, setAliasesState] = useState<Record<string, BinAlias>>({ ...currentAliases });
  const [saving, setSaving] = useState(false);

  const handleAliasChange = (rawType: string, alias: string) => {
    setAliasesState((prev) => ({
      ...prev,
      [rawType]: {
        alias,
        color: prev[rawType]?.color || "#1f2937",
        icon: prev[rawType]?.icon || "trash-2"
      }
    }));
  };

  const handleColorChange = (rawType: string, color: string) => {
    setAliasesState((prev) => ({
      ...prev,
      [rawType]: {
        alias: prev[rawType]?.alias || rawType,
        color,
        icon: prev[rawType]?.icon || "trash-2"
      }
    }));
  };

  const handleResetDefaults = () => {
    const defaultMap: Record<string, BinAlias> = {
      "Refuse": { alias: "General Waste (Black Bin)", color: "#1f2937", icon: "trash-2" },
      "Recycling": { alias: "Dry Recycling (Blue Bin)", color: "#2563eb", icon: "recycle" },
      "Garden Waste": { alias: "Garden Waste (Brown Bin)", color: "#15803d", icon: "trees" },
      "Food Waste": { alias: "Food Caddy", color: "#d97706", icon: "utensils" }
    };
    setAliasesState(defaultMap);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAliases(aliasesState);
      if (onShowToast) {
        onShowToast("Bin Preferences Saved", "Your custom bin names and colors are updated across all feeds.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-emerald-700" />
            <span>Customize Physical Bins</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 font-medium">
            Map generic council names to the actual physical colored bins outside your home.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detectedTypes.map((rawType) => {
          const config = aliasesState[rawType] || {
            alias: rawType,
            color: "#1f2937",
            icon: "trash-2"
          };

          return (
            <div
              key={rawType}
              className="glass-card p-5 border-stone-200 space-y-4 hover:border-emerald-300 transition-all shadow-sm"
            >
              {/* Header with live preview badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ring-1 ring-black/10 shrink-0"
                    style={{ backgroundColor: config.color }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Council Name: {rawType}
                    </span>
                    <span className="text-sm font-black text-stone-900">
                      {config.alias || rawType}
                    </span>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 shadow-sm"
                  style={{ backgroundColor: config.color }}
                >
                  Preview
                </div>
              </div>

              {/* Alias Name input */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Your Custom Name
                </label>
                <input
                  type="text"
                  value={config.alias}
                  onChange={(e) => handleAliasChange(rawType, e.target.value)}
                  placeholder={`e.g. ${rawType} (Black Bin)`}
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-bold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  Physical Bin Color
                </label>
                <ColorPicker
                  selectedColor={config.color}
                  onChange={(color) => handleColorChange(rawType, color)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
