import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebars from "../../Sidebars.jsx";
import Apartments from "../../pages/Apartments.jsx";
import Houses from "../../pages/Houses.jsx";
import Dashboard from "../../pages/Dashoard.jsx";
import Accounts from "../../pages/Accounts.jsx";
import Address from "../../pages/Address.jsx";
import Billing from "../../pages/Billing.jsx";
import People from "../../pages/People.jsx";
import Receipts from "../../pages/Receipts.jsx";
import Renting from "../../pages/Renting.jsx";
import Users from "../../pages/Users.jsx";
import Login from "./Login.jsx";
import PinoTp from "./pinoTp.jsx";
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
                <Route path="/pinotp" element={<AuthRoute><PinoTp /></AuthRoute>} />
                <Route path="/*" element={
                    <ProtectedRoute>
                        <div style={{ display: "flex", marginLeft: "20%" }}>
                            <Sidebars />
                            <div style={{ flex: 1, padding: "16px" }}>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/apartments" element={<Apartments />} />
                                    <Route path="/houses" element={<Houses />} />
                                    <Route path="/accounts" element={<Accounts />} />
                                    <Route path="/address" element={<Address />} />
                                    <Route path="/billing" element={<Billing />} />
                                    <Route path="/people" element={<People />} />
                                    <Route path="/receipts" element={<Receipts />} />
                                    <Route path="/renting" element={<Renting />} />
                                    <Route path="/users" element={<Users />} />
                                    <Route path="*" element={<Navigate to="/login" replace />} />
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