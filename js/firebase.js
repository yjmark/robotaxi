// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Import the functions you need from the SDKs you need

const firebaseConfig = {
  apiKey: "AIzaSyDS4ZwqzF2ggAwc2SpjoD-6uCm7nUPjW-U",
  authDomain: "robotaxi-incidents-mgmt-sys.firebaseapp.com",
  projectId: "robotaxi-incidents-mgmt-sys",
  storageBucket: "robotaxi-incidents-mgmt-sys.firebasestorage.app",
  messagingSenderId: "445202107963",
  appId: "1:445202107963:web:810e42add1ed116c30561e",
  measurementId: "G-H1M73GPZ8H"

};

// Initialize Firebase  
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc };