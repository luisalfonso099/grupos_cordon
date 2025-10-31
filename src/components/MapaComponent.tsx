import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { useEffect, useState } from "react";
import { fetchPersonas } from "../utils/firebase";
import { DrawControl } from "./DrawControl";
import { FiltrosPanel } from "./FiltrosPanel"; 
import { crearDivIcon } from "../utils/mapIcons";
import { PersonaPopup } from "./PersonaPopup";

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

const coloresPorGrupo = [
  "#E63946",
  "#457B9D",
  "#F1FA3C",
  "#2A9D8F",
  "#FF9F1C",
  "#6A4C93",
];

const toNumberSafe = (value: unknown): number | null => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export default function MapaComponent() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filtrosPriv, setFiltrosPriv] = useState<string[]>([]);
  const [filtrosGrupos, setFiltrosGrupos] = useState<number[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const data = await fetchPersonas();
      const normalized = (data ?? []).map((p) => ({
        ...p,
        lat: toNumberSafe(p.lat),
        lon: toNumberSafe(p.lon),
      })) as Persona[];
      setPersonas(normalized);
    };
    cargar();
  }, []);

  const handlePrivChange = (priv: string) =>
    setFiltrosPriv((prev) =>
      prev.includes(priv) ? prev.filter((p) => p !== priv) : [...prev, priv]
    );

  const handleGrupoChange = (num: number) =>
    setFiltrosGrupos((prev) =>
      prev.includes(num) ? prev.filter((g) => g !== num) : [...prev, num]
    );

  const handleClear = () => {
    setFiltrosPriv([]);
    setFiltrosGrupos([]);
  };

  const personasFiltradas = personas.filter((p) => {
    const matchPriv =
      filtrosPriv.length === 0 ||
      p.privilegios?.some((priv) =>
        filtrosPriv.some((f) => priv.toLowerCase().includes(f.toLowerCase()))
      );

    const matchGrupo =
      filtrosGrupos.length === 0 || filtrosGrupos.includes(Number(p.grupo));

    return matchPriv && matchGrupo;
  });

  const groupedByLocation: Record<string, Persona[]> = personasFiltradas.reduce(
    (acc, p) => {
      if (p.lat === null || p.lon === null) return acc;
      const key = `${p.lat},${p.lon}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, Persona[]>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* 🎛 Panel separado */}
      <FiltrosPanel
        coloresPorGrupo={coloresPorGrupo}
        filtrosPriv={filtrosPriv}
        filtrosGrupos={filtrosGrupos}
        onPrivChange={handlePrivChange}
        onGrupoChange={handleGrupoChange}
        onClear={handleClear}
      />

      <MapContainer
        center={[-34.9011, -56.1645]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DrawControl />

        {Object.entries(groupedByLocation).map(([key, group]) => {
          const [latStr, lonStr] = key.split(",");
          const lat = Number(latStr);
          const lon = Number(lonStr);
          const first = group[0];
          const grupoNum = first?.grupo ? Number(first.grupo) : 1;

          return (
            <Marker
              key={key}
              position={[lat, lon]}
              icon={crearDivIcon({
                grupo: grupoNum,
                privilegios: group.flatMap((p) => p.privilegios || []),
              })}
            >
              <PersonaPopup group={group} />
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
