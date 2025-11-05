// src/services/auth/logout.ts
import { getAuth, signOut } from "firebase/auth";

export const logoutUser = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    localStorage.removeItem("user"); // limpia la sesión guardada
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};
