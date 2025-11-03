import { Popup } from "react-leaflet";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

interface Persona {
  id?: string;
  nombre: string;
  direccion: string;
  grupo: number;
  condicion: string;
  privilegios: string[];
  lat: number | null;
  lon: number | null;
}

interface PersonaPopupProps {
  group: Persona[];
}

export function PersonaPopup({ group }: PersonaPopupProps) {
  // 🔹 Maneja el cambio de grupo con confirmación y guardado
  const handleCambiarGrupo = async (persona: Persona) => {
    const { value: nuevoGrupo } = await Swal.fire({
      title: `Cambiar grupo de ${persona.nombre || "persona"}`,
      input: "select",
      inputOptions: {
        1: "Grupo 1",
        2: "Grupo 2",
        3: "Grupo 3",
        4: "Grupo 4",
        5: "Grupo 5",
        6: "Grupo 6",
      },
      inputValue: persona.grupo ?? 1,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });

    if (!nuevoGrupo || !persona.id) return;

    try {
      await updateDoc(doc(db, "personas", persona.id), {
        grupo: Number(nuevoGrupo),
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Grupo cambiado a ${nuevoGrupo}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el grupo. Intenta nuevamente.",
      });
    }
  };

  return (
    <Popup>
      <div style={{ minWidth: 220 }}>
        <strong>Personas en esta ubicación</strong>
        <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
          {group.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: 10,
                borderBottom: "1px solid #ddd",
                paddingBottom: 6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{p.nombre || "(sin nombre)"}</div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Grupo: {p.grupo ?? "-"} — {p.direccion ?? ""}
              </div>
              <div style={{ fontSize: 11, color: "#777" }}>
                Privilegios: {p.privilegios?.join(", ") || "Ninguno"}
              </div>
              {/* 👇 Botón para cambiar grupo */}
              <button
                onClick={() => handleCambiarGrupo(p)}
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  padding: "3px 6px",
                  border: "1px solid #999",
                  borderRadius: 4,
                  background: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                Cambiar grupo
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Popup>
  );
}
