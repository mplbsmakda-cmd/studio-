
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBe1iZwxmisVwz1rbPNDLzcl2O6T8FFe_k",
  authDomain: "cekk-e8f78.firebaseapp.com",
  projectId: "cekk-e8f78",
  storageBucket: "cekk-e8f78.firebasestorage.app",
  messagingSenderId: "412015477600",
  appId: "1:412015477600:web:79d62f3025643c1d111405",
  measurementId: "G-MTN4S7C1N0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
