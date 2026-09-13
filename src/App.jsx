import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebars from "./components/Sidebars.jsx";
import Apartments from "./components/pages/Apartments.jsx";
import Houses from "./components/pages/Houses.jsx";
import Category from "./components/pages/Dashoard.jsx";
import "./components/css/SidebarCss.css";
function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", marginLeft: "20%" }}>
        <Sidebars />
        <div style={{ flex: 1, padding: "16px" }}>
          <Routes>
            <Route path="/dashboard" element={<Category />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
