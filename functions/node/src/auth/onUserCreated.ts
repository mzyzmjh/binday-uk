import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { PubSub } from "@google-cloud/pubsub";

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

  // 1. Create or update User profile document in Firestore
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
  console.log(`Saved user profile to Firestore for UID: ${payload.uid}, scheduleKey: ${scheduleKey}`);

  // 2. Fetch Council Scraper Module
  let scraperModule = "LeedsCityCouncil";
  try {
    const councilDoc = await db.collection("councils").doc(payload.address.custodianCode).get();
    if (councilDoc.exists && councilDoc.data()?.scraperModule) {
      scraperModule = councilDoc.data()?.scraperModule;
    }
  } catch (cErr) {
    console.warn("Could not fetch council scraper module:", cErr);
  }

  // 3. Increment subscribers count or initialize cached schedule doc
  const scheduleSnap = await scheduleDocRef.get();
  if (scheduleSnap.exists) {
    await scheduleDocRef.update({
      subscribersCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now
    });
    console.log(`Reusing existing schedule cache in Firestore for ${scheduleKey}`);
  } else {
    // Initialize new schedule record in Firestore
    const nextDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    await scheduleDocRef.set({
      scheduleKey,
      custodianCode: payload.address.custodianCode,
      uprn: payload.address.uprn,
      postcode: payload.address.postcode,
      collections: [],
      lastScrapedAt: now,
      nextScrapeDue: nextDue,
      errorCount: 0,
      subscribersCount: 1
    });
    console.log(`Initialized schedule record in Firestore for ${scheduleKey}`);
  }

  // 4. Trigger Scraper Worker via Pub/Sub scrape_jobs topic
  try {
    const pubsub = new PubSub();
    const topic = pubsub.topic("scrape_jobs");
    const jobPayload = {
      custodianCode: payload.address.custodianCode,
      uprn: payload.address.uprn,
      postcode: payload.address.postcode,
      proprietaryId: payload.address.proprietaryId,
      scheduleKey: scheduleKey,
      scraperModule: scraperModule
    };
    const messageBuffer = Buffer.from(JSON.stringify(jobPayload));
    await topic.publishMessage({ data: messageBuffer });
    console.log(`Published scrape job to PubSub topic scrape_jobs for ${scheduleKey}`);
  } catch (pubsubErr) {
    console.warn("PubSub publish notice (may be offline/emulator):", pubsubErr);
  }

  return userProfile;
}
