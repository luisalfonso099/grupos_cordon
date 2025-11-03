import { MapContainer, TileLayer, Marker, Polygon, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../utils/firebase";
import { DrawControl } from "./DrawControl";
import { FiltrosPanel } from "./FiltrosPanel";
import { crearDivIcon } from "../utils/mapIcons";
import { PersonaPopup } from "./PersonaPopup";
import territorios from "../data/territorios.json";

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

interface Territorio {
  number: string;
  coords: [number, number][];
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
  const [mostrarPersonas, setMostrarPersonas] = useState(false);
  const [mostrarTerritorios, setMostrarTerritorios] = useState(false);
  const [mostrarPoligonos, setMostrarPoligonos] = useState(true);

  // ✅ Personas en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "personas"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lat: toNumberSafe(doc.data().lat),
        lon: toNumberSafe(doc.data().lon),
      })) as Persona[];
      setPersonas(data);
    });
    return () => unsub();
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
    setMostrarPersonas(false);
    setMostrarTerritorios(false);
    setMostrarPoligonos(false);
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
      <FiltrosPanel
        coloresPorGrupo={coloresPorGrupo}
        filtrosPriv={filtrosPriv}
        filtrosGrupos={filtrosGrupos}
        mostrarPersonas={mostrarPersonas}
        mostrarTerritorios={mostrarTerritorios}
        mostrarPoligonos={mostrarPoligonos}
        onPrivChange={handlePrivChange}
        onGrupoChange={handleGrupoChange}
        onClear={handleClear}
        onToggleMostrar={() => setMostrarPersonas((prev) => !prev)}
        onToggleTerritorios={() => setMostrarTerritorios((prev) => !prev)}
        onTogglePoligonos={() => setMostrarPoligonos((prev) => !prev)}
      />

      <MapContainer
        center={[-34.9011, -56.1645]}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔹 Control de dibujo: carga, edita, borra y sincroniza grupos */}
        <DrawControl mostrarPoligonos={mostrarPoligonos}/>

        {/* 🔹 Territorios fijos */}
        {mostrarTerritorios &&
          (territorios as Territorio[]).map((t) => (
            <Polygon
              key={t.number}
              positions={t.coords.map(([lat, lon]) => [lat, lon])}
              pathOptions={{
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                weight: 2,
                fillOpacity: 0.2,
              }}
            >
              <Tooltip direction="center" permanent>
                <span style={{ fontWeight: "bold" }}>T{t.number}</span>
              </Tooltip>
            </Polygon>
          ))}

        {/* 🔹 Personas */}
        {mostrarPersonas &&
          Object.entries(groupedByLocation).map(([key, group]) => {
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
