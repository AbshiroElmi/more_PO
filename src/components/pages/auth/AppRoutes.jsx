import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebars from "../../Sidebars.jsx";
import Dashboard from "../../pages/Dashoard.jsx";
import Reports from "../../pages/Reports.jsx";
import GenericPage from "../../pages/GenericPage.jsx";
import Login from "./Login.jsx";
import "../../css/SidebarCss.css";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AuthRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/*" element={
                    <ProtectedRoute>
                        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa", width: "100%", overflowX: "hidden" }}>
                            <Sidebars />
                            <div style={{ flex: 1, marginLeft: "220px", minWidth: 0, width: "calc(100% - 220px)", maxWidth: "calc(100% - 220px)", boxSizing: "border-box" }}>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/:pageName" element={<GenericPage />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;