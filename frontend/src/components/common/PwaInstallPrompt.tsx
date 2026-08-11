import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(Boolean(standalone));

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS tip if on mobile Safari and not standalone
    if (isIosDevice && !standalone) {
      const dismissed = localStorage.getItem("binday_pwa_ios_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIos) {
      localStorage.setItem("binday_pwa_ios_dismissed", "true");
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900/60 to-teal-900/40 border-b border-emerald-500/20 backdrop-blur-md px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Install BinDay App</p>
            <p className="text-xs text-slate-300">
              {isIos
                ? "Tap Share and select 'Add to Home Screen' for instant access & push alerts."
                : "Install as a desktop or mobile app for quick offline bin checks."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn-primary py-1.5 px-3.5 text-xs"
            >
              Install
            </button>
          )}

          {isIos && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Share className="w-3.5 h-3.5" />
              <span>Share</span>
              <span>→</span>
              <PlusSquare className="w-3.5 h-3.5" />
              <span>Add to Home Screen</span>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
