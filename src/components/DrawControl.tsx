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
    "#E63946", // grupo 1 - rojo intenso
    "#457B9D", // grupo 2 - azul fuerte
    "#F1FA3C", // grupo 3 - amarillo brillante
    "#2A9D8F", // grupo 4 - verde azulado
    "#FF9F1C", // grupo 5 - naranja vivo
    "#6A4C93", // grupo 6 - morado profundo
];


type DibujableLayer = L.Path & {
    options: L.PathOptions & { grupo?: number };
    toGeoJSON: () => GeoJSON.GeometryObject;
};

export const DrawControl = () => {
    const map = useMap();
    const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
    const grupoALayerRef = useRef<Map<number, L.Layer>>(new Map());
    let modoBorradoActivo = false;

    useEffect(() => {

        const drawnItems = drawnItemsRef.current;
        const grupoALayer = grupoALayerRef.current;
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: {
                rectangle: false,
                circle: false,
                marker: false,
                polyline: false,
            },
        });
        map.addControl(drawControl);

        const cargarPoligonos = async () => {
            const snapshot = await getDocs(collection(db, "poligonos"));

            // Evita cargar duplicados si ya hay capas
            if (drawnItems.getLayers().length > 0) return;

            drawnItems.clearLayers();
            grupoALayer.clear();

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (!data.geojson) return;

                const geojson = JSON.parse(data.geojson);

                // ✅ Tipamos correctamente el resultado
                const capa = L.geoJSON(geojson, {
                    style: {
                        color: coloresPorGrupo[data.grupo - 1],
                        fillColor: coloresPorGrupo[data.grupo - 1],
                        fillOpacity: 0.5,
                    },
                }).getLayers()[0] as DibujableLayer;

                capa.options.grupo = data.grupo;
                drawnItems.addLayer(capa);
                grupoALayer.set(data.grupo, capa);
                agregarEventoCambioGrupo(capa);
            });
        };




        // Detectar inicio de modo borrar
        map.on(L.Draw.Event.DELETESTART, () => {
            console.log('holaa');

            modoBorradoActivo = true;
        });

        // Detectar salida del modo borrar
        map.on(L.Draw.Event.DELETESTOP, () => {
            modoBorradoActivo = false;
        });


        // 🧩 Crear polígono
        map.on(L.Draw.Event.CREATED, async (e) => {
            const event = e as L.LeafletEvent & { layer: DibujableLayer };
            const layer = event.layer;
            const layers = drawnItems.getLayers() as DibujableLayer[];
            const grupoALayer = grupoALayerRef.current;

            if (layers.length >= 6) {
                await Swal.fire({
                    icon: "warning",
                    title: "Límite alcanzado",
                    text: "Solo puedes tener hasta 6 grupos en el mapa.",
                });
                return;
            }

            // ✅ Tipado correcto: ya no usamos "any"
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
            const color = coloresPorGrupo[num - 1];

            // Si el grupo ya existe, borrar viejo
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

            await setDoc(doc(db, "poligonos", `grupo${num}`), {
                grupo: num,
                geojson: JSON.stringify(layer.toGeoJSON()),
            });

            await Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: `Polígono agregado al grupo ${num}`,
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        });




        // ✏️ Editar
        map.on(L.Draw.Event.EDITED, async () => {
            const layers = drawnItems.getLayers() as Array<
                L.Path & {
                    options: L.PathOptions & { grupo?: number };
                    toGeoJSON: () => GeoJSON.GeometryObject;
                }
            >;

            for (const layer of layers) {
                const grupo = layer.options.grupo;
                if (!grupo) continue;

                const geojson = layer.toGeoJSON();
                await setDoc(doc(db, "poligonos", `grupo${grupo}`), {
                    grupo,
                    geojson: JSON.stringify(geojson),
                });
            }

            await Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Cambios guardados",
                timer: 1000,
                showConfirmButton: false,
            });
        });



        // 🗑️ Eliminar
        map.on(L.Draw.Event.DELETED, async (e) => {
            // Verificamos en tiempo de ejecución que e tenga "layers"
            if (!("layers" in e)) return;

            const layers = (e.layers as L.LayerGroup).getLayers() as L.Layer[];
            const grupoALayer = grupoALayerRef.current;

            for (const layer of layers) {
                const vectorLayer = layer as L.Path & { options: L.PathOptions & { grupo?: number } };
                const grupo = vectorLayer.options.grupo;

                if (grupo) {
                    drawnItems.removeLayer(vectorLayer);
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
        });



        // 🔁 Cambio de grupo

        const agregarEventoCambioGrupo = (layer: L.Path & { options: L.PathOptions & { grupo?: number }; toGeoJSON: () => GeoJSON.Feature; }) => {
            layer.on("click", async () => {

                console.log('modoBorradoActivo', modoBorradoActivo);


                if (modoBorradoActivo) return;

                const grupoAnterior = layer.options.grupo;
                const grupoALayer = grupoALayerRef.current;

                const opciones: Record<number, string> = {};
                for (let i = 1; i <= 6; i++) {
                    opciones[i] = `Grupo ${i}`;
                }

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

                    await deleteDoc(doc(db, "poligonos", `grupo${grupoAnterior}`));
                    await setDoc(doc(db, "poligonos", `grupo${num}`), {
                        grupo: num,
                        geojson: JSON.stringify(layer.toGeoJSON()),
                    });

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


        // 🚀 Cargar al inicio
        cargarPoligonos();

        return () => {
            map.removeControl(drawControl);
            map.off(); // limpia listeners duplicados
        };
    }, [map]);

    return (
        <>
        </>
    );
};
