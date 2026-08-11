import React from "react";
import { Home, ChevronRight, Check } from "lucide-react";
import { Address } from "../../types";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onReset: () => void;
  postcode: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onReset,
  postcode
}) => {
  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Select your property</h2>
          <p className="text-xs text-slate-400">
            Found {addresses.length} addresses for <span className="font-mono text-emerald-400 font-semibold">{postcode}</span> (sorted numerically)
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white underline font-medium"
        >
          Change postcode
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {addresses.map((addr) => {
          const isSelected = selectedAddress?.uprn === addr.uprn;
          return (
            <button
              key={addr.uprn}
              onClick={() => onSelectAddress(addr)}
              type="button"
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                  : "bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {addr.buildingNumber || <Home className="w-4 h-4" />}
                </div>

                <div className="truncate">
                  <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                    {addr.singleLineAddress}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    UPRN: <span className="font-mono">{addr.uprn}</span> • {addr.councilName}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
