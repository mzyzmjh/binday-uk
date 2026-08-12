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
    <header className="sticky top-0 z-40 border-b border-emerald-950/40 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30 group-hover:scale-105 transition-transform">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">BinDay</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">UK</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Smart Council Collection Tracker</p>
          </div>
        </div>

        {/* User Navigation Tabs (when logged in) */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab("customizer")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "customizer"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Bin Colors</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "integrations"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Sync & Feeds</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
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
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
            aria-label="About BinDay"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Bug Report Button */}
          <button
            onClick={onOpenBugReport}
            title="Report a Bug or Incorrect Date"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
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
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 text-xs transition-all cursor-pointer group shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-slate-300 group-hover:text-white font-medium truncate max-w-[160px]">
                  {user.address.buildingNumber ? `${user.address.buildingNumber} ` : ""}
                  {user.address.thoroughfareName || user.address.postcode}
                </span>
                <span className="text-[10px] text-emerald-400/80 font-bold ml-0.5">Edit</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
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
