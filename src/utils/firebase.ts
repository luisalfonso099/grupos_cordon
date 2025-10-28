// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

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

// 🧩 Tipos
export interface Persona {
  id?: string;
  nombre: string;
  direccion: string;
  lat?: number;
  lon?: number;
  grupo?: number;
}

// 📥 Obtener todas las personas
export const fetchPersonas = async (): Promise<Persona[]> => {
  const snapshot = await getDocs(collection(db, "personas"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Persona[];
};

// ➕ Agregar una nueva persona
export const addPersona = async (persona: Persona): Promise<void> => {
  await addDoc(collection(db, "personas"), persona);
};

// 🔄 Actualizar persona existente
export const updatePersona = async (
  id: string,
  data: Partial<Persona>
): Promise<void> => {
  const ref = doc(db, "personas", id);
  await updateDoc(ref, data);
};

export { app };
