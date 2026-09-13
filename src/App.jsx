import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebars from "./components/Sidebars.jsx";
import Home from "./components/pages/Home.jsx";
import Items from "./components/pages/Items.jsx";
import Category from "./components/pages/Category.jsx";
import "./components/css/SidebarCss.css";
function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", marginLeft: "20%" }}>
        <Sidebars />
        <div style={{ flex: 1, padding: "16px" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home/>} />
            <Route path="/items" element={<Items />} />
            <Route path="/category" element={<Category />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
