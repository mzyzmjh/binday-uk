import { Request, Response } from "express";
import * as admin from "firebase-admin";

export async function handleJsonSchedule(req: Request, res: Response): Promise<void> {
  try {
    let token = req.query.token as string || "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      res.status(401).json({ error: "Missing required API token. Pass via Authorization: Bearer <token> or ?token=<token>" });
      return;
    }

    const db = admin.firestore();
    const usersSnapshot = await db
      .collection("users")
      .where("tokens.apiToken", "==", token)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      res.status(401).json({ error: "Invalid API token or token revoked." });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const scheduleKey = userData.scheduleKey;
    const binAliases = userData.customisations?.binAliases || {};

    let rawCollections: Array<{ type: string; date: string }> = [];

    if (scheduleKey) {
      const scheduleDoc = await db.collection("schedules").doc(scheduleKey).get();
      if (scheduleDoc.exists) {
        rawCollections = scheduleDoc.data()?.collections || [];
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr + "T00:00:00Z");

    const mapped = rawCollections
      .filter((c) => c.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((col) => {
        const custom = binAliases[col.type];
        const colDate = new Date(col.date + "T00:00:00Z");
        const diffTime = colDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          raw_type: col.type,
          display_name: custom?.alias || col.type,
          color: custom?.color || "#374151",
          date: col.date,
          days_until: diffDays,
          is_today: diffDays === 0,
          is_tomorrow: diffDays === 1
        };
      });

    const nextCollection = mapped.length > 0 ? mapped[0] : null;

    res.set("Cache-Control", "private, max-age=1800"); // 30 min cache
    res.status(200).json({
      address: userData.address?.singleLineAddress,
      postcode: userData.address?.postcode,
      council: userData.address?.councilName,
      next_collection: nextCollection,
      upcoming_collections: mapped,
      updated_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("JSON Schedule API error:", error);
    res.status(500).json({ error: "Internal server error fetching schedule." });
  }
}
