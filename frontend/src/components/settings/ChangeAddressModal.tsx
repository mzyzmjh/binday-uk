import React, { useState } from "react";
import { X, MapPin, Search, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Home } from "lucide-react";
import { Address, CouncilConfig } from "../../types";
import { lookupAddresses, getCouncilConfig } from "../../firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { useSchedule } from "../../context/ScheduleContext";

interface ChangeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (title: string, message: string) => void;
}

export const ChangeAddressModal: React.FC<ChangeAddressModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { user, changeAddress } = useAuth();
  const { refreshSchedule } = useSchedule();

  const [postcodeInput, setPostcodeInput] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [councilConfig, setCouncilConfig] = useState<CouncilConfig | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatPostcode = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length > 7) clean = clean.slice(0, 7);
    if (clean.length > 3) {
      return `${clean.slice(0, -3)} ${clean.slice(-3)}`;
    }
    return clean;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = postcodeInput.trim().toUpperCase();
    if (!clean) {
      setError("Please enter a postcode.");
      return;
    }

    setSearching(true);
    setError(null);
    setSelectedAddress(null);
    setCouncilConfig(null);

    try {
      const results = await lookupAddresses(clean);
      setAddressList(results);
      if (results.length === 0) {
        setError(`No addresses found for postcode "${clean}". Please check and retry.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search postcode.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAddress = async (addr: Address) => {
    setSelectedAddress(addr);
    const config = await getCouncilConfig(addr.custodianCode, addr.councilName);
    setCouncilConfig(config);
  };

  const handleConfirmChange = async () => {
    if (!selectedAddress) return;
    setSaving(true);
    setError(null);

    try {
      await changeAddress(selectedAddress);
      await refreshSchedule();
      if (onShowToast) {
        onShowToast("Address Updated", `Your home address is now set to ${selectedAddress.singleLineAddress}`);
      }
      onClose();
    } catch (err: any) {
      console.error("Error updating address:", err);
      setError("Failed to update address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">Change Your Address</h2>
              <p className="text-xs text-stone-500 font-medium">Update your property location & council bin feed</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-5 space-y-5 text-xs pr-1">
          {/* Current Address Card */}
          {user?.address && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Current Address:</span>
              <p className="text-stone-900 font-bold text-xs">{user.address.singleLineAddress}</p>
              <p className="text-[11px] text-stone-500 font-medium">
                Council: <span className="font-semibold text-stone-700">{user.address.councilName}</span> (UPRN: {user.address.uprn})
              </p>
            </div>
          )}

          {/* Search Postcode Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block font-bold text-stone-800">
              Enter your new UK Postcode:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postcodeInput}
                  onChange={(e) => {
                    setError(null);
                    setPostcodeInput(formatPostcode(e.target.value));
                  }}
                  placeholder="e.g. W1T 4JZ"
                  disabled={searching || saving}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-bold uppercase placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !postcodeInput.trim()}
                className="btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find</span>
              </button>
            </div>
          </form>

          {error && <p className="text-rose-600 text-xs font-semibold">{error}</p>}

          {/* Address Results List */}
          {addressList.length > 0 && (
            <div className="space-y-2">
              <label className="block font-bold text-stone-800">
                Select your property ({addressList.length} found):
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 border border-stone-200 rounded-2xl bg-stone-50 shadow-inner">
                {addressList.map((addr) => {
                  const isSelected = selectedAddress?.uprn === addr.uprn;
                  return (
                    <button
                      key={addr.uprn}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold shadow-sm"
                          : "text-stone-700 hover:bg-white hover:text-stone-900 border border-transparent"
                      }`}
                    >
                      <span className="truncate">{addr.singleLineAddress}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Address Confirmation Banner */}
          {selectedAddress && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Selected New Property</span>
              </div>
              <p className="text-stone-900 font-black">{selectedAddress.singleLineAddress}</p>
              <p className="text-stone-600 text-[11px] font-medium">
                Council: <span className="font-bold text-stone-800">{selectedAddress.councilName || councilConfig?.councilName}</span> • UPRN: {selectedAddress.uprn}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmChange}
            disabled={!selectedAddress || saving}
            className="btn-primary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Address...</span>
              </>
            ) : (
              <>
                <span>Save New Address</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
