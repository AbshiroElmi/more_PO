import { NavLink, useNavigate } from "react-router-dom";
import menuIcon from "../assets/images/menu.png";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Btn } from "./Common.jsx";

function Sidebars() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/login");
    };

    return (
        <>
            <div className="sidebar" >
                <header className="header">
                    <div className="img1">
                        <img src={menuIcon} alt="menu" />
                    </div>
                    {/* <div className="img2">
                        <FontAwesomeIcon icon={faSearch} />
                    </div> */}
                    {/* menu icon */}

                </header>
                <ul>
                    <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/apartments">Apartments</NavLink>
                    </li>
                    <li>
                        <NavLink to="/houses">Houses</NavLink>
                    </li>
                    <li>
                        <NavLink to="/accounts">Accounts</NavLink>
                    </li>
                    <li>
                        <NavLink to="/address">Address</NavLink>
                    </li>
                    <li>
                        <NavLink to="/billing">Billing</NavLink>
                    </li>
                    <li>
                        <NavLink to="/people">People</NavLink>
                    </li>
                    <li>
                        <NavLink to="/receipts">Receipts</NavLink>
                    </li>
                    <li>
                        <NavLink to="/renting">Renting</NavLink>
                    </li>
                    <li>
                        <NavLink to="/users">Users</NavLink>
                    </li>
                </ul>
                {/* footer in sidebar */}
                <div className="footer">
                    <Btn text="Log Out" setMethod={handleLogout} />
                </div>
            </div>
        </>
    );
}

export default Sidebars;