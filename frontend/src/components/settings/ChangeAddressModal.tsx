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
        setError("No addresses found for this postcode. Please check and retry.");
      }
    } catch (err: any) {
      setError("Failed to search postcode.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAddress = async (addr: Address) => {
    setSelectedAddress(addr);
    const config = await getCouncilConfig(addr.custodianCode);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Change Your Address</h2>
              <p className="text-xs text-slate-400 font-medium">Update your property location & council bin feed</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-5 space-y-5 text-xs pr-1">
          {/* Current Address Card */}
          {user?.address && (
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Address:</span>
              <p className="text-white font-semibold text-xs">{user.address.singleLineAddress}</p>
              <p className="text-[11px] text-slate-400 font-mono">Council: {user.address.councilName} (UPRN: {user.address.uprn})</p>
            </div>
          )}

          {/* Search Postcode Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block font-bold text-slate-300">
              Enter your new UK Postcode:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postcodeInput}
                  onChange={(e) => {
                    setError(null);
                    setPostcodeInput(formatPostcode(e.target.value));
                  }}
                  placeholder="e.g. LS26 8XX"
                  disabled={searching || saving}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs font-semibold uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !postcodeInput.trim()}
                className="btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-1.5"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find</span>
              </button>
            </div>
          </form>

          {error && <p className="text-rose-400 text-xs font-semibold">{error}</p>}

          {/* Address Results List */}
          {addressList.length > 0 && (
            <div className="space-y-2">
              <label className="block font-bold text-slate-300">
                Select your property ({addressList.length} found):
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 border border-slate-800 rounded-2xl bg-slate-950/50">
                {addressList.map((addr) => {
                  const isSelected = selectedAddress?.uprn === addr.uprn;
                  return (
                    <button
                      key={addr.uprn}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{addr.singleLineAddress}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Address Confirmation Banner */}
          {selectedAddress && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Selected New Property</span>
              </div>
              <p className="text-white font-bold">{selectedAddress.singleLineAddress}</p>
              <p className="text-slate-400 text-[11px]">
                Council: {councilConfig?.councilName || selectedAddress.councilName} • UPRN: {selectedAddress.uprn}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmChange}
            disabled={!selectedAddress || saving}
            className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
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
