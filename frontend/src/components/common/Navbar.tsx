import React from "react";
import { Trash2, MapPin, Settings, Calendar, Palette, Link2, LogOut, User, Bug, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  activeTab: "dashboard" | "customizer" | "integrations" | "settings";
  setActiveTab: (tab: "dashboard" | "customizer" | "integrations" | "settings") => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  onOpenBugReport: () => void;
  onOpenChangeAddress: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAbout,
  onOpenBugReport,
  onOpenChangeAddress
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-700 flex items-center justify-center shadow-md shadow-emerald-900/10 ring-1 ring-emerald-600/20 group-hover:scale-105 transition-transform">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-emerald-950 group-hover:text-emerald-700 transition-colors">BinDay</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">UK</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">Smart Council Collection Tracker</p>
          </div>
        </div>

        {/* User Navigation Tabs (when logged in) */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 shadow-inner">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-emerald-800 border border-emerald-300/80 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab("customizer")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "customizer"
                  ? "bg-white text-emerald-800 border border-emerald-300/80 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>Bin Colors</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "integrations"
                  ? "bg-white text-emerald-800 border border-emerald-300/80 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sync & Feeds</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-white text-emerald-800 border border-emerald-300/80 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-stone-600" />
              <span>Settings</span>
            </button>
          </nav>
        ) : null}

        {/* Right Actions: Address Chip, Report Bug, About, Auth/Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* About Button */}
          <button
            onClick={onOpenAbout}
            title="About & Open-Source Credits"
            className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
            aria-label="About BinDay"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Bug Report Button */}
          <button
            onClick={onOpenBugReport}
            title="Report a Bug or Incorrect Date"
            className="p-2 rounded-xl text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            aria-label="Report a Bug"
          >
            <Bug className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Clickable Address Chip to Change Address */}
              <button
                onClick={onOpenChangeAddress}
                title="Click to Change Address"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-300/80 text-xs transition-all cursor-pointer group shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-stone-700 group-hover:text-stone-900 font-semibold truncate max-w-[160px]">
                  {user.address.buildingNumber ? `${user.address.buildingNumber} ` : ""}
                  {user.address.thoroughfareName || user.address.postcode}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold ml-0.5">Edit</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
