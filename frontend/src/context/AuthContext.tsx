import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, Address, BinAlias } from "../types";
import {
  registerWithEmail,
  loginWithEmail,
  signInWithGoogle,
  quickDemoLogin,
  logoutUser,
  deleteCurrentAccount,
  getStoredSessionUser
} from "../firebase/authService";
import {
  updateBinAliases,
  updateAlertPreferences,
  updateWebhooks,
  regenerateUserTokens,
  exportUserDataJson,
  createOrInitUserProfile
} from "../firebase/firestoreService";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  register: (email: string, pass: string, name: string, address: Address, privacyAccepted: boolean) => Promise<UserProfile>;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  loginGoogle: (address?: Address, privacyAccepted?: boolean) => Promise<UserProfile>;
  loginDemo: (address?: Address) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateAliases: (aliases: Record<string, BinAlias>) => Promise<void>;
  updateAlerts: (prefs: { enabled: boolean; leadTimeHours: number; valarmTrigger: string }) => Promise<void>;
  updateWebhooksConfig: (webhooks: Array<{ id: string; url: string; enabled: boolean; secret?: string }>) => Promise<void>;
  resetTokens: () => Promise<{ calendarToken: string; apiToken: string }>;
  downloadData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = getStoredSessionUser();
    if (saved) {
      setUser(saved);
      // Proactively sync existing profile to Firestore and ensure server record
      createOrInitUserProfile({
        uid: saved.uid,
        email: saved.email,
        displayName: saved.displayName,
        address: saved.address,
        privacyPolicyAccepted: saved.gdpr?.privacyPolicyAccepted ?? true
      }).catch((err) => console.warn("Background session sync notice:", err));
    }
    setLoading(false);
  }, []);

  const register = async (email: string, pass: string, name: string, address: Address, privacyAccepted: boolean) => {
    setLoading(true);
    try {
      const u = await registerWithEmail(email, pass, name, address, privacyAccepted);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await loginWithEmail(email, pass);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async (address?: Address, privacyAccepted: boolean = true) => {
    setLoading(true);
    try {
      const u = await signInWithGoogle(address, privacyAccepted);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (address?: Address) => {
    setLoading(true);
    try {
      const u = await quickDemoLogin(address);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateAliases = async (aliases: Record<string, BinAlias>) => {
    if (!user) return;
    await updateBinAliases(user.uid, aliases);
    setUser((prev) => (prev ? { ...prev, customisations: { ...prev.customisations, binAliases: aliases } } : null));
  };

  const updateAlerts = async (prefs: { enabled: boolean; leadTimeHours: number; valarmTrigger: string }) => {
    if (!user) return;
    await updateAlertPreferences(user.uid, prefs);
    setUser((prev) => (prev ? { ...prev, alertPreferences: prefs } : null));
  };

  const updateWebhooksConfig = async (webhooks: Array<{ id: string; url: string; enabled: boolean; secret?: string }>) => {
    if (!user) return;
    await updateWebhooks(user.uid, webhooks);
    setUser((prev) => (prev ? { ...prev, webhooks } : null));
  };

  const resetTokens = async () => {
    if (!user) throw new Error("No active user session.");
    const newTokens = await regenerateUserTokens(user.uid);
    setUser((prev) => (prev ? { ...prev, tokens: newTokens } : null));
    return newTokens;
  };

  const downloadData = async () => {
    if (!user) return;
    const jsonStr = await exportUserDataJson(user.uid);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `binday-user-data-${user.uid}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteCurrentAccount();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginGoogle,
        loginDemo,
        logout,
        updateAliases,
        updateAlerts,
        updateWebhooksConfig,
        resetTokens,
        downloadData,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
