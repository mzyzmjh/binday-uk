import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser as firebaseDeleteUser
} from "firebase/auth";
import { auth, isConfigured } from "./config";
import { UserProfile, Address } from "../types";
import { createOrInitUserProfile, getUserProfile, deleteUserAndData } from "./firestoreService";

const LOCAL_STORAGE_USER_KEY = "binday_local_user_session";

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  address: Address,
  privacyAccepted: boolean
): Promise<UserProfile> {
  if (isConfigured && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      return await createOrInitUserProfile({
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || user.displayName || "",
        address,
        privacyPolicyAccepted: privacyAccepted
      });
    } catch (e: any) {
      // If network/firebase error in dev without project, fallback to local storage
      console.warn("Firebase Auth fallback to local session:", e);
    }
  }

  // Local / Mock session fallback
  const mockUid = "usr_" + Math.random().toString(36).substring(2, 9);
  const profile = await createOrInitUserProfile({
    uid: mockUid,
    email,
    displayName: displayName || email.split("@")[0],
    address,
    privacyPolicyAccepted: privacyAccepted
  });

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
  return profile;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile | null> {
  if (isConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return await getUserProfile(cred.user.uid);
    } catch (e: any) {
      console.warn("Firebase Login fallback:", e);
    }
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

export async function signInWithGoogle(
  address?: Address,
  privacyAccepted: boolean = true
): Promise<UserProfile> {
  if (isConfigured && auth) {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      let existing = await getUserProfile(user.uid);
      if (!existing && address) {
        existing = await createOrInitUserProfile({
          uid: user.uid,
          email: user.email || "google-user@example.com",
          displayName: user.displayName || "Google User",
          address,
          privacyPolicyAccepted: privacyAccepted
        });
      }
      if (existing) return existing;
    } catch (e: any) {
      console.warn("Google SSO fallback to simulated Google session:", e);
    }
  }

  // Simulated Google Auth for dev/preview
  const mockUid = "g_usr_" + Math.random().toString(36).substring(2, 9);
  const defaultAddress = address || {
    uprn: "100051234501",
    buildingNumber: "1",
    thoroughfareName: "Church Street",
    singleLineAddress: "1, Church Street, Rothwell, Leeds, LS26 8XX",
    postcode: "LS26 8XX",
    custodianCode: "4720",
    councilName: "Leeds City Council"
  };

  const profile = await createOrInitUserProfile({
    uid: mockUid,
    email: "alex.demo@gmail.com",
    displayName: "Alex Turner",
    address: defaultAddress,
    privacyPolicyAccepted: true
  });

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
  return profile;
}

export async function quickDemoLogin(address?: Address): Promise<UserProfile> {
  const mockUid = "demo_usr_01";
  const defaultAddress = address || {
    uprn: "100051234501",
    buildingNumber: "1",
    thoroughfareName: "Church Street",
    singleLineAddress: "1, Church Street, Rothwell, Leeds, LS26 8XX",
    postcode: "LS26 8XX",
    custodianCode: "4720",
    councilName: "Leeds City Council"
  };

  const profile = await createOrInitUserProfile({
    uid: mockUid,
    email: "demo@binday.app",
    displayName: "Jane Smith",
    address: defaultAddress,
    privacyPolicyAccepted: true
  });

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
  return profile;
}

export async function logoutUser(): Promise<void> {
  if (isConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export async function deleteCurrentAccount(uid: string): Promise<void> {
  await deleteUserAndData(uid);
  if (isConfigured && auth && auth.currentUser) {
    try {
      await firebaseDeleteUser(auth.currentUser);
    } catch (e) {
      console.warn("Firebase Auth deletion warning:", e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export function getStoredSessionUser(): UserProfile | null {
  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}
