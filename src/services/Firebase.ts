import type { IPersona } from "../types/dataTypes";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  writeBatch,
  updateDoc,
  query, where,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
// 📥 Obtener todas las personas
export const fetchPersonas = async (): Promise<IPersona[]> => {
  const snapshot = await getDocs(collection(db, "personas"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPersona[];
};

export const updatePersona = async (data: Partial<IPersona>): Promise<void> => {
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


export const saveAllPersonas = async (personas: IPersona[]) => {
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

export const createPersona = async (persona: IPersona) => {
  const personasCollection = collection(db, "personas");

  // Creamos un ID nuevo manualmente
  const newId = crypto.randomUUID(); // 🔹 genera un UUID único

  // Le asignamos el id también al objeto persona
  const personaConId = { ...persona, id: newId };

  // Creamos el documento con ese ID
  await setDoc(doc(personasCollection, newId), personaConId);

  return newId;
};