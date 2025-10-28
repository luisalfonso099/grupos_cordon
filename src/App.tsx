import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import GroupsPage from "./pages/GroupsPage";
import NavBar from "./components/Navbar";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/grupos" element={<GroupsPage />} />
      </Routes>
    </>
  );
}

export default App;
