import React from "react";

export const PRESET_BIN_COLORS = [
  { name: "Black / Dark Grey", hex: "#1f2937", label: "General Refuse" },
  { name: "Blue", hex: "#2563eb", label: "Paper / Recycling" },
  { name: "Green", hex: "#16a34a", label: "Garden / Mixed Recycling" },
  { name: "Brown", hex: "#78350f", label: "Garden / Food" },
  { name: "Amber / Orange", hex: "#d97706", label: "Food Caddy" },
  { name: "Red", hex: "#dc2626", label: "Plastics / Cans" },
  { name: "Purple", hex: "#7e22ce", label: "Glass" },
  { name: "Teal", hex: "#0d9488", label: "Special Collection" }
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESET_BIN_COLORS.map((c) => {
        const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => onChange(c.hex)}
            title={`${c.name} (${c.label})`}
            className={`w-7 h-7 rounded-full border-2 transition-all transform active:scale-90 ${
              isSelected
                ? "border-white scale-110 shadow-lg shadow-black/40 ring-2 ring-emerald-500/50"
                : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
      {/* Custom color input fallback */}
      <label className="relative w-7 h-7 rounded-full border-2 border-slate-600 overflow-hidden cursor-pointer hover:border-slate-400">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
        />
        <div
          className="w-full h-full"
          style={{ backgroundColor: selectedColor }}
        />
      </label>
    </div>
  );
};
