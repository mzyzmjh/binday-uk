import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";

const env: Record<string, string | undefined> = 
  typeof import.meta !== "undefined" && import.meta.env 
    ? (import.meta.env as Record<string, string | undefined>) 
    : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-binday-api-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "binday-uk.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "binday-uk",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "binday-uk.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const isConfigured = true;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);

  if (env.VITE_USE_FIREBASE_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Connected to Firebase Local Emulators.");
  }
} catch (e) {
  console.warn("Firebase initialized with local fallback adapter:", e);
}

export { app, auth, db, isConfigured };
