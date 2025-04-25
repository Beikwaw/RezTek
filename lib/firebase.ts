import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAnalytics, type Analytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAau-q-AsLsUfNYzCfHBiS6e8ID6rPZC7c",
  authDomain: "reztek-d495e.firebaseapp.com",
  projectId: "reztek-d495e",
  storageBucket: "reztek-d495e.firebasestorage.app",
  messagingSenderId: "736617227293",
  appId: "1:736617227293:web:2cbca69f51b47d2c3052f4",
  measurementId: "G-G5GHL19DSH"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

try {
  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Only initialize analytics on the client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase services:", error);
  throw new Error("Failed to initialize Firebase");
}

export { app, auth, db, storage, analytics }
