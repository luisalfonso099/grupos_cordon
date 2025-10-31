import React from "react";

interface FiltrosPanelProps {
  coloresPorGrupo: string[];
  filtrosPriv: string[];
  filtrosGrupos: number[];
  onPrivChange: (priv: string) => void;
  onGrupoChange: (num: number) => void;
  onClear: () => void;
}

export const FiltrosPanel: React.FC<FiltrosPanelProps> = ({
  coloresPorGrupo,
  filtrosPriv,
  filtrosGrupos,
  onPrivChange,
  onGrupoChange,
  onClear,
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

      {/* 🔸 Privilegios */}
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
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        Filtrar por grupo
      </div>

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
