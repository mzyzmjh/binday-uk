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
    <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-b border-stone-200 backdrop-blur-md px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-800">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-stone-900">Install BinDay App</p>
            <p className="text-xs text-stone-600 font-medium">
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
              className="btn-primary py-1.5 px-3.5 text-xs cursor-pointer"
            >
              Install
            </button>
          )}

          {isIos && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 font-bold px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
              <Share className="w-3.5 h-3.5" />
              <span>Share</span>
              <span>→</span>
              <PlusSquare className="w-3.5 h-3.5" />
              <span>Add to Home Screen</span>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
