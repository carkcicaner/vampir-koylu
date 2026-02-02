import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBG9_-ZXIjUlWYFM-S-Txru7t91JaZj-Nk",
  authDomain: "vampir-koylu-oyunu-deee0.firebaseapp.com",
  projectId: "vampir-koylu-oyunu-deee0",
  storageBucket: "vampir-koylu-oyunu-deee0.firebasestorage.app",
  messagingSenderId: "34796279966",
  appId: "1:34796279966:web:2b0f9c60a685398804038f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_ID = 'vampir-koylu-production';