import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8jD4dnuPK39wD-drr7pNU_3DRwCwiv3M",
  authDomain: "skoipt-chat.firebaseapp.com",
  projectId: "skoipt-chat",
  storageBucket: "skoipt-chat.appspot.com",
  messagingSenderId: "327706669995",
  appId: "1:327706669995:web:240a135b8ed11d993798ee",
  measurementId: "G-MJ705K8D47"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics не поддерживается в десктопном приложении');
}

export { app, analytics, db, storage }; 