import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Common, { Btn } from "../../Common.jsx";
import "../../css/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    let save = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!username && !password) return;

        // Perform login action
        console.log("Logging in with", username, password);
    };

    return (
        <div className="login-container">
            <div className="login-card">
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
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        navigate("/pinotp");
                    }} style={{ textAlign: "center", color: "#a5a5b0", marginTop: "16px", textDecoration: "none", fontSize: "0.95rem", display: "block" }}>Login With PIN</a>
                </form>
            </div>
        </div>
    );
}

export default Login;
