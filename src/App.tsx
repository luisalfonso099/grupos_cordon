import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import NavBar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import GroupsPage from "./pages/GroupsPage";
import Login from "./pages/login/page";

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    // mientras Firebase restaura la sesión, mostramos un loader
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Cargando sesión...
      </div>
    );
  }

  const showNavBar = user && location.pathname !== "/login";

  return (
    <>
      {showNavBar && <NavBar />}

      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/mapa"
          element={user ? <MapPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/grupos"
          element={user ? <GroupsPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
