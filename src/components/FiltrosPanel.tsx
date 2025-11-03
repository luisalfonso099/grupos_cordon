import React from "react";

interface FiltrosPanelProps {
  coloresPorGrupo: string[];
  filtrosPriv: string[];
  filtrosGrupos: number[];
  mostrarPersonas: boolean;
  mostrarTerritorios: boolean;
  mostrarPoligonos: boolean; // 👈 nuevo
  onPrivChange: (priv: string) => void;
  onGrupoChange: (num: number) => void;
  onClear: () => void;
  onToggleMostrar: () => void;
  onToggleTerritorios: () => void;
  onTogglePoligonos: () => void; // 👈 nuevo callback
}

export const FiltrosPanel: React.FC<FiltrosPanelProps> = ({
  coloresPorGrupo,
  filtrosPriv,
  filtrosGrupos,
  mostrarPersonas,
  mostrarTerritorios,
  mostrarPoligonos,
  onPrivChange,
  onGrupoChange,
  onClear,
  onToggleMostrar,
  onToggleTerritorios,
  onTogglePoligonos,
}) => {
  const privilegios = [
    { label: "Anciano 👨🏼‍🦳", value: "anciano" },
    { label: "Ministerial 👨🏽‍💼", value: "ministerial" },
    { label: "Precursor Regular 👣", value: "precursor regular" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 10,
        zIndex: 1000,
        background: "white",
        padding: "10px 12px",
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        fontSize: 14,
        width: 200,
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Filtros</div>

      {/* 👁 Mostrar/Ocultar personas */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={mostrarPersonas}
          onChange={onToggleMostrar}
        />
        Mostrar personas
      </label>

      {/* 🗺 Mostrar/Ocultar territorios */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={mostrarTerritorios}
          onChange={onToggleTerritorios}
        />
        Mostrar territorios
      </label>

      {/* 🧩 Mostrar/Ocultar grupos (polígonos) */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={mostrarPoligonos}
          onChange={onTogglePoligonos}
        />
        Mostrar grupos
      </label>

      <hr style={{ margin: "10px 0" }} />

      {/* 🔸 Privilegios */}
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Privilegios</div>
      {privilegios.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <input
            type="checkbox"
            checked={filtrosPriv.includes(opt.value)}
            onChange={() => onPrivChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}

      <hr style={{ margin: "10px 0" }} />

      {/* 🔹 Grupos */}
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Grupos</div>

      {coloresPorGrupo.map((color, i) => {
        const grupoNum = i + 1;
        return (
          <label
            key={grupoNum}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <input
              type="checkbox"
              checked={filtrosGrupos.includes(grupoNum)}
              onChange={() => onGrupoChange(grupoNum)}
              style={{ accentColor: color }}
            />
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                border: "1px solid #333",
              }}
            ></span>
            Grupo {grupoNum}
          </label>
        );
      })}

      {(filtrosPriv.length > 0 || filtrosGrupos.length > 0) && (
        <button
          onClick={onClear}
          style={{
            marginTop: 8,
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "#f8f8f8",
            fontSize: 12,
          }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};
