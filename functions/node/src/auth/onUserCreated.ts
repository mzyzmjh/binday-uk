import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

export interface CreateUserProfilePayload {
  uid: string;
  email: string;
  displayName?: string;
  address: {
    uprn: string;
    buildingNumber?: string;
    buildingName?: string;
    thoroughfareName?: string;
    singleLineAddress: string;
    postcode: string;
    custodianCode: string;
    councilName: string;
    proprietaryId?: string;
  };
  privacyPolicyAccepted: boolean;
}

export function generateScheduleKey(custodianCode: string, uprn: string, proprietaryId?: string): string {
  const primaryId = proprietaryId ? `prop_${proprietaryId}` : uprn;
  return `${custodianCode}_${primaryId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function initializeUserProfile(payload: CreateUserProfilePayload) {
  const db = admin.firestore();
  const now = new Date().toISOString();
  const scheduleKey = generateScheduleKey(
    payload.address.custodianCode,
    payload.address.uprn,
    payload.address.proprietaryId
  );

  const calendarToken = uuidv4();
  const apiToken = uuidv4();

  const userDocRef = db.collection("users").doc(payload.uid);
  const scheduleDocRef = db.collection("schedules").doc(scheduleKey);

  // 1. Create or update User profile document
  const userProfile = {
    uid: payload.uid,
    email: payload.email,
    displayName: payload.displayName || "",
    address: payload.address,
    scheduleKey,
    tokens: {
      calendarToken,
      apiToken
    },
    customisations: {
      binAliases: {
        "Refuse": { alias: "General Waste (Black Bin)", color: "#1f2937", icon: "trash-2" },
        "Recycling": { alias: "Dry Recycling (Green/Blue)", color: "#2563eb", icon: "recycle" },
        "Garden Waste": { alias: "Garden Waste (Brown Bin)", color: "#15803d", icon: "trees" },
        "Food Waste": { alias: "Food Caddy", color: "#d97706", icon: "utensils" }
      }
    },
    alertPreferences: {
      enabled: true,
      leadTimeHours: 17, // 19:00 night before
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

  await userDocRef.set(userProfile, { merge: true });

  // 2. Increment subscribers count on schedule doc or seed placeholder schedule
  const scheduleSnap = await scheduleDocRef.get();
  if (scheduleSnap.exists) {
    await scheduleDocRef.update({
      subscribersCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now
    });
  } else {
    // Seed initial schedule structure with next 4 weeks of sample dates for immediate preview
    const today = new Date();
    const mockCollections = [
      { type: "Refuse", date: getOffsetDateStr(today, 2) },
      { type: "Food Waste", date: getOffsetDateStr(today, 2) },
      { type: "Recycling", date: getOffsetDateStr(today, 9) },
      { type: "Food Waste", date: getOffsetDateStr(today, 9) },
      { type: "Garden Waste", date: getOffsetDateStr(today, 9) },
      { type: "Refuse", date: getOffsetDateStr(today, 16) },
      { type: "Food Waste", date: getOffsetDateStr(today, 16) },
      { type: "Recycling", date: getOffsetDateStr(today, 23) },
      { type: "Food Waste", date: getOffsetDateStr(today, 23) }
    ];

    await scheduleDocRef.set({
      scheduleKey,
      custodianCode: payload.address.custodianCode,
      uprn: payload.address.uprn,
      postcode: payload.address.postcode,
      collections: mockCollections,
      lastScrapedAt: now,
      nextScrapeDue: getOffsetDateStr(today, 7),
      errorCount: 0,
      subscribersCount: 1
    });
  }

  return userProfile;
}

function getOffsetDateStr(baseDate: Date, offsetDays: number): string {
  const d = new Date(baseDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}
