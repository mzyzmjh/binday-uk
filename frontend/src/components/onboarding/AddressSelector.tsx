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
          <h2 className="text-xl font-black text-stone-900">Select your property</h2>
          <p className="text-xs text-stone-600">
            Found {addresses.length} addresses for <span className="font-mono text-emerald-800 font-bold">{postcode}</span> (sorted numerically)
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-600 hover:text-stone-900 underline font-semibold cursor-pointer"
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
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                  : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  {addr.buildingNumber || <Home className="w-4 h-4" />}
                </div>

                <div className="truncate">
                  <p className={`text-sm font-bold truncate ${isSelected ? "text-emerald-950" : "text-stone-800"}`}>
                    {addr.singleLineAddress}
                  </p>
                  <p className="text-[11px] text-stone-500 font-medium">
                    UPRN: <span className="font-mono">{addr.uprn}</span> • <span className="font-semibold text-stone-700">{addr.councilName}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
