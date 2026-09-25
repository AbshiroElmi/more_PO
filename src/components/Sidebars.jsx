import { NavLink, useNavigate } from "react-router-dom";
import menuIcon from "../assets/images/menu.png";
import { Btn } from "./Common.jsx";

const NAV_ITEMS = [
    { to: "/dashboard",  icon: "⊞",  label: "Dashboard" },
    { to: "/apartments", icon: "🏠",  label: "Apartments" },
    { to: "/houses",     icon: "🏘️", label: "Houses" },
    { to: "/people",     icon: "👥",  label: "People" },
    { to: "/renting",    icon: "📋",  label: "Renting" },
    { to: "/billing",    icon: "💳",  label: "Billing" },
    { to: "/receipts",   icon: "🧾",  label: "Receipts" },
    { to: "/accounts",   icon: "🏦",  label: "Accounts" },
    { to: "/address",    icon: "📍",  label: "Address" },
    { to: "/users",      icon: "👤",  label: "Users" },
];

function Sidebars() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("username");
        localStorage.removeItem("userEmail");
        navigate("/login");
    };

    return (
        <div className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <img src={menuIcon} alt="logo" />
                </div>
                <span className="sidebar-logo-text">Rental<strong>Pro</strong></span>
            </div>

            {/* Menu label */}
            <p className="sidebar-section-label">MENU</p>

            {/* Nav */}
            <ul>
                {NAV_ITEMS.map(item => (
                    <li key={item.to}>
                        <NavLink to={item.to}>
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            {/* Footer logout */}
            <div className="footer">
                <Btn text="Log Out" setMethod={handleLogout} />
            </div>
        </div>
    );
}

export default Sidebars;