import type { ColumnDefinition } from "react-tabulator";

export interface IPersona {
  id?: string;
  nombre: string;
  direccion: string;
  lat?: number | string;
  lon?: number | string;
  grupo?: number;
  condicion: string;
  privilegios: string[];
}

export type IPrivilegio =
  | "Precursor Regular"
  | "Precursor Especial"
  | "Anciano"
  | "Ministerial";


export  type PersonaColumn = ColumnDefinition & {
  field: keyof IPersona | "acciones";
   // agregás tus campos válidos
};