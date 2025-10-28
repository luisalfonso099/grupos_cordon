import { Link } from "react-router-dom";

const NavBar = () => (
    <div className="navbar bg-base-100 shadow-sm">
      <Link className="btn btn-ghost text-xl" to="/">📋 Tabla</Link>
      <Link className="btn btn-ghost text-xl" to="/mapa">🗺️ Mapa</Link>
      <Link className="btn btn-ghost text-xl" to="/grupos">👥 Grupos</Link>
    </div>
);

export default NavBar;
