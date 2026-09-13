import { NavLink } from "react-router-dom";
import menuIcon from "../assets/images/menu.png";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Btn } from "./Common.jsx";

function Sidebars() {
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
               
                </ul>


                {/* footer in sidebar */}
                <div className="footer">
                    <Btn text="Log Out"  />
                </div>
            </div>
        </>
    );
}

export default Sidebars;