import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../../Common.jsx";
import menuIcon from "../../../assets/images/menu.png";
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
        if (fullPin === "2026") {
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", "Abshiro");
            localStorage.setItem("userEmail", "abshiro@gmail.com");
            navigate("/dashboard");
        } else {
            alert("Invalid PIN. Default is 2026");
            setPin(["", "", "", ""]);
            inputRefs[0].current.focus();
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <img src={menuIcon} alt="logo" />
                    </div>
                    <span className="login-brand-text">Rental<strong>Pro</strong></span>
                </div>
                <div className="login-header">
                    <h2>Secure PIN Login</h2>
                    <p>Enter your 4-digit security PIN to continue.</p>
                </div>
                <form className="login-form" onSubmit={save}>
                    <div className="pin-group-container">
                        <label className="pin-label">4-Digit PIN (Default: 2026)</label>
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
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="login-btn-wrapper">
                        <Btn text="Verify & Sign In" setMethod={save} />
                    </div>
                    <a
                        href="#"
                        className="login-switch-link"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/login");
                        }}
                    >
                        🔑 Login With Password
                    </a>
                </form>
            </div>
        </div>
    );
}

export default PinoTp;
