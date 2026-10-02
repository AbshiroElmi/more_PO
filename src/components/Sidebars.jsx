import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import menuIcon from "../assets/images/menu.png";
import { Btn } from "./Common.jsx";
import { fetchData } from "./api.js";

const iconProps = { viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
const s = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

const DashboardIcon = () => (
    <svg {...iconProps}>
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" {...s} />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" {...s} />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" {...s} />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" {...s} />
    </svg>
);

const ApartmentsIcon = () => (
    <svg {...iconProps}>
        <path d="M3 9.5L10 3.5l7 6" {...s} />
        <path d="M4.5 8.5V16a1 1 0 001 1h9a1 1 0 001-1V8.5" {...s} />
        <path d="M8 17v-4.5a1 1 0 011-1h2a1 1 0 011 1V17" {...s} />
    </svg>
);

const HousesIcon = () => (
    <svg {...iconProps}>
        <rect x="4" y="3" width="12" height="14" rx="1.2" {...s} />
        <path d="M7.5 6.5h1.2M11.3 6.5h1.2M7.5 10h1.2M11.3 10h1.2" {...s} />
        <path d="M8.3 17v-3.2a1 1 0 011-1h1.4a1 1 0 011 1V17" {...s} />
    </svg>
);

const PeopleIcon = () => (
    <svg {...iconProps}>
        <circle cx="7" cy="6.5" r="2.3" {...s} />
        <path d="M2.5 16.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5" {...s} />
        <circle cx="13.8" cy="7" r="1.8" {...s} />
        <path d="M12 12.3c.5-.3 1.1-.5 1.8-.5 2.1 0 3.7 1.4 3.7 3.7" {...s} />
    </svg>
);

const RentingIcon = () => (
    <svg {...iconProps}>
        <rect x="4.5" y="3.5" width="11" height="14" rx="1.3" {...s} />
        <rect x="7.5" y="2.3" width="5" height="2.6" rx="0.8" {...s} />
        <path d="M7 10l2 2 4-4" {...s} />
        <path d="M7 14.2h6" {...s} />
    </svg>
);

const BillingIcon = () => (
    <svg {...iconProps}>
        <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" {...s} />
        <path d="M2.5 8h15" {...s} />
        <path d="M5 12.2h3.5" {...s} />
    </svg>
);

const ReceiptsIcon = () => (
    <svg {...iconProps}>
        <path d="M5 2.5h10v14.3l-1.7-1.2-1.6 1.2-1.7-1.2-1.6 1.2-1.7-1.2-1.7 1.2V2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.3 6.5h5.4M7.3 9.3h5.4M7.3 12h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const AccountsIcon = () => (
    <svg {...iconProps}>
        <path d="M2.5 7L10 2.5 17.5 7" {...s} />
        <path d="M4 8.3v6.7M8 8.3v6.7M12 8.3v6.7M16 8.3v6.7" {...s} />
        <path d="M2.5 17h15" {...s} />
    </svg>
);

const AddressIcon = () => (
    <svg {...iconProps}>
        <path d="M10 17.5s6-5.6 6-10a6 6 0 10-12 0c0 4.4 6 10 6 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="10" cy="7.5" r="2.1" {...s} />
    </svg>
);

const UsersIcon = () => (
    <svg {...iconProps}>
        <circle cx="10" cy="6.5" r="3" {...s} />
        <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" {...s} />
    </svg>
);

const ReportsIcon = () => (
    <svg {...iconProps}>
        <path d="M4 17V10M10 17V4M16 17v-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M2.5 17h15" {...s} />
    </svg>
);

const ICON_MAP = {
    DashboardIcon: <DashboardIcon />,
    ApartmentsIcon: <ApartmentsIcon />,
    HousesIcon: <HousesIcon />,
    PeopleIcon: <PeopleIcon />,
    RentingIcon: <RentingIcon />,
    BillingIcon: <BillingIcon />,
    ReceiptsIcon: <ReceiptsIcon />,
    AccountsIcon: <AccountsIcon />,
    AddressIcon: <AddressIcon />,
    UsersIcon: <UsersIcon />,
    ReportsIcon: <ReportsIcon />,
};

function Sidebars() {
    const navigate = useNavigate();
    const [navItems, setNavItems] = useState([]);

    useEffect(() => {
        fetchData("sidebars")
            .then(data => {
                const activeItems = data
                    .filter(item => item.is_active === 1 || item.is_active === true || item.is_active === "1")
                    .sort((a, b) => a.sort_order - b.sort_order);
                setNavItems(activeItems);
            })
            .catch(err => alert("Error fetching sidebars: " + err));
    }, []);

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


            {/* Nav */}
            <ul>
                {navItems.map(item => (
                    <li key={item.id}>
                        <NavLink to={item.path}>
                            <span className="nav-icon">{ICON_MAP[item.icon_name] || <DashboardIcon />}</span>
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