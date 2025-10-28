import { useEffect, useRef } from "react";
import { MyGridL } from "../grid/grid";

const DataTable = () => {

  const data = [
    {
      grupo: "Administradores",
      Privilegios: "Full Access",
      Condicion: ["activo", "verificado"],
      nombre: "Juan Pérez",
      direccion: "Av. Siempre Viva 123"
    },
    {
      grupo: "Soporte",
      Privilegios: "Lectura, Escritura",
      Condicion: ["pendiente"],
      nombre: "María Gómez",
      direccion: "Calle Falsa 456"
    },
    {
      grupo: "Ventas",
      Privilegios: "Acceso limitado",
      Condicion: ["activo", "pendiente"],
      nombre: "Carlos Sánchez",
      direccion: "Boulevard del Sol 789"
    },
    {
      grupo: "Desarrolladores",
      Privilegios: "Full Access",
      Condicion: ["activo"],
      nombre: "Lucía Fernández",
      direccion: "Ruta 8 km 45"
    },
    {
      grupo: "Recursos Humanos",
      Privilegios: "Solo lectura",
      Condicion: ["inactivo"],
      nombre: "Sofía Martínez",
      direccion: "Av. Central 202"
    }
  ];

  const gridRef = useRef<HTMLDivElement>(null);

  const localGridRef = useRef<MyGridL | null>(null);
  console.log(localGridRef);

  const setSaveRequired = () => {
    console.log('hola');
    
  }

  useEffect(()=> {
    if(gridRef.current){
      localGridRef.current = new MyGridL(gridRef.current, data, setSaveRequired);
    }

    return () => {
      localGridRef.current?.destroy();
      localGridRef.current = null;
    };

  },[])


  
  return (
    <div className="relative">
      <div ref={gridRef}/>
    </div>
  )
}

export default DataTable
