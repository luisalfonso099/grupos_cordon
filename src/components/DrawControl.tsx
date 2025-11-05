import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { db } from "../utils/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

const coloresPorGrupo = [
  "#E63946",
  "#457B9D",
  "#F1FA3C",
  "#2A9D8F",
  "#FF9F1C",
  "#6A4C93",
];

type DibujableLayer = L.Path & {
  options: L.PathOptions & { grupo?: number };
  toGeoJSON: () => GeoJSON.GeometryObject;
};

export const DrawControl = ({ mostrarPoligonos = true }: { mostrarPoligonos?: boolean }) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const grupoALayerRef = useRef<Map<number, L.Layer>>(new Map());
  const modoBorradoActivoRef = useRef<boolean>(false);

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    const grupoALayer = grupoALayerRef.current;

    // Añadir el FeatureGroup al mapa (si no está)
    if (!map.hasLayer(drawnItems)) {
      drawnItems.addTo(map);
    }

    // Crear control draw
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false
      },
      position : "bottomright",
    });

    map.addControl(drawControl);

    // --- Función auxiliar para click de cambio de grupo ---
    const agregarEventoCambioGrupo = (layer: DibujableLayer) => {
      layer.off("click");
      layer.on("click", async () => {
        if (modoBorradoActivoRef.current) return;

        const grupoAnterior = layer.options.grupo;
        const opciones: Record<number, string> = {};
        for (let i = 1; i <= 6; i++) opciones[i] = `Grupo ${i}`;

        const { value: nuevoGrupo } = await Swal.fire({
          title: "Cambiar grupo",
          input: "select",
          inputOptions: opciones,
          inputValue: grupoAnterior,
          showCancelButton: true,
          confirmButtonText: "Cambiar",
          cancelButtonText: "Cancelar",
        });

        const num = Number(nuevoGrupo);
        if (!nuevoGrupo || isNaN(num)) return;

        if (num >= 1 && num <= 6 && num !== grupoAnterior) {
          const color = coloresPorGrupo[num - 1];

          if (grupoALayer.has(num)) {
            const viejo = grupoALayer.get(num)!;
            drawnItems.removeLayer(viejo);
            grupoALayer.delete(num);
            await deleteDoc(doc(db, "poligonos", `grupo${num}`));
          }

          layer.setStyle({ color, fillColor: color, fillOpacity: 0.5 });
          layer.options.grupo = num;
          grupoALayer.set(num, layer);

          if (grupoAnterior) {
            await deleteDoc(doc(db, "poligonos", `grupo${grupoAnterior}`));
          }
          await setDoc(doc(db, "poligonos", `grupo${num}`), {
            grupo: num,
            geojson: JSON.stringify(layer.toGeoJSON()),
          });

          // Actualizar tooltip
          const tt = layer.getTooltip?.();
          if (tt) {
            tt.setContent(`Grupo ${num}`);
          } else {
            layer.bindTooltip(`Grupo ${num}`, {
              permanent: false,
              direction: "center",
              className: "w-2",
            });
          }

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Grupo cambiado a ${num}`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
    };

    // --- Cargar polígonos desde Firestore ---
    const cargarPoligonos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "poligonos"));

        drawnItems.clearLayers();
        grupoALayer.clear();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data?.geojson) return;

          let geojson;
          try {
            geojson = JSON.parse(data.geojson);
          } catch (err) {
            console.warn("GeoJSON inválido en documento:", docSnap.id, err);
            return;
          }

          const capa = L.geoJSON(geojson, {
            style: {
              color: coloresPorGrupo[(data.grupo ?? 1) - 1] ?? "#333",
              fillColor: coloresPorGrupo[(data.grupo ?? 1) - 1] ?? "#333",
              fillOpacity: 0.5,
            },
          }).getLayers()[0] as DibujableLayer | undefined;

          if (!capa) return;

          capa.options.grupo = data.grupo;

          // Tooltip con el nombre del grupo
          capa.bindTooltip(`Grupo ${data.grupo}`, {
            permanent: true,
            direction: "center",
            className: "group-tooltip",
          });

          drawnItems.addLayer(capa);
          grupoALayer.set(data.grupo, capa);
          agregarEventoCambioGrupo(capa);
        });
      } catch (err) {
        console.error("Error cargando poligonos:", err);
      }
    };

    // --- Eventos de Leaflet Draw ---
    const onDeleteStart = () => (modoBorradoActivoRef.current = true);
    const onDeleteStop = () => (modoBorradoActivoRef.current = false);

    const onCreated = async (e: L.LeafletEvent & { layer?: L.Layer }) => {
      try {
        const layer = (e).layer as DibujableLayer | undefined;
        if (!layer) return;

        const layers = drawnItems.getLayers() as DibujableLayer[];
        if (layers.length >= 6) {
          await Swal.fire({
            icon: "warning",
            title: "Límite alcanzado",
            text: "Solo puedes tener hasta 6 grupos en el mapa.",
          });
          return;
        }

        const gruposOcupados = layers.map((l) => l.options.grupo);
        const gruposDisponibles: Record<number, string> = {};
        for (let i = 1; i <= 6; i++) {
          if (!gruposOcupados.includes(i)) gruposDisponibles[i] = `Grupo ${i}`;
        }

        const { value: grupoElegido } = await Swal.fire({
          title: "Elegir grupo para el nuevo polígono",
          input: "select",
          inputOptions: gruposDisponibles,
          inputPlaceholder: "Selecciona un grupo",
          showCancelButton: true,
          confirmButtonText: "Asignar",
          cancelButtonText: "Cancelar",
        });

        if (!grupoElegido) return;

        const num = Number(grupoElegido);
        if (isNaN(num)) return;
        const color = coloresPorGrupo[num - 1];

        if (grupoALayer.has(num)) {
          const viejo = grupoALayer.get(num)!;
          drawnItems.removeLayer(viejo);
          grupoALayer.delete(num);
          await deleteDoc(doc(db, "poligonos", `grupo${num}`));
        }

        layer.setStyle({ color, fillColor: color, fillOpacity: 0.5 });
        layer.options.grupo = num;
        drawnItems.addLayer(layer);
        grupoALayer.set(num, layer);
        agregarEventoCambioGrupo(layer);

        // Tooltip
        layer.bindTooltip(`Grupo ${num}`, {
          permanent: true,
          direction: "center",
          className: "group-tooltip",
        });

        await setDoc(doc(db, "poligonos", `grupo${num}`), {
          grupo: num,
          geojson: JSON.stringify(layer.toGeoJSON()),
        });

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Polígono agregado al grupo ${num}`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error en created handler:", err);
      }
    };

    const onEdited = async () => {
      try {
        const layers = drawnItems.getLayers() as DibujableLayer[];
        for (const layer of layers) {
          const grupo = layer.options.grupo;
          if (!grupo) continue;
          const geojson = layer.toGeoJSON();

          await setDoc(doc(db, "poligonos", `grupo${grupo}`), {
            grupo,
            geojson: JSON.stringify(geojson),
          });

          const tt = layer.getTooltip?.();
          if (tt) tt.setContent(`Grupo ${grupo}`);
          else
            layer.bindTooltip(`Grupo ${grupo}`, {
              permanent: true,
              direction: "center",
              className: "group-tooltip",
            });
        }

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Cambios guardados",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error en edited handler:", err);
      }
    };

    const onDeleted = async (e: L.LeafletEvent & { layers?: L.LayerGroup }) => {
      try {
        if (!e.layers) return;
        const layers = e.layers.getLayers() as DibujableLayer[];
        for (const layer of layers) {
          const grupo = layer.options.grupo;
          if (grupo) {
            drawnItems.removeLayer(layer);
            grupoALayer.delete(grupo);
            await deleteDoc(doc(db, "poligonos", `grupo${grupo}`));
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: `Polígono del grupo ${grupo} eliminado`,
              timer: 1500,
              showConfirmButton: false,
            });
          }
        }
      } catch (err) {
        console.error("Error en deleted handler:", err);
      }
    };

    // --- Registrar listeners ---
    map.on(L.Draw.Event.DELETESTART, onDeleteStart);
    map.on(L.Draw.Event.DELETESTOP, onDeleteStop);
    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    // --- Cargar al inicio ---
    cargarPoligonos();

    // --- Cleanup ---
    return () => {
      map.off(L.Draw.Event.DELETESTART, onDeleteStart);
      map.off(L.Draw.Event.DELETESTOP, onDeleteStop);
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(drawControl);
      if (map.hasLayer(drawnItems)) map.removeLayer(drawnItems);
    };
  }, [map]);

  // 🔹 Controlar visibilidad desde prop
  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    drawnItems.getLayers().forEach((layer) => {
      if (!(layer instanceof L.Polygon)) return;
      const path = (layer as L.Polygon).getElement() as SVGElement | null;
      if (path) path.style.display = mostrarPoligonos ? "" : "none";

      const tooltip = layer.getTooltip();
      if (tooltip && tooltip.getElement()) {
        tooltip.getElement()!.style.display = mostrarPoligonos ? "" : "none";
      }
    });
  }, [mostrarPoligonos]);

  return null;
};
