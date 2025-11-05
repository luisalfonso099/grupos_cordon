import { useState, useEffect, useRef } from "react";
import "tabulator-tables/dist/css/tabulator.min.css";
// import { ReactTabulator } from "react-tabulator";
// import { TabulatorFull as Tabulator, type CellComponent, type ColumnDefinition } from "tabulator-tables";

import { ReactTabulator } from "react-tabulator";
import { TabulatorFull as Tabulator, type CellComponent } from "tabulator-tables";
// import dataJSON from '../data/personas.json'
import { createPersona, deletePersona, fetchPersonas, updatePersona } from "../services/Firebase";
import Swal from "sweetalert2";
import type { IPersona, IPrivilegio } from "../types/dataTypes";

const DataTable = () => {

  // const [table, setTable] = useState<Tabulator | null>(null);
  const [tableRefObj, setTableRefObj] = useState<React.RefObject<Tabulator> | null>(null);
  //  const tableRef = useRef<Tabulator | null>(null);
  const modifiedRowsRef = useRef<Set<string>>(new Set());
  const [data, setData] = useState<IPersona[]>([]);
  const PRIVILEGIOS_OPTIONS = [
    "Precursor Regular",
    "Precursor Especial",
    "Anciano",
    "Ministerial",
  ];


  const PRIVILEGIOS_COLORS: Record<IPrivilegio, string> = {
    "Precursor Regular": "#4caf50",
    "Precursor Especial": "#2196f3",
    "Anciano": "#ff9800",
    "Ministerial": "#9c27b0",
  };

  useEffect(() => {
    const loadData = async () => {
      const personas: IPersona[] = await fetchPersonas();
      setData(personas);
    };
    loadData();
  }, []);

  const privilegiosFormatter = ( cell: CellComponent): string | undefined => {
    const values = (cell.getValue() || "")
      .toString()
      .split(",")
      .map((v: string) => v.trim())
      .filter(Boolean);

    return values
      .map((val: IPrivilegio) => {
        const color = PRIVILEGIOS_COLORS[val] || "#999";
        return `<span style="
        background:${color};
        color:white;
        padding:3px 8px;
        border-radius:10px;
        margin-right:4px;
        display:inline-block;
        font-size:12px;
      ">${val}</span>`;
      })
      .join(" ");
  };


  const handleAddRow = () => {
    if (tableRefObj) {
      tableRefObj.current.addRow({
        grupo: "0",
        privilegios: "",
        condicion: "pendiente",
        nombre: "",
        direccion: ""
      }, true) // false = agregar al final
        .then(() => console.log("Fila agregada"))
        .catch((err: string) => console.error("Error al agregar fila:", err));
    }
  };


  const columns: any[] = [
    {
      title: "Grupo",
      field: "grupo",
      editor: "number",
      validator: ["required", "integer"],
      editorParams: { min: 0, step: 1 },
      width: 100,
      cssClass: 'text-center',
      headerFilter: "input",
      headerFilterPlaceholder: "Filtrar Grupos...",
      headerFilterFunc: "like",

    },
    {
      title: "Nombre",
      field: "nombre",
      editor: "input",
      headerFilter: "input",
      headerFilterPlaceholder: "Filtrar Nombre...",
      headerFilterFunc: "like",
    },
    {
      title: "Privilegios",
      field: "privilegios",
      formatter: privilegiosFormatter,
      editor: "list",
      editorParams: {
        values: PRIVILEGIOS_OPTIONS,
        multiselect: true,
        clearable: true,
      },
      mutatorEdit: (value: string) => Array.isArray(value) ? value.join(", ") : value,

      headerFilter: "select",
      headerFilterPlaceholder: "Filtrar Privilegios...",
      headerFilterParams: {
        values: PRIVILEGIOS_OPTIONS.reduce((acc, p) => ({ ...acc, [p]: p }), {}),
      },
    },
    { title: "Dirección", field: "direccion", editor: "input" },
    {
      title: "Condición",
      field: "condicion",
      editor: "input",
    },
    { title: "Lat", field: "lat", editor: "input" },
    { title: "Lon", field: "lon", editor: "input" },
    {
      title: "Acciones",
      field: "acciones",
      formatter: () => {
        return "<button class=' cursor-pointer p-1 w-full bg-[#4A6DA7] hover:bg-[#5575a8] text-white'>Eliminar</button>";
      },
      width: 100,

      cellClick: async (e: UIEvent, cell: CellComponent) => {
        console.log('CELDA,', cell);

        const rowData = cell.getRow().getData();

        const result = await Swal.fire({
          title: `¿Eliminar a ${rowData.nombre}?`,
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e3342f",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          background: "#fff",
        });

        if (result.isConfirmed) {
          try {
            await deletePersona(rowData.id);
            cell.getRow().delete(); // Elimina visualmente la fila

            Swal.fire({
              title: "Eliminado",
              text: `${rowData.nombre} fue eliminado correctamente.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (err) {
            console.error("Error al eliminar persona:", err);
            Swal.fire({
              title: "Error",
              text: "Ocurrió un error al eliminar la persona.",
              icon: "error",
              confirmButtonText: "Cerrar",
            });
          }
        }
      }

    }
  ];

  const handleSaveChanges = async () => {
    if (!tableRefObj) {
      return Swal.fire({
        icon: "error",
        title: "Tabla no inicializada",
        text: "Por favor, recarga la página o intenta más tarde",
      });
    }

    const allRows = tableRefObj.current.getData() as IPersona[];;
    const ids = Array.from(modifiedRowsRef.current);

    // Detectamos filas nuevas (sin ID)
    const newRows = allRows.filter((r) => !r.id);

    // Filas modificadas existentes
    const rowsToUpdate = allRows.filter((r) => r.id && ids.includes(String(r.id)));

    if (rowsToUpdate.length === 0 && newRows.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No hay cambios para guardar",
      });
    }

    Swal.fire({
      title: 'Guardando cambios...',
      text: 'Por favor, espera un momento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let count = 0;

    // 🔹 Guardar nuevas filas en Firebase
    for (const row of newRows) {
      try {
        const newId = await createPersona({
          nombre: row.nombre || '',
          direccion: row.direccion || '',
          grupo: Number(row.grupo) || 1,
          condicion: row.condicion || '',
          privilegios: row.privilegios?.toString().split(",").map((v: string) => v.trim()) ?? [],
          lat: row.lat || '',
          lon: row.lon || ''
        });

        // Actualizar la fila en la tabla con el nuevo ID
        // const tabRow = tableRefObj.current.getRow(row);
        const tabRow = tableRefObj.current.getRows().find(r => r.getData() === row);
        if (tabRow) {
          tabRow.update({ id: newId });
        }

        count++;
      } catch (err) {
        console.error("Error creando persona:", err);
      }
    }

    // 🔹 Actualizar filas existentes
    for (const row of rowsToUpdate) {
      try {
        await updatePersona({
          id: row.id,
          nombre: row.nombre,
          direccion: row.direccion,
          grupo: Number(row.grupo),
          condicion: row.condicion,
          privilegios: row.privilegios?.toString().split(",").map((v: string) => v.trim()) ?? [],
          lat: row.lat,
          lon: row.lon
        });
        count++;
      } catch (err) {
        console.error("Error actualizando fila", row.id, err);
      }
    }

    modifiedRowsRef.current.clear();

    Swal.fire({
      icon: "success",
      title: "✅ Cambios guardados",
      text: `Se guardaron ${count} fila(s)`,
      timer: 2500,
      showConfirmButton: false,
    });
  };


  // Eventos pasados a ReactTabulator
  const events = {
    // cellEdited recibe el objeto CellComponent de Tabulator
    cellEdited: (cell: CellComponent) => {
      try {
        const rowData = cell.getRow().getData();
        // Si no hay id (fila nueva), podrías decidir crearla o saltarla
        if (rowData?.id) {
          modifiedRowsRef.current.add(String(rowData.id));
        }
      } catch (err) {
        console.warn("Error en cellEdited:", err);
      }
    },


  };

  // const handleSaveAll = async () => {
  //   if (!table) return;

  //   // Obtener datos actuales de la tabla
  //   // const rows = table.getData();

  //   // Convertir a tu tipo Persona
  //   const personas = dataJSON.map((r) => ({
  //     // id: crypto.randomUUID(),
  //     nombre: r.nombre,
  //     direccion: r.direccion,
  //     grupo: Number(r.grupo),
  //     condicion: r.condicion,
  //     lat: r.lat,
  //     lon: r.lon,
  //     privilegios: r.privilegios?.split(",").map((v: string) => v.trim()),
  //   }));

  //   await saveAllPersonas(personas);

  //   alert("✅ La tabla completa fue guardada en Firestore");
  // };


  return (
    <div className="p-2">
      <button onClick={handleSaveChanges} className="bg-[#4A6DA7] text-white p-2 cursor-pointer font-medium">
        Guardar tabla
      </button>
      <button onClick={handleAddRow} className="bg-[#4A6DA7] text-white p-2 cursor-pointer font-medium ml-2 mt-2">Agregar fila</button>

      <ReactTabulator
        events={events}
        data={data}
        columns={columns}
        layout="fitColumns"
        onRef={(ref) => setTableRefObj(ref)}
      />
    </div>
  );
};

export default DataTable;
