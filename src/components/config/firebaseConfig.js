// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAE1vS2I2tPKugaRaAq0gmHg7l_z18jvus",
  authDomain: "iof-lmsystem.firebaseapp.com",
  databaseURL: "https://iof-lmsystem-default-rtdb.firebaseio.com",
  projectId: "iof-lmsystem",
  storageBucket: "iof-lmsystem.appspot.com",
  messagingSenderId: "7245205684",
  appId: "1:7245205684:web:03a1d642061654659d87e1",
  measurementId: "G-95JFSRJGGN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export instances
export { db, auth, storage };