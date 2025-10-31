import L from "leaflet";

export const coloresPorGrupo = [
  "#E63946",
  "#457B9D",
  "#F1FA3C",
  "#2A9D8F",
  "#FF9F1C",
  "#6A4C93",
];

interface IconOptions {
  grupo?: number;
  privilegios?: string[];
}

/**
 * Genera un ícono de Leaflet con color y emoji según privilegios y grupo.
 */
export function crearDivIcon({ grupo, privilegios = [] }: IconOptions): L.DivIcon {
  const color = coloresPorGrupo[(Number(grupo) || 1) - 1] || "#000";
  const roles = privilegios.map((p) => p.toLowerCase());

  const iconos = {
    anciano: "👨🏼‍🦳",
    ministerial: "👨🏽‍💼",
    regular: "👣",
  };

  let emoji = null;
  if (roles.includes("anciano")) emoji = iconos.anciano;
  else if (roles.includes("ministerial")) emoji = iconos.ministerial;
  else if (roles.includes("precursor regular")) emoji = iconos.regular;

  const borderColor = emoji ? "black" : "white";

  return L.divIcon({
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        ${emoji
          ? `<div style="
              position:absolute;
              top:-14px;
              left:50%;
              transform:translateX(-50%);
              font-size:18px;
              text-shadow:0 0 4px rgba(255,255,255,0.8);
            ">${emoji}</div>`
          : ""}
        <div style="
          background-color:${color};
          width:18px;
          height:18px;
          border-radius:50%;
          border: 2px solid ${borderColor};
          box-shadow:0 0 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    className: "",
    iconSize: [26, 26],
  });
}
