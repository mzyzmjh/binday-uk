import * as admin from "firebase-admin";

export async function runCouncilWatchdog(): Promise<{ checkedCouncils: number; degradedCount: number }> {
  const db = admin.firestore();
  
  // Aggregate schedule error metrics
  const schedulesSnap = await db.collection("schedules").get();
  const errorsByCouncil: Record<string, { total: number; failed: number }> = {};

  for (const doc of schedulesSnap.docs) {
    const data = doc.data();
    const code = data.custodianCode || "unknown";
    if (!errorsByCouncil[code]) {
      errorsByCouncil[code] = { total: 0, failed: 0 };
    }
    errorsByCouncil[code].total += 1;
    if ((data.errorCount || 0) >= 3) {
      errorsByCouncil[code].failed += 1;
    }
  }

  let checkedCouncils = 0;
  let degradedCount = 0;

  for (const [code, stats] of Object.entries(errorsByCouncil)) {
    if (code === "unknown") continue;
    checkedCouncils++;

    const failureRate = stats.total > 0 ? stats.failed / stats.total : 0;
    const shouldDegrade = stats.failed >= 2 && failureRate >= 0.5;

    const councilRef = db.collection("councils").doc(code);
    const councilDoc = await councilRef.get();

    if (councilDoc.exists) {
      const currentStatus = councilDoc.data()?.status || "operational";
      const newStatus = shouldDegrade ? "degraded" : "operational";

      if (currentStatus !== newStatus) {
        await councilRef.update({
          status: newStatus,
          failureRate24h: failureRate,
          lastWatchdogCheck: new Date().toISOString()
        });
      }

      if (shouldDegrade) {
        degradedCount++;
      }
    }
  }

  return { checkedCouncils, degradedCount };
}
