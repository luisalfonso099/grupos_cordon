import { Popup } from "react-leaflet";

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
  return (
    <Popup>
      <div style={{ minWidth: 200 }}>
        <strong>Personas en esta ubicación</strong>
        <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
          {group.map((p) => (
            <li key={p.id} style={{ marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>
                {p.nombre || "(sin nombre)"}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Grupo: {p.grupo ?? "-"} — {p.direccion ?? ""}
              </div>
              <div style={{ fontSize: 11, color: "#777" }}>
                Privilegios: {p.privilegios?.join(", ") || "Ninguno"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Popup>
  );
}
