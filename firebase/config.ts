import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBF1tsmjaqEjMuLt0S-jUD-3C7hfMypy8",
  authDomain: "el-wekala-62a22.firebaseapp.com",
  projectId: "el-wekala-62a22",
  storageBucket: "el-wekala-62a22.firebasestorage.app",
  messagingSenderId: "1066414336379",
  appId: "1:1066414336379:web:5ea9660e3d975bf156b5de",
  measurementId: "G-0MH73LX15V"
};

// Initialize Firebase securely for Next.js to prevent multiple initializations
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };