// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4HShmapmrMV3LNa7Pas1mJsIzmuc4zuo",
  authDomain: "ceft-ebook-hub.firebaseapp.com",
  projectId: "ceft-ebook-hub",
  storageBucket: "ceft-ebook-hub.firebasestorage.app",
  messagingSenderId: "386541336715",
  appId: "1:386541336715:web:8a2263d6373f5557457c8e",
  measurementId: "G-QFW7JJPMZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
