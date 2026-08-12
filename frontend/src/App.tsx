import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ScheduleProvider, useSchedule } from "./context/ScheduleContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { PwaInstallPrompt } from "./components/common/PwaInstallPrompt";

// Onboarding & Auth
import { PostcodeLookup } from "./components/onboarding/PostcodeLookup";
import { AddressSelector } from "./components/onboarding/AddressSelector";
import { CouncilStatusCard } from "./components/onboarding/CouncilStatusCard";
import { ProprietaryIdModal } from "./components/onboarding/ProprietaryIdModal";
import { WaitlistForm } from "./components/onboarding/WaitlistForm";
import { AuthModal } from "./components/auth/AuthModal";
import { PrivacyPolicyModal } from "./components/legal/PrivacyPolicyModal";
import { TermsModal } from "./components/legal/TermsModal";
import { AboutModal } from "./components/legal/AboutModal";
import { BugReportModal } from "./components/common/BugReportModal";
import { ChangeAddressModal } from "./components/settings/ChangeAddressModal";

// Dashboard & Settings
import { NextCollectionHero } from "./components/dashboard/NextCollectionHero";
import { CollectionCalendar } from "./components/dashboard/CollectionCalendar";
import { CollectionList } from "./components/dashboard/CollectionList";
import { BinCustomizer } from "./components/dashboard/BinCustomizer";
import { DegradedCouncilBanner } from "./components/dashboard/DegradedCouncilBanner";
import { CalendarFeedSettings } from "./components/settings/CalendarFeedSettings";
import { HomeAssistantGuide } from "./components/settings/HomeAssistantGuide";
import { WebhooksManager } from "./components/settings/WebhooksManager";
import { NotificationSettings } from "./components/settings/NotificationSettings";
import { DangerZone } from "./components/settings/DangerZone";

import { lookupAddresses, getCouncilConfig } from "./firebase/firestoreService";
import { Address, CouncilConfig } from "./types";
import { Calendar, Shield, Sparkles, Smartphone, Cpu, CheckCircle2, Heart, Bug, Info } from "lucide-react";

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { schedule, councilConfig } = useSchedule();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "customizer" | "integrations" | "settings">("dashboard");

  // Onboarding states (when not logged in)
  const [searchedPostcode, setSearchedPostcode] = useState<string>("");
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedCouncilConfig, setSelectedCouncilConfig] = useState<CouncilConfig | null>(null);
  const [proprietaryId, setProprietaryId] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showBugModal, setShowBugModal] = useState<boolean>(false);
  const [showChangeAddressModal, setShowChangeAddressModal] = useState<boolean>(false);
  const [showProprietaryModal, setShowProprietaryModal] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handlePostcodeSearch = async (pc: string) => {
    setSearching(true);
    try {
      const results = await lookupAddresses(pc);
      setSearchedPostcode(pc);
      setAddressList(results);
      setSelectedAddress(null);
      setSelectedCouncilConfig(null);
      setProprietaryId("");

      if (results.length > 0) {
        addToast("Addresses Found", `Loaded ${results.length} properties for ${pc}.`, "info");
      }
    } catch (e) {
      addToast("Search Error", "Could not fetch addresses for this postcode.", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAddress = async (addr: Address) => {
    setSelectedAddress(addr);
    const config = await getCouncilConfig(addr.custodianCode, addr.councilName);
    setSelectedCouncilConfig(config);
  };

  const handleResetOnboarding = () => {
    setSearchedPostcode("");
    setAddressList([]);
    setSelectedAddress(null);
    setSelectedCouncilConfig(null);
    setProprietaryId("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9f6] text-stone-800 selection:bg-emerald-600 selection:text-white">
      <PwaInstallPrompt />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenBugReport={() => setShowBugModal(true)}
        onOpenChangeAddress={() => setShowChangeAddressModal(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {user ? (
          /* ================= Authenticated User Views ================= */
          <div className="space-y-8 animate-fade-in">
            {councilConfig && <DegradedCouncilBanner councilConfig={councilConfig} />}

            {/* Tab: Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <NextCollectionHero
                  schedule={schedule}
                  councilName={user.address.councilName}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CollectionCalendar schedule={schedule} />
                  <CollectionList schedule={schedule} />
                </div>
              </div>
            )}

            {/* Tab: Customizer */}
            {activeTab === "customizer" && (
              <BinCustomizer onShowToast={addToast} />
            )}

            {/* Tab: Integrations */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <CalendarFeedSettings onShowToast={addToast} />
                <HomeAssistantGuide onShowToast={addToast} />
                <WebhooksManager onShowToast={addToast} />
              </div>
            )}

            {/* Tab: Settings & Property Management */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <NotificationSettings onShowToast={addToast} />
                <DangerZone
                  onShowToast={addToast}
                  onOpenChangeAddress={() => setShowChangeAddressModal(true)}
                  onOpenBugReport={() => setShowBugModal(true)}
                />
              </div>
            )}
          </div>
        ) : (
          /* ================= Unauthenticated Onboarding Flow ================= */
          <div className="space-y-12 py-4">
            {!searchedPostcode ? (
              <PostcodeLookup onSearch={handlePostcodeSearch} isLoading={searching} />
            ) : (
              <div className="space-y-6">
                <AddressSelector
                  addresses={addressList}
                  selectedAddress={selectedAddress}
                  onSelectAddress={handleSelectAddress}
                  onReset={handleResetOnboarding}
                  postcode={searchedPostcode}
                />

                {selectedAddress && selectedCouncilConfig && (
                  <>
                    {selectedCouncilConfig.isSupported ? (
                      <CouncilStatusCard
                        address={selectedAddress}
                        councilConfig={selectedCouncilConfig}
                        proprietaryId={proprietaryId}
                        onProceedToAuth={() => setShowAuthModal(true)}
                        onOpenProprietaryModal={() => setShowProprietaryModal(true)}
                      />
                    ) : (
                      <WaitlistForm
                        address={selectedAddress}
                        councilConfig={selectedCouncilConfig}
                        onReset={handleResetOnboarding}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Feature Highlights Grid for Visitors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-stone-200">
              <div className="glass-card p-5 space-y-2 border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Apple & Google Calendar Sync</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Subscribe with standard <span className="font-mono text-emerald-700 font-semibold">webcal://</span> feeds. Native 19:00 night-before push alerts directly on your smartphone.
                </p>
              </div>

              <div className="glass-card p-5 space-y-2 border-amber-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Smart Home & Home Assistant</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Dedicated token-secured JSON endpoints and Webhooks for automations, e-ink dashboard displays, and LED status lights.
                </p>
              </div>

              <div className="glass-card p-5 space-y-2 border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">100% GDPR Compliant</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Zero tracking cookies. Instant one-click JSON data export (Article 20) and permanent right to erasure (Article 17).
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-stone-200 bg-white/80 py-6 text-xs text-stone-500 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">BinDay UK</span>
            <span>•</span>
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Personal Project (robbrad/UKBinCollectionData)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => setShowBugModal(true)}
              className="hover:text-amber-800 flex items-center gap-1 text-stone-600 transition-colors font-medium"
            >
              <Bug className="w-3.5 h-3.5 text-amber-700" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => setShowAboutModal(true)}
              className="hover:text-emerald-800 flex items-center gap-1 text-stone-600 transition-colors font-medium"
            >
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>About</span>
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-stone-900 underline text-stone-500"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-stone-900 underline text-stone-500"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          pendingAddress={
            selectedAddress
              ? {
                  ...selectedAddress,
                  proprietaryId: proprietaryId || undefined
                }
              : null
          }
          onOpenPrivacy={() => setShowPrivacyModal(true)}
          onOpenTerms={() => setShowTermsModal(true)}
          onSuccess={() => {
            addToast("Welcome to BinDay!", "Your schedule is now synchronized.");
          }}
        />
      )}

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      {showAboutModal && (
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
      )}

      {showBugModal && (
        <BugReportModal
          isOpen={showBugModal}
          onClose={() => setShowBugModal(false)}
          onShowToast={addToast}
        />
      )}

      {showChangeAddressModal && (
        <ChangeAddressModal
          isOpen={showChangeAddressModal}
          onClose={() => setShowChangeAddressModal(false)}
          onShowToast={addToast}
        />
      )}

      {showProprietaryModal && selectedCouncilConfig && (
        <ProprietaryIdModal
          councilConfig={selectedCouncilConfig}
          currentId={proprietaryId}
          onSave={(id) => {
            setProprietaryId(id);
            addToast("Reference ID Set", `Saved council reference ID: ${id}`);
          }}
          onClose={() => setShowProprietaryModal(false)}
        />
      )}

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <MainAppContent />
      </ScheduleProvider>
    </AuthProvider>
  );
};

export default App;
