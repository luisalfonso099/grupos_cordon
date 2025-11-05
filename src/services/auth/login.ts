// src/services/auth/login.ts
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const login = async (data: { email: string; password: string }) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const user = userCredential.user;

    // Guardar el UID o token en localStorage (para mantener sesión)
    localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email }));

    return user;
  } catch (error: any) {
    throw error;
  }
};
