// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcVTbmbtsgEniwJPucd_G5JhMfN9FhsVo",
  authDomain: "grupos-cordon.firebaseapp.com",
  projectId: "grupos-cordon",
  storageBucket: "grupos-cordon.firebasestorage.app",
  messagingSenderId: "945014026343",
  appId: "1:945014026343:web:8acbca389b0abc62d024c2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Inicializar Firestore
export const db = getFirestore(app);
