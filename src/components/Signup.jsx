import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";

const API_BASE_URL = "http://localhost:8081";

export default function SignupModal({ isOpen, onClose, onSwitchToSignin }) {
        const navigate = useNavigate();
        const [formData, setFormData] = useState({
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                terms: false,
        });
        const [error, setError] = useState("");
        useEffect(() => {
                if (!isOpen) {
                        setFormData({
                                username: "",
                                firstName: "", 
                                lastName: "", 
                                email: "", 
                                password: "", 
                                terms: false 
                        });
                        setError("");
                }
        }, [isOpen]);

        if (!isOpen) {
                return null;
        }

        const handleChange = (event) => {
                const { name, type, checked, value } = event.target;
                setFormData((prev) => ({
                        ...prev,
                        [name]: type === "checkbox" ? checked : value,
                }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                setError("");

                if (!formData.terms) {
                        setError("You must accept the Terms & Condition.");
                        return;
                }

                try {
                        const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                        username: formData.username,
                                        firstName: formData.firstName,
                                        lastName: formData.lastName,
                                        email: formData.email,
                                        password: formData.password,
                                        userRole: "DEVELOPER",
                                }),
                        });

                        if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                const errorMessage = errorData.message || "Registration failed";
                                
                                // Check for duplicate username/email errors
                                if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('exists')) {
                                        throw new Error("This username is already taken. Please choose another.");
                                }
                                if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
                                        throw new Error("This email is already registered. Please use another email or sign in.");
                                }
                                
                                throw new Error(errorMessage);
                        }

                        const data = await response.json();
                        console.log("Registration successful:", data);
                        
                        localStorage.setItem("pendingUser", JSON.stringify(data));
                        alert(`Welcome, ${formData.firstName}! Please select your role.`);
                        onClose?.();
                        navigate("/role-selection");
                } catch (err) {
                        console.error("Registration error:", err);
                        setError(err.message || "Failed to register. Please try again.");
                }
        };

        return (
                <div className="auth-modal-overlay" onClick={onClose}>
                        <div className="auth-page-container" onClick={(event) => event.stopPropagation()}>
                                <button type="button" className="auth-modal-close" onClick={onClose}>
                                        
                                </button>
                                <div className="auth-card">
                                        <div className="auth-left-panel">
                                                <div className="auth-logo">{`{}`} DevConnect</div>
                                                <img
                                                        src={authIllustration}
                                                        alt="Community illustration"
                                                        className="auth-illustration"
                                                />
                                        </div>
                                        <div className="auth-form-wrapper">
                                                <h2>Join & Connect the Fastest Growing Online Community</h2>
                                                {error && <div className="auth-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                                                <form className="auth-form" onSubmit={handleSubmit}>
                                                        <div className="input-group">
                                                                <input
                                                                        type="text"
                                                                        id="username"
                                                                        name="username"
                                                                        placeholder="Username"
                                                                        value={formData.username}
                                                                        onChange={handleChange}
                                                                        required
                                                                />
                                                        </div>
                                                        <div className="input-group">
                                                                <input
                                                                        type="email"
                                                                        id="email"
                                                                        name="email"
                                                                        placeholder="Email"
                                                                        value={formData.email}
                                                                        onChange={handleChange}
                                                                        required
                                                                />
                                                        </div>
                                                        <div className="input-group">
                                                                <input
                                                                        type="text"
                                                                        id="firstName"
                                                                        name="firstName"
                                                                        placeholder="First Name"
                                                                        value={formData.firstName}
                                                                        onChange={handleChange}
                                                                        required
                                                                />
                                                        </div>
                                                        <div className="input-group">
                                                                <input
                                                                        type="text"
                                                                        id="lastName"
                                                                        name="lastName"
                                                                        placeholder="Last Name"
                                                                        value={formData.lastName}
                                                                        onChange={handleChange}
                                                                        required
                                                                />
                                                        </div>
                                                        <div className="input-group">
                                                                <input
                                                                        type="password"
                                                                        id="password"
                                                                        name="password"
                                                                        placeholder="Password (min 8 characters)"
                                                                        value={formData.password}
                                                                        onChange={handleChange}
                                                                        required
                                                                        minLength="8"
                                                                />
                                                        </div>
                                                        <div className="form-options">
                                                                <label className="checkbox-container">
                                                                        <input
                                                                                type="checkbox"
                                                                                name="terms"
                                                                                checked={formData.terms}
                                                                                onChange={handleChange}
                                                                        />
                                                                        Accept Terms & Condition
                                                                </label>
                                                        </div>
                                                        <button type="submit" className="auth-submit-btn">
                                                                SIGN UP
                                                        </button>
                                                </form>
                                                <p className="auth-redirect">
                                                        I have an Account?{" "}
                                                        <button type="button" onClick={onSwitchToSignin} className="auth-link-btn">
                                                                SIGN IN
                                                        </button>
                                                </p>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}

