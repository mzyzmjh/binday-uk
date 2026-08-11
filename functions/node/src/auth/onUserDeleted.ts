import * as admin from "firebase-admin";

export async function deleteUserData(uid: string) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const userData = userSnap.data();
    const scheduleKey = userData?.scheduleKey;

    if (scheduleKey) {
      const scheduleRef = db.collection("schedules").doc(scheduleKey);
      const scheduleSnap = await scheduleRef.get();

      if (scheduleSnap.exists) {
        const currentSubscribers = scheduleSnap.data()?.subscribersCount || 1;
        if (currentSubscribers <= 1) {
          // If no other users are subscribed to this UPRN, clean up schedule
          await scheduleRef.delete();
        } else {
          await scheduleRef.update({
            subscribersCount: admin.firestore.FieldValue.increment(-1),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    // Hard delete user document from Firestore
    await userRef.delete();
  }

  // Also remove from Firebase Auth if still present
  try {
    await admin.auth().deleteUser(uid);
  } catch (err: any) {
    // If already deleted by client auth, ignore
    if (err.code !== "auth/user-not-found") {
      console.warn("Auth user deletion warning:", err);
    }
  }

  return { success: true, uid };
}
