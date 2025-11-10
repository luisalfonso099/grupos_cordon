import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth/logout";

// Íconos
import tablaIcon from "../assets/icons/table.svg";
import mapaIcon from "../assets/icons/map.svg";
import logoutIcon from "../assets/icons/log-out.svg";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { icon: tablaIcon, to: "/", label: "Tabla" },
    { icon: mapaIcon, to: "/mapa", label: "Mapa" },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#292929] shadow-lg z-[500]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Título */}
        <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">
          Congregación Cordón
        </h1>

        {/* Botón menú móvil */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded-lg transition"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Menú"
        >
          {/* Icono hamburguesa / cerrar */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Links desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-4 py-2 text-white text-lg font-medium transition-all duration-300 rounded-lg ${
                  isActive
                    ? "bg-[#4A6DA7] backdrop-blur-sm"
                    : "hover:bg-white/10 hover:scale-105"
                }`}
              >
                <img src={link.icon} alt={link.label} className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-lg font-medium px-4 py-2 rounded-lg transition-all duration-300"
          >
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-[#1f1f1f] border-t border-white/10 px-4 py-3 flex flex-col space-y-2 animate-fadeIn">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white text-base font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#4A6DA7]"
                    : "hover:bg-white/10 hover:scale-[1.02]"
                }`}
              >
                <img src={link.icon} alt={link.label} className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-base font-medium px-4 py-2 rounded-lg transition-all duration-200"
          >
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
