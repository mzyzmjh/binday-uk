import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import express from "express";
import cors from "cors";

import { handleAddressLookup } from "./api/addressLookup";
import { handleIcalFeed } from "./api/icalFeed";
import { handleJsonSchedule } from "./api/jsonSchedule";
import { handleRegenerateTokens } from "./api/regenerateTokens";
import { initializeUserProfile } from "./auth/onUserCreated";
import { deleteUserData } from "./auth/onUserDeleted";
import { processRemindersAndWebhooks } from "./scheduled/sendReminders";
import { runCouncilWatchdog } from "./scheduled/councilWatchdog";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.get("/addressLookup", handleAddressLookup);
app.get("/ical/:token", handleIcalFeed);
app.get("/ical", handleIcalFeed);
app.get("/schedule", handleJsonSchedule);
app.post("/regenerateTokens", handleRegenerateTokens);

// User profile & GDPR endpoints
app.post("/initUser", async (req, res) => {
  try {
    const result = await initializeUserProfile(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Init User Error:", err);
    res.status(500).json({ error: err.message || "Failed to initialize user." });
  }
});

app.post("/deleteUser", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      res.status(400).json({ error: "Missing uid" });
      return;
    }
    const result = await deleteUserData(uid);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Delete User Error:", err);
    res.status(500).json({ error: err.message || "Failed to delete user." });
  }
});

// Export Main Express HTTP API
export const api = functions.https.onRequest(app);

// Export Auth Triggers
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  console.log(`New user created: ${user.uid} (${user.email})`);
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  console.log(`User deleted: ${user.uid}, enforcing GDPR hard delete.`);
  await deleteUserData(user.uid);
});

// Export Scheduled Functions
export const sendRemindersSchedule = functions.pubsub
  .schedule("every day 19:00")
  .timeZone("Europe/London")
  .onRun(async () => {
    console.log("Running scheduled reminder and webhook dispatcher...");
    const stats = await processRemindersAndWebhooks();
    console.log(`Reminders dispatched: ${stats.processedUsers} users, ${stats.webhooksFired} webhooks fired.`);
  });

export const councilWatchdogSchedule = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    console.log("Running council scraper watchdog health check...");
    const stats = await runCouncilWatchdog();
    console.log(`Watchdog completed. Checked ${stats.checkedCouncils} councils. ${stats.degradedCount} degraded.`);
  });
