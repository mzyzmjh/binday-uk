import * as admin from "firebase-admin";

export async function processRemindersAndWebhooks(): Promise<{ processedUsers: number; webhooksFired: number }> {
  const db = admin.firestore();
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const usersSnap = await db.collection("users").get();
  let processedUsers = 0;
  let webhooksFired = 0;

  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data();
    const scheduleKey = user.scheduleKey;
    const webhooks = user.webhooks || [];
    const binAliases = user.customisations?.binAliases || {};

    if (!scheduleKey) continue;

    const scheduleDoc = await db.collection("schedules").doc(scheduleKey).get();
    if (!scheduleDoc.exists) continue;

    const collections: Array<{ type: string; date: string }> = scheduleDoc.data()?.collections || [];
    const tomorrowBins = collections.filter((c) => c.date === tomorrowStr);

    if (tomorrowBins.length > 0) {
      processedUsers++;

      // Dispatch Webhooks
      for (const wh of webhooks) {
        if (wh.enabled && wh.url) {
          try {
            const payload = {
              event: "bin_reminder",
              timestamp: new Date().toISOString(),
              address: user.address?.singleLineAddress,
              postcode: user.address?.postcode,
              bins: tomorrowBins.map((b) => ({
                raw_type: b.type,
                display_name: binAliases[b.type]?.alias || b.type,
                color: binAliases[b.type]?.color || "#1f2937",
                date: b.date
              }))
            };

            await fetch(wh.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(wh.secret ? { "X-BinDay-Secret": wh.secret } : {})
              },
              body: JSON.stringify(payload)
            });

            webhooksFired++;
          } catch (err) {
            console.error(`Webhook error for user ${user.uid} (${wh.url}):`, err);
          }
        }
      }
    }
  }

  return { processedUsers, webhooksFired };
}
