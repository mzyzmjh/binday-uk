import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { CouncilConfig } from "../../types";

interface DegradedCouncilBannerProps {
  councilConfig: CouncilConfig;
}

export const DegradedCouncilBanner: React.FC<DegradedCouncilBannerProps> = ({ councilConfig }) => {
  if (councilConfig.status !== "degraded") return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-md mb-6 animate-fade-in flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="flex-1 text-xs">
        <h4 className="font-bold text-amber-200 text-sm">
          Notice: {councilConfig.councilName} Portal Experiencing Delays
        </h4>
        <p className="text-slate-300 mt-1 leading-relaxed">
          Our watchdog detected temporary disruptions or rate limits on the council's online portal. We are serving your last verified collection schedule while background refresh attempts continue automatically.
        </p>
      </div>
    </div>
  );
};
