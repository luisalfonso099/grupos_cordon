import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "📋 Tabla" },
    { to: "/mapa", label: "🗺️ Mapa" },
    { to: "/grupos", label: "👥 Grupos" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#292929] shadow-lg z-1000">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <h1 className="text-white text-2xl font-bold tracking-wide">
          Congregación Cordón
        </h1>

        <div className="flex space-x-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-white text-lg font-medium transition-all duration-300 
                  ${isActive ? "bg-[#000000] backdrop-blur-sm" : "hover:bg-white/10 hover:scale-105"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
