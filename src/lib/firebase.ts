import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0",
  authDomain: "medo-app-c8e5e.firebaseapp.com",
  projectId: "medo-app-c8e5e",
  storageBucket: "medo-app-c8e5e.appspot.com",
  messagingSenderId: "36724395882",
  appId: "1:36724395882:web:9e6d6bc1fb6e51ec907439",
  measurementId: "G-907439e882"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
