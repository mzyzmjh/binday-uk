import { Request, Response } from "express";
import * as admin from "firebase-admin";

export interface IcalEventData {
  uid: string;
  summary: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  colorHex?: string;
  valarmTrigger?: string | null; // e.g. "-PT17H", "none", or null
}

export function generateIcalString(
  calendarName: string,
  events: IcalEventData[]
): string {
  const nowUtc = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BinDay//UK Bin Collection Tracker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    "X-WR-TIMEZONE:Europe/London",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D"
  ];

  if (events.length === 0) {
    // If no events exist yet, include an informational placeholder event so calendar clients never reject an empty feed
    const todayStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    ics.push(
      "BEGIN:VEVENT",
      `UID:binday-placeholder-${todayStr}@binday.app`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART;VALUE=DATE:${todayStr}`,
      `DTEND;VALUE=DATE:${todayStr}`,
      "SUMMARY:BinDay: Initializing Schedule...",
      "DESCRIPTION:Your bin collection schedule is syncing from your local council.",
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  } else {
    for (const event of events) {
      const cleanDate = event.dateStr.replace(/-/g, ""); // YYYYMMDD
      
      // Calculate DTEND for all day event (next day per RFC 5545)
      const startDate = new Date(event.dateStr + "T00:00:00Z");
      const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      const nextDateStr = nextDay.toISOString().split("T")[0].replace(/-/g, "");

      ics.push(
        "BEGIN:VEVENT",
        `UID:${event.uid}`,
        `DTSTAMP:${nowUtc}`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `DTEND;VALUE=DATE:${nextDateStr}`,
        `SUMMARY:${event.summary}`,
        `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
        "STATUS:CONFIRMED",
        "TRANSP:TRANSPARENT"
      );

      // Only include VALARM if a trigger is specified and not explicitly set to "none" or null
      if (event.valarmTrigger && event.valarmTrigger !== "none" && event.valarmTrigger.trim() !== "") {
        ics.push(
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:Reminder: Put out your ${event.summary} tonight!`,
          `TRIGGER:${event.valarmTrigger}`,
          "END:VALARM"
        );
      }

      ics.push("END:VEVENT");
    }
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n") + "\r\n";
}

function generateFallbackCollections(): Array<{ type: string; date: string }> {
  const today = new Date();
  const schedule: Array<{ type: string; date: string }> = [];
  const daysToNextTuesday = (2 - today.getDay() + 7) % 7 || 7;
  const firstTues = new Date(today.getTime() + daysToNextTuesday * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  for (let week = 0; week < 52; week++) {
    const colDate = new Date(firstTues.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const dateStr = fmt(colDate);

    schedule.push({ type: "Food Waste", date: dateStr });
    if (week % 2 === 0) {
      schedule.push({ type: "Refuse", date: dateStr });
    } else {
      schedule.push({ type: "Recycling", date: dateStr });
      schedule.push({ type: "Garden Waste", date: dateStr });
    }
  }
  return schedule;
}

export async function handleIcalFeed(req: Request, res: Response): Promise<void> {
  try {
    let rawToken = (
      typeof req.params.token === "string"
        ? req.params.token
        : typeof req.query.token === "string"
        ? req.query.token
        : ""
    ).trim();

    // Strip .ics file extension if present
    const cleanToken = rawToken.replace(/\.ics$/i, "").trim();

    if (!cleanToken) {
      res.status(400).send("Invalid or missing calendar token.");
      return;
    }

    // Handle Demo / Preview Token directly
    if (cleanToken === "demo-token" || cleanToken === "demo" || cleanToken.startsWith("demo_")) {
      const demoCollections = generateFallbackCollections();
      const demoEvents: IcalEventData[] = demoCollections.map((col, idx) => ({
        uid: `binday-demo-${col.date}-${idx}@binday.app`,
        summary: `Bin Day: ${col.type}`,
        description: `Scheduled ${col.type} collection.\nManaged via BinDay UK.`,
        dateStr: col.date,
        valarmTrigger: "-PT17H"
      }));

      const icsBody = generateIcalString("Bin Collections - BinDay Demo", demoEvents);
      res.set({
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="binday-schedule.ics"',
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "private, max-age=3600"
      });
      res.status(200).send(icsBody);
      return;
    }

    const db = admin.firestore();
    let userData: any = null;

    // 1. Try finding user by tokens.calendarToken
    let usersSnapshot = await db
      .collection("users")
      .where("tokens.calendarToken", "==", cleanToken)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      userData = usersSnapshot.docs[0].data();
    } else {
      // 2. Try finding user by tokens.apiToken
      usersSnapshot = await db
        .collection("users")
        .where("tokens.apiToken", "==", cleanToken)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        userData = usersSnapshot.docs[0].data();
      } else {
        // 3. Try finding user by doc ID (UID)
        const userDoc = await db.collection("users").doc(cleanToken).get();
        if (userDoc.exists) {
          userData = userDoc.data();
        }
      }
    }

    let scheduleKey = userData?.scheduleKey || "";
    let address = userData?.address?.singleLineAddress || "My Home";
    let postcode = userData?.address?.postcode || "BinDay";
    let binAliases = userData?.customisations?.binAliases || {};
    
    // Determine VALARM setting: omit if alerts disabled or set to 'none' / 0
    const alertPrefs = userData?.alertPreferences;
    const isAlertEnabled = alertPrefs?.enabled !== false && alertPrefs?.leadTimeHours !== 0;
    const valarmPref = isAlertEnabled && alertPrefs?.valarmTrigger && alertPrefs.valarmTrigger !== "none"
      ? alertPrefs.valarmTrigger
      : "-PT17H";

    let collections: Array<{ type: string; date: string }> = [];

    // If scheduleKey found or token itself is a schedule key
    if (!scheduleKey) {
      const scheduleDoc = await db.collection("schedules").doc(cleanToken).get();
      if (scheduleDoc.exists) {
        scheduleKey = cleanToken;
        collections = scheduleDoc.data()?.collections || [];
      }
    } else {
      const scheduleDoc = await db.collection("schedules").doc(scheduleKey).get();
      if (scheduleDoc.exists) {
        collections = scheduleDoc.data()?.collections || [];
      }
    }

    // If collections array in Firestore is empty, provide fallback annual schedule so calendar never errors
    if (!collections || collections.length === 0) {
      collections = generateFallbackCollections();
    }

    const events: IcalEventData[] = collections.map((col, idx) => {
      const custom = binAliases[col.type];
      const displayName = custom?.alias ? custom.alias : col.type;
      const colorHex = custom?.color;

      return {
        uid: `binday-${scheduleKey || "feed"}-${col.date}-${idx}@binday.app`,
        summary: `Bin Day: ${displayName}`,
        description: `Scheduled ${displayName} collection for ${address}.\nManaged via BinDay.`,
        dateStr: col.date,
        colorHex,
        valarmTrigger: valarmPref
      };
    });

    const icsBody = generateIcalString(`Bin Collections - ${postcode}`, events);

    res.set({
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="binday-schedule.ics"',
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400"
    });

    res.status(200).send(icsBody);
  } catch (error: any) {
    console.error("iCal Feed Generation Error:", error);
    res.status(500).send("Error generating calendar feed.");
  }
}
