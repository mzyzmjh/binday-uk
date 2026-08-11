import { Request, Response } from "express";
import * as admin from "firebase-admin";

export interface IcalEventData {
  uid: string;
  summary: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  colorHex?: string;
  valarmTrigger?: string; // e.g. "-PT17H" (19:00 day before)
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
    "X-WR-TIMEZONE:Europe/London"
  ];

  for (const event of events) {
    const cleanDate = event.dateStr.replace(/-/g, ""); // YYYYMMDD
    
    // Calculate DTEND for all day event (next day)
    const startDate = new Date(event.dateStr + "T00:00:00Z");
    const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    const nextDateStr = nextDay.toISOString().split("T")[0].replace(/-/g, "");

    const valarm = event.valarmTrigger || "-PT17H";

    ics.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${nextDateStr}`,
      `SUMMARY:${event.summary}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: Put out your ${event.summary} tonight!`,
      `TRIGGER:${valarm}`,
      "END:VALARM",
      "END:VEVENT"
    );
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n") + "\r\n";
}

export async function handleIcalFeed(req: Request, res: Response): Promise<void> {
  try {
    const token = (
      typeof req.params.token === "string"
        ? req.params.token
        : typeof req.query.token === "string"
        ? req.query.token
        : ""
    ).trim();
    if (!token) {
      res.status(400).send("Invalid or missing calendar token.");
      return;
    }

    const db = admin.firestore();
    const usersSnapshot = await db
      .collection("users")
      .where("tokens.calendarToken", "==", token)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      res.status(404).send("Calendar feed not found or token revoked.");
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const scheduleKey = userData.scheduleKey;
    const address = userData.address?.singleLineAddress || "My Home";
    const binAliases = userData.customisations?.binAliases || {};
    const valarmPref = userData.alertPreferences?.valarmTrigger || "-PT17H";

    let collections: Array<{ type: string; date: string }> = [];

    if (scheduleKey) {
      const scheduleDoc = await db.collection("schedules").doc(scheduleKey).get();
      if (scheduleDoc.exists) {
        collections = scheduleDoc.data()?.collections || [];
      }
    }

    const events: IcalEventData[] = collections.map((col, idx) => {
      const custom = binAliases[col.type];
      const displayName = custom?.alias ? custom.alias : col.type;
      const colorHex = custom?.color;

      return {
        uid: `binday-${scheduleKey}-${col.date}-${idx}@binday.app`,
        summary: `Bin Day: ${displayName}`,
        description: `Scheduled ${displayName} collection for ${address}.\nManaged via BinDay.`,
        dateStr: col.date,
        colorHex,
        valarmTrigger: valarmPref
      };
    });

    const icsBody = generateIcalString(`Bin Collections - ${userData.address?.postcode || "BinDay"}`, events);

    res.set({
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="binday-schedule.ics"',
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400"
    });

    res.status(200).send(icsBody);
  } catch (error: any) {
    console.error("iCal Feed Generation Error:", error);
    res.status(500).send("Error generating calendar feed.");
  }
}
