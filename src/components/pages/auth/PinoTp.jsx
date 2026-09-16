import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Common, { Btn } from "../../Common.jsx";
import "../../css/Login.css";

function PinoTp() {

    const [pin, setPin] = useState(["", "", "", ""]);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const navigate = useNavigate();

    const handlePinChange = (index, value) => {
        if (value && !/^[0-9]+$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    let save = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const fullPin = pin.join("");
        if (fullPin.length !== 4) return;
        else if (fullPin === "2026") {
            localStorage.setItem("isAuthenticated", "true");
            navigate("/sidebars");
        } else {
            alert("Invalid PIN");

            setPin(["", "", "", ""]);

        }
        console.log("Logging in with:", fullPin);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Secure Login</h2>
                    <p>Please enter your details and 4-digit PIN.</p>
                </div>
                <form className="login-form" onSubmit={save}>


                    <div className="pin-group-container">
                        <label className="pin-label">Enter 4-Digit PIN</label>
                        <div className="pin-inputs">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    inputMode="numeric"
                                    className="pin-box"
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength={1}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="login-btn-wrapper">
                        <Btn text="Sign In" setMethod={save} />
                    </div>
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        navigate("/login");


                    }} style={{ textAlign: "center", color: "#a5a5b0", marginTop: "16px", textDecoration: "none", fontSize: "0.95rem", display: "block" }}>
                        Login With Password
                    </a>
                </form>
            </div>
        </div>
    );
}

export default PinoTp;
