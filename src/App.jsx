import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebars from "./components/Sidebars.jsx";
import Apartments from "./components/pages/Apartments.jsx";
import Houses from "./components/pages/Houses.jsx";
import Dashboard from "./components/pages/Dashoard.jsx";
import Login from "./components/pages/auth/Login.jsx";
import PinoTp from "./components/pages/auth/pinoTp.jsx";
import "./components/css/SidebarCss.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pinotp" element={<PinoTp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    
      {/* <div style={{ display: "flex", marginLeft: "20%" }}>
        <Sidebars />
        <div style={{ flex: 1, padding: "16px" }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div> */}
    </BrowserRouter>
  );
}

export default App;
