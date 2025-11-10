import { useState, useEffect, useRef } from "react";
import "tabulator-tables/dist/css/tabulator.min.css";
import { ReactTabulator } from "react-tabulator";
import { TabulatorFull as Tabulator, type CellComponent } from "tabulator-tables";
import { createPersona, deletePersona, fetchPersonas, updatePersona } from "../services/Firebase";
import Swal from "sweetalert2";
import type { IPersona, IPrivilegio } from "../types/dataTypes";
import * as XLSX from "xlsx";   // ✅ Importar XLSX
(window as any).XLSX = XLSX;    // ✅ Registrar globalmente

const DataTable = () => {
  const [tableRefObj, setTableRefObj] = useState<React.RefObject<Tabulator> | null>(null);
  const modifiedRowsRef = useRef<Set<string>>(new Set());
  const [data, setData] = useState<IPersona[]>([]);
  const [mostrarCoordenadas, setMostrarCoordenadas] = useState(false);

  const PRIVILEGIOS_OPTIONS = ["Precursor Regular", "Precursor Especial", "Anciano", "Ministerial"];
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

  const privilegiosFormatter = (cell: CellComponent): string | undefined => {
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
      tableRefObj.current
        .addRow(
          {
            grupo: "0",
            privilegios: "",
            condicion: "pendiente",
            nombre: "",
            direccion: "",
          },
          true
        )
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
      cssClass: "text-center",
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
      mutatorEdit: (value: string) => (Array.isArray(value) ? value.join(", ") : value),
      headerFilter: "select",
      headerFilterPlaceholder: "Filtrar Privilegios...",
      headerFilterParams: {
        values: PRIVILEGIOS_OPTIONS.reduce((acc, p) => ({ ...acc, [p]: p }), {}),
      },
    },
    { title: "Dirección", field: "direccion", editor: "input" },
    { title: "Condición", field: "condicion", editor: "input" },
    { title: "Lat", field: "lat", editor: "input", visible: mostrarCoordenadas }, // 👈 controlado
    { title: "Lon", field: "lon", editor: "input", visible: mostrarCoordenadas }, // 👈 controlado
    {
      title: "Acciones",
      field: "acciones",
      cssClass: "text-center",
      formatter: () => {
        return `<button class='text-center cursor-pointer p-1  bg-[#FDE8E8] hover:bg-[#FF0000] border-[#FF0000] border-2 rounded-md hover:text-amber-50 text-[#ff0000] transition-colors'>
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
         </button>`;
      },
      width: 100,
      cellClick: async (_: UIEvent, cell: CellComponent) => {
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
        });

        if (result.isConfirmed) {
          try {
            await deletePersona(rowData.id);
            cell.getRow().delete();
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
      },
    },
  ];

  // 🔹 Alternar visibilidad de columnas Lat/Lon y reajustar el ancho
  const toggleCoordenadas = () => {
    if (tableRefObj?.current) {
      const table = tableRefObj.current;
      const cols = ["lat", "lon"];
      cols.forEach((col) => {
        const column = table.getColumn(col);
        if (column) {
          if (mostrarCoordenadas) column.hide();
          else column.show();
        }
      });

      // 👇 Redibujar para que ajuste los anchos de las columnas visibles
      table.redraw(true);
    }

    setMostrarCoordenadas((prev) => !prev);
  };

  const handleSaveChanges = async () => {
    if (!tableRefObj) {
      return Swal.fire({
        icon: "error",
        title: "Tabla no inicializada",
        text: "Por favor, recarga la página o intenta más tarde",
      });
    }

    const allRows = tableRefObj.current.getData() as IPersona[];
    const ids = Array.from(modifiedRowsRef.current);

    const newRows = allRows.filter((r) => !r.id);
    const rowsToUpdate = allRows.filter((r) => r.id && ids.includes(String(r.id)));

    if (rowsToUpdate.length === 0 && newRows.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No hay cambios para guardar",
      });
    }

    Swal.fire({
      title: "Guardando cambios...",
      text: "Por favor, espera un momento",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let count = 0;

    // Guardar nuevas filas
    for (const row of newRows) {
      try {
        const newId = await createPersona({
          nombre: row.nombre || "",
          direccion: row.direccion || "",
          grupo: Number(row.grupo) || 1,
          condicion: row.condicion || "",
          privilegios:
            row.privilegios?.toString().split(",").map((v: string) => v.trim()) ?? [],
          lat: row.lat || "",
          lon: row.lon || "",
        });

        const tabRow = tableRefObj.current.getRows().find((r) => r.getData() === row);
        if (tabRow) tabRow.update({ id: newId });
        count++;
      } catch (err) {
        console.error("Error creando persona:", err);
      }
    }

    // Actualizar filas existentes
    for (const row of rowsToUpdate) {
      try {
        await updatePersona({
          id: row.id,
          nombre: row.nombre,
          direccion: row.direccion,
          grupo: Number(row.grupo),
          condicion: row.condicion,
          privilegios:
            row.privilegios?.toString().split(",").map((v: string) => v.trim()) ?? [],
          lat: row.lat,
          lon: row.lon,
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

  const events = {
    cellEdited: (cell: CellComponent) => {
      try {
        const rowData = cell.getRow().getData();
        if (rowData?.id) {
          modifiedRowsRef.current.add(String(rowData.id));
        }
      } catch (err) {
        console.warn("Error en cellEdited:", err);
      }
    },
  };

  const handleExportExcel = () => {
    if (tableRefObj?.current) {
      tableRefObj.current.download("xlsx", "personas.xlsx", {
        sheetName: "Personas",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Tabla no disponible",
        text: "No se pudo exportar los datos. Intenta recargar la página.",
      });
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={handleSaveChanges}
          className="bg-[#4A6DA7] text-white p-2 cursor-pointer font-medium"
        >
          Guardar tabla
        </button>
        <button
          onClick={handleAddRow}
          className="bg-[#4A6DA7] text-white p-2 cursor-pointer font-medium"
        >
          Agregar fila
        </button>
        <button
          onClick={toggleCoordenadas}
          className="bg-gray-600 text-white p-2 cursor-pointer font-medium"
        >
          {mostrarCoordenadas ? "Ocultar Lat/Lon" : "Mostrar Lat/Lon"}
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white p-2 cursor-pointer font-medium"
        >
          Exportar Excel
        </button>
      </div>

      {/* 👇 Envolvemos la tabla en un contenedor desplazable */}
      <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm mt-2">
        <ReactTabulator
          events={events}
          data={data}
          columns={columns}
          layout="fitColumns"
          onRef={(ref) => setTableRefObj(ref)}
          className="min-w-[700px]" // 👈 evita que las columnas se aplasten demasiado
        />
      </div>
    </div>
  );

};

export default DataTable;
