import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc
} from "firebase/firestore";
import { db, isConfigured } from "./config";
import { UserProfile, Address, CouncilConfig, CollectionItem, BinAlias } from "../types";
import { MOCK_COUNCILS_REGISTRY, generateMockSchedule } from "./mockData";

const LOCAL_STORAGE_SCHEDULES_KEY = "binday_local_schedules";
const LOCAL_STORAGE_USERS_KEY = "binday_local_users";

function getLocalSchedules(): Record<string, CollectionItem[]> {
  const stored = localStorage.getItem(LOCAL_STORAGE_SCHEDULES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveLocalSchedules(schedules: Record<string, CollectionItem[]>) {
  localStorage.setItem(LOCAL_STORAGE_SCHEDULES_KEY, JSON.stringify(schedules));
}

function getLocalUsers(): Record<string, UserProfile> {
  const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveLocalUsers(users: Record<string, UserProfile>) {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

// 1. Address Resolution API Proxy
export async function lookupAddresses(postcode: string): Promise<Address[]> {
  const cleanPostcode = postcode.trim().toUpperCase();

  try {
    const res = await fetch(`/api/addressLookup?postcode=${encodeURIComponent(cleanPostcode)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.addresses && Array.isArray(data.addresses)) {
        return data.addresses;
      }
    }
  } catch (e) {
    // Local dev fallback if functions server isn't running
  }

  // Fallback to rich mock DPA generator
  const cleanNoSpace = cleanPostcode.replace(/\s+/g, "");
  let custodian = "4720";
  let councilName = "Leeds City Council";

  if (cleanNoSpace.startsWith("M1")) {
    custodian = "240";
    councilName = "Manchester City Council";
  } else if (cleanNoSpace.startsWith("BS")) {
    custodian = "114";
    councilName = "Bristol City Council";
  } else if (cleanNoSpace.startsWith("SW1")) {
    custodian = "5990";
    councilName = "City of Westminster";
  } else if (cleanNoSpace.startsWith("EX1")) {
    custodian = "9999";
    councilName = "Example Proprietary Council";
  } else if (cleanNoSpace.startsWith("ZZ99")) {
    custodian = "8888";
    councilName = "Unsupported Glen Council";
  }

  const numbers = [1, 2, 5, 8, 12, 24, 104];
  return numbers.map((num) => ({
    uprn: `1000${cleanNoSpace.charCodeAt(0) || 50}${num.toString().padStart(4, "0")}`,
    buildingNumber: num.toString(),
    thoroughfareName: "High Street",
    singleLineAddress: `${num}, High Street, Townsville, ${cleanPostcode}`,
    postcode: cleanPostcode,
    custodianCode: custodian,
    councilName: councilName
  }));
}

// 2. Council Support Validation
export async function getCouncilConfig(custodianCode: string): Promise<CouncilConfig> {
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "councils", custodianCode));
      if (snap.exists()) {
        return snap.data() as CouncilConfig;
      }
    } catch (e) {
      console.warn("Firestore council fetch fallback:", e);
    }
  }

  return (
    MOCK_COUNCILS_REGISTRY[custodianCode] || {
      custodianCode,
      councilName: "UK Local Council",
      scraperModule: "GenericCouncil",
      isSupported: true,
      status: "operational",
      requiredParams: ["uprn"],
      requiresProprietaryId: false
    }
  );
}

// 3. User Profile Management
export async function createOrInitUserProfile(payload: {
  uid: string;
  email: string;
  displayName?: string;
  address: Address;
  privacyPolicyAccepted: boolean;
}): Promise<UserProfile> {
  const now = new Date().toISOString();
  const scheduleKey = `${payload.address.custodianCode}_${payload.address.proprietaryId || payload.address.uprn}`.replace(/[^a-zA-Z0-9_-]/g, "_");

  const profile: UserProfile = {
    uid: payload.uid,
    email: payload.email,
    displayName: payload.displayName || payload.email.split("@")[0],
    address: payload.address,
    scheduleKey,
    tokens: {
      calendarToken: "cal_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      apiToken: "api_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    },
    customisations: {
      binAliases: {
        "Refuse": { alias: "General Waste (Black Bin)", color: "#1f2937", icon: "trash-2" },
        "Recycling": { alias: "Dry Recycling (Blue Bin)", color: "#2563eb", icon: "recycle" },
        "Garden Waste": { alias: "Garden Waste (Brown Bin)", color: "#15803d", icon: "trees" },
        "Food Waste": { alias: "Food Caddy", color: "#d97706", icon: "utensils" }
      }
    },
    alertPreferences: {
      enabled: true,
      leadTimeHours: 17,
      valarmTrigger: "-PT17H"
    },
    webhooks: [],
    gdpr: {
      privacyPolicyAccepted: payload.privacyPolicyAccepted,
      privacyPolicyAcceptedAt: now,
      privacyPolicyVersion: "1.0"
    },
    createdAt: now,
    updatedAt: now
  };

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "users", payload.uid), profile, { merge: true });
    } catch (e) {
      console.warn("Firestore save profile fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  localUsers[payload.uid] = profile;
  saveLocalUsers(localUsers);

  // Seed schedule if not exists
  const localSchedules = getLocalSchedules();
  if (!localSchedules[scheduleKey]) {
    localSchedules[scheduleKey] = generateMockSchedule();
    saveLocalSchedules(localSchedules);
  }

  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore get profile fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  return localUsers[uid] || null;
}

// 4. Schedules Management
export async function getScheduleForUser(profile: UserProfile): Promise<CollectionItem[]> {
  const scheduleKey = profile.scheduleKey;

  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "schedules", scheduleKey));
      if (snap.exists()) {
        const raw = snap.data()?.collections || [];
        return mapCollectionsWithAliases(raw, profile.customisations?.binAliases || {});
      }
    } catch (e) {
      console.warn("Firestore get schedule fallback:", e);
    }
  }

  const localSchedules = getLocalSchedules();
  let collections = localSchedules[scheduleKey];
  if (!collections || collections.length === 0) {
    collections = generateMockSchedule();
    localSchedules[scheduleKey] = collections;
    saveLocalSchedules(localSchedules);
  }

  return mapCollectionsWithAliases(collections, profile.customisations?.binAliases || {});
}

export function mapCollectionsWithAliases(
  collections: CollectionItem[],
  aliases: Record<string, BinAlias>
): CollectionItem[] {
  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr + "T00:00:00Z");

  return collections
    .filter((c) => c.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((col) => {
      const custom = aliases[col.type];
      const colDate = new Date(col.date + "T00:00:00Z");
      const diffDays = Math.ceil((colDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...col,
        raw_type: col.type,
        display_name: custom?.alias || col.type,
        color: custom?.color || "#374151",
        days_until: diffDays,
        is_today: diffDays === 0,
        is_tomorrow: diffDays === 1
      };
    });
}

// 5. Customisations & Preferences
export async function updateBinAliases(
  uid: string,
  aliases: Record<string, BinAlias>
): Promise<void> {
  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, "users", uid), {
        "customisations.binAliases": aliases,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore update aliases fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  if (localUsers[uid]) {
    localUsers[uid].customisations.binAliases = aliases;
    localUsers[uid].updatedAt = new Date().toISOString();
    saveLocalUsers(localUsers);
  }
}

export async function updateAlertPreferences(
  uid: string,
  prefs: { enabled: boolean; leadTimeHours: number; valarmTrigger: string }
): Promise<void> {
  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, "users", uid), {
        alertPreferences: prefs,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore update alert pref fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  if (localUsers[uid]) {
    localUsers[uid].alertPreferences = prefs;
    saveLocalUsers(localUsers);
  }
}

export async function updateWebhooks(
  uid: string,
  webhooks: Array<{ id: string; url: string; enabled: boolean; secret?: string }>
): Promise<void> {
  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, "users", uid), {
        webhooks,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore update webhooks fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  if (localUsers[uid]) {
    localUsers[uid].webhooks = webhooks;
    saveLocalUsers(localUsers);
  }
}

// 6. Token Revocation
export async function regenerateUserTokens(uid: string): Promise<{ calendarToken: string; apiToken: string }> {
  const newCalendarToken = "cal_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const newApiToken = "api_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, "users", uid), {
        "tokens.calendarToken": newCalendarToken,
        "tokens.apiToken": newApiToken,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore regen tokens fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  if (localUsers[uid]) {
    localUsers[uid].tokens = { calendarToken: newCalendarToken, apiToken: newApiToken };
    saveLocalUsers(localUsers);
  }

  return { calendarToken: newCalendarToken, apiToken: newApiToken };
}

// 7. Feature Request / Waitlist
export async function submitFeatureRequest(req: {
  email: string;
  postcode: string;
  councilName: string;
  custodianCode: string;
  addressString: string;
}): Promise<void> {
  if (isConfigured && db) {
    try {
      await addDoc(collection(db, "featureRequests"), {
        ...req,
        createdAt: new Date().toISOString()
      });
      return;
    } catch (e) {
      console.warn("Firestore feature request fallback:", e);
    }
  }

  const stored = localStorage.getItem("binday_feature_requests");
  const list = stored ? JSON.parse(stored) : [];
  list.push({ ...req, createdAt: new Date().toISOString() });
  localStorage.setItem("binday_feature_requests", JSON.stringify(list));
}

// 8. GDPR Data Export (Article 20 Data Portability)
export async function exportUserDataJson(uid: string): Promise<string> {
  const profile = await getUserProfile(uid);
  const schedule = profile ? await getScheduleForUser(profile) : [];

  const exportData = {
    exportDate: new Date().toISOString(),
    application: "BinDay UK",
    gdprCompliant: true,
    userProfile: profile,
    upcomingSchedule: schedule
  };

  return JSON.stringify(exportData, null, 2);
}

// 9. GDPR Account & Data Deletion
export async function deleteUserAndData(uid: string): Promise<void> {
  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (e) {
      console.warn("Firestore delete user fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  delete localUsers[uid];
  saveLocalUsers(localUsers);
}
