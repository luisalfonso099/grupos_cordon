// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  updateDoc,
  query, where,
  doc,
  deleteDoc,
  addDoc,
  setDoc,
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
  condicion: string;
  privilegios: string[];
}

// 📥 Obtener todas las personas
export const fetchPersonas = async (): Promise<Persona[]> => {
  const snapshot = await getDocs(collection(db, "personas"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Persona[];
};


export const updatePersona = async (data: Partial<Persona>): Promise<void> => {
  // 1️⃣ Crear query para buscar el documento
  const q = query(collection(db, "personas"), where("id", "==", data.id));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No se encontró la persona con ese id");
  }

  // 2️⃣ Tomar el primer documento (asumiendo que id es único)
  const docRef = doc(db, "personas", querySnapshot.docs[0].id);

  // 3️⃣ Actualizar
  await updateDoc(docRef, data);
};

export const saveAllPersonas = async (personas: Persona[]) => {
  const batch = writeBatch(db);

  // // 1️⃣ Obtener la colección actual y borrarla
  const snapshot = await getDocs(collection(db, "personas"));
  snapshot.forEach((docSnap) => batch.delete(docSnap.ref));

  // 2️⃣ Agregar todas las nuevas
  personas.forEach((p) => {
    const ref = doc(collection(db, "personas")); // genera ID
    p.id = ref.id; // 
    batch.set(ref, p);
  });

  // 3️⃣ Ejecutar
  await batch.commit();
};

export const deletePersona = async (id: string) => {
  const ref = doc(db, "personas", id);
  await deleteDoc(ref);
};

export const createPersona = async (persona: any) => {
  const personasCollection = collection(db, "personas");

  // Creamos un ID nuevo manualmente
  const newId = crypto.randomUUID(); // 🔹 genera un UUID único

  // Le asignamos el id también al objeto persona
  const personaConId = { ...persona, id: newId };

  // Creamos el documento con ese ID
  await setDoc(doc(personasCollection, newId), personaConId);

  return newId;
};

export { app };
