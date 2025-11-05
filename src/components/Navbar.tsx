import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth/logout";

// Importamos los íconos desde assets/icons
import tablaIcon from "../assets/icons/table.svg";
import mapaIcon from "../assets/icons/map.svg";
import logoutIcon from "../assets/icons/log-out.svg";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { icon: tablaIcon, to: "/", label: "Tabla" },
    { icon: mapaIcon, to: "/mapa", label: "Mapa" },
    // { icon: gruposIcon, to: "/grupos", label: "Grupos" },
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
    <nav className="fixed top-0 left-0 w-full bg-[#292929] shadow-lg z-[1000]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <h1 className="text-white text-2xl font-bold tracking-wide">
          Congregación Cordón
        </h1>

        <div className="flex items-center space-x-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-4 py-2 text-white text-lg font-medium transition-all duration-300 
                  ${
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

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-lg font-medium px-4 py-2 transition-all duration-300"
          >
            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
