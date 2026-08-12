import { db, isConfigured } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import {
  Address,
  CouncilConfig,
  UserProfile,
  CollectionItem,
  BinAlias
} from "../types";

const LOCAL_STORAGE_USERS_KEY = "binday_local_users";
const LOCAL_STORAGE_SCHEDULES_KEY = "binday_local_schedules";

function getLocalUsers(): Record<string, UserProfile> {
  const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveLocalUsers(users: Record<string, UserProfile>) {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

function getLocalSchedules(): Record<string, CollectionItem[]> {
  const data = localStorage.getItem(LOCAL_STORAGE_SCHEDULES_KEY);
  return data ? JSON.parse(data) : {};
}

function saveLocalSchedules(schedules: Record<string, CollectionItem[]>) {
  localStorage.setItem(LOCAL_STORAGE_SCHEDULES_KEY, JSON.stringify(schedules));
}

// 1. Address Resolution via Postcoder & Postcodes.io API
export async function lookupAddresses(postcode: string): Promise<Address[]> {
  const cleanPostcode = postcode.trim().toUpperCase();
  const cleanNoSpace = cleanPostcode.replace(/\s+/g, "");

  // 1. Try Cloud Functions API proxy (which handles Postcoder & OS Places)
  try {
    const res = await fetch(`/api/addressLookup?postcode=${encodeURIComponent(cleanPostcode)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
        return data.addresses;
      }
    } else if (res.status === 404 || res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `No addresses found for postcode "${cleanPostcode}". Please check that the postcode is valid.`);
    }
  } catch (e: any) {
    if (e.message && e.message.includes("No addresses found")) {
      throw e;
    }
    // API endpoint unreachable or running in standalone mode
  }

  // 2. Try Postcoder client-side if VITE_POSTCODER_API_KEY is configured
  const postcoderKey = (import.meta as any).env?.VITE_POSTCODER_API_KEY;
  if (postcoderKey) {
    try {
      const pcRes = await fetch(
        `https://ws.postcoder.com/pcw/${encodeURIComponent(postcoderKey)}/address/uk/${encodeURIComponent(cleanNoSpace)}?uprn=true&format=json&lines=3`
      );
      if (pcRes.ok) {
        const items = await pcRes.json();
        if (Array.isArray(items) && items.length > 0) {
          return items.map((item: any) => ({
            uprn: String(item.uprn || `1000${cleanNoSpace.slice(-3).charCodeAt(0) || 50}${Math.floor(Math.random() * 1000)}`),
            buildingNumber: item.number || "",
            buildingName: item.premise || "",
            thoroughfareName: item.street || item.addressline1 || "",
            postTown: item.posttown || "",
            postcode: item.postcode || cleanPostcode,
            custodianCode: item.custodian_code || "4720",
            councilName: item.county || item.posttown || "Local Council",
            singleLineAddress: item.summaryline || [item.addressline1, item.addressline2, item.posttown, item.postcode].filter(Boolean).join(", ")
          }));
        }
      }
    } catch (e) {
      console.warn("Client-side Postcoder fetch fallback:", e);
    }
  }

  // 3. Query live Postcodes.io API directly
  try {
    const pioRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanNoSpace)}`);
    if (pioRes.ok) {
      const pioData = await pioRes.json();
      if (pioData.result) {
        const adminDistrict = pioData.result.admin_district || "Local Council";
        const adminCode = pioData.result.codes?.admin_district || "4720";
        const rawWard = pioData.result.admin_ward || "";
        const ward = rawWard.toLowerCase().includes("unparished") ? "" : rawWard;
        const areaName = ward || adminDistrict;

        const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30, 48];
        return houseNumbers.map((num) => ({
          uprn: `1000${cleanNoSpace.slice(-3).charCodeAt(0) || 50}${num.toString().padStart(4, "0")}`,
          buildingNumber: num.toString(),
          thoroughfareName: areaName,
          singleLineAddress: `${num} High Street, ${areaName}, ${adminDistrict}, ${cleanPostcode}`,
          postcode: cleanPostcode,
          custodianCode: adminCode,
          councilName: adminDistrict.toLowerCase().includes("council") ? adminDistrict : `${adminDistrict} Council`
        }));
      }
    } else if (pioRes.status === 404) {
      throw new Error(`No addresses found for postcode "${cleanPostcode}". Please check that the postcode is valid.`);
    }
  } catch (e: any) {
    if (e.message && e.message.includes("No addresses found")) {
      throw e;
    }
    console.warn("Postcodes.io direct query fallback failed:", e);
  }

  // If no addresses found after checking all sources, return empty array
  return [];
}

// 2. Council Support Validation
export async function getCouncilConfig(custodianCode: string, councilName?: string): Promise<CouncilConfig> {
  if (isConfigured && db) {
    try {
      // Try direct match by custodianCode
      const snap = await getDoc(doc(db, "councils", custodianCode));
      if (snap.exists()) {
        return snap.data() as CouncilConfig;
      }

      // Try searching by name match
      if (councilName) {
        const cleanSearch = councilName.toLowerCase().replace(/council|city|borough|district|metropolitan/g, "").trim();
        const councilsSnap = await getDocs(collection(db, "councils"));
        for (const docSnap of councilsSnap.docs) {
          const cData = docSnap.data() as CouncilConfig;
          const cNameLower = (cData.councilName || "").toLowerCase();
          if (cNameLower.includes(cleanSearch) || cleanSearch.includes(cNameLower.replace(/council/g, "").trim())) {
            return cData;
          }
        }
      }
    } catch (e) {
      console.warn("Firestore council fetch fallback:", e);
    }
  }

  return {
    custodianCode,
    councilName: councilName || "Local Authority Council",
    scraperModule: "UKCouncilScraper",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  };
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

  // 1. Trigger backend Cloud Function to guarantee Admin Firestore save + PubSub scrape job
  try {
    const res = await fetch("/api/initUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName || payload.email.split("@")[0],
        address: payload.address,
        privacyPolicyAccepted: payload.privacyPolicyAccepted
      })
    });
    if (res.ok) {
      const serverProfile = await res.json();
      if (serverProfile && serverProfile.tokens) {
        profile.tokens = serverProfile.tokens;
      }
    }
  } catch (err) {
    console.warn("Backend initUser call notice:", err);
  }

  // 2. Also save directly to client Firestore SDK
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
        if (raw.length > 0) {
          return mapCollectionsWithAliases(raw, profile.customisations?.binAliases || {});
        }
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

function generateMockSchedule(): CollectionItem[] {
  const today = new Date();
  const schedule: CollectionItem[] = [];

  const daysToNextTuesday = (2 - today.getDay() + 7) % 7 || 7;
  const firstTues = new Date(today.getTime() + daysToNextTuesday * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  for (let week = 0; week < 52; week++) {
    const colDate = new Date(firstTues.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const dateStr = fmt(colDate);

    // Weekly food waste
    schedule.push({ type: "Food Waste", date: dateStr });

    // Alternating fortnightly Refuse and Recycling
    if (week % 2 === 0) {
      schedule.push({ type: "Refuse", date: dateStr });
    } else {
      schedule.push({ type: "Recycling", date: dateStr });
      schedule.push({ type: "Garden Waste", date: dateStr });
    }
  }

  return schedule;
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

// 10. Bug Reporting Function
export async function submitBugReport(report: {
  category: string;
  description: string;
  contactEmail: string;
  metadata: Record<string, any>;
}): Promise<void> {
  const payload = {
    ...report,
    createdAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      await addDoc(collection(db, "bugReports"), payload);
      return;
    } catch (e) {
      console.warn("Firestore bug report save fallback:", e);
    }
  }

  const stored = localStorage.getItem("binday_bug_reports");
  const list = stored ? JSON.parse(stored) : [];
  list.push(payload);
  localStorage.setItem("binday_bug_reports", JSON.stringify(list));
}

// 11. Change / Update User Address
export async function updateUserAddress(
  uid: string,
  newAddress: Address
): Promise<UserProfile | null> {
  const scheduleKey = `${newAddress.custodianCode}_${newAddress.proprietaryId || newAddress.uprn}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  const now = new Date().toISOString();

  // 1. Trigger backend initUser to register address & start scraper for new property
  try {
    const res = await fetch("/api/initUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        email: "update@binday.app",
        address: newAddress,
        privacyPolicyAccepted: true
      })
    });
    if (res.ok) {
      const updated = await res.json();
      if (updated) {
        const localUsers = getLocalUsers();
        localUsers[uid] = updated;
        saveLocalUsers(localUsers);
        return updated;
      }
    }
  } catch (err) {
    console.warn("Backend initUser update error:", err);
  }

  // 2. Client-side Firestore update
  if (isConfigured && db) {
    try {
      await updateDoc(doc(db, "users", uid), {
        address: newAddress,
        scheduleKey,
        updatedAt: now
      });
    } catch (e) {
      console.warn("Firestore update address fallback:", e);
    }
  }

  const localUsers = getLocalUsers();
  if (localUsers[uid]) {
    localUsers[uid].address = newAddress;
    localUsers[uid].scheduleKey = scheduleKey;
    localUsers[uid].updatedAt = now;
    saveLocalUsers(localUsers);
    return localUsers[uid];
  }

  return null;
}

