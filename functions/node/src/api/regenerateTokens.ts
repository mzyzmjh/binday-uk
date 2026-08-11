import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function handleRegenerateTokens(req: Request, res: Response): Promise<void> {
  try {
    // Verify Firebase Auth ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized. Missing Firebase Auth token." });
      return;
    }

    const idToken = authHeader.substring(7);
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const newCalendarToken = uuidv4();
    const newApiToken = uuidv4();

    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);

    await userRef.update({
      "tokens.calendarToken": newCalendarToken,
      "tokens.apiToken": newApiToken,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "Tokens regenerated successfully.",
      tokens: {
        calendarToken: newCalendarToken,
        apiToken: newApiToken
      }
    });
  } catch (error: any) {
    console.error("Token regeneration error:", error);
    res.status(500).json({ error: "Failed to regenerate tokens." });
  }
}
