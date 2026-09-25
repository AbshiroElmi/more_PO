import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Common, { Btn } from "../../Common.jsx";
import menuIcon from "../../../assets/images/menu.png";
import "../../css/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    let save = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!username && !password) return;

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("isAuthenticated", "true");
                const loggedInUser = data.user?.user_name || username || "Abshiro";
                localStorage.setItem("username", loggedInUser);
                localStorage.setItem("userEmail", "abshiro@gmail.com");
                navigate("/dashboard");
            } else {
                setUsername("");
                setPassword("");
                alert("Invalid username or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-brand-icon" style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px" }}>
                        <img src={menuIcon} alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                    </div>
                    <span className="login-brand-text">Rental<strong>Pro</strong></span>
                </div>
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details to sign in.</p>
                </div>
                <form className="login-form" onSubmit={save}>
                    <div className="input-group">
                        <Common
                            type="text"
                            value={username}
                            name="text1"
                            setVal={setUsername}
                            pl="Enter your username"
                        />
                    </div>
                    <div className="input-group">
                        <Common
                            type="password"
                            value={password}
                            name="text2"
                            setVal={setPassword}
                            pl="Enter your password"
                        />
                    </div>
                    <div className="login-btn-wrapper">
                        <Btn text="Sign In" setMethod={save} />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
