import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";

const API_BASE_URL = "http://localhost:8081";

export default function LoginModal({
        isOpen,
        onClose,
        onSwitchToSignup,
        onSwitchToForgotPassword,
        onSwitchToResetPassword,
}) {
        const navigate = useNavigate();
        const [formData, setFormData] = useState({
                email: "",
                password: "",
        });
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);

        useEffect(() => {
                if (!isOpen) {
                        setFormData({ email: "", password: "" });
                        setError("");
                }
        }, [isOpen]);

        if (!isOpen) {
                return null;
        }

        const handleChange = (event) => {
                const { name, value } = event.target;
                setFormData((prev) => ({
                        ...prev,
                        [name]: value,
                }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                setError("");
                setLoading(true);

                try {
                        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                        email: formData.email,
                                        password: formData.password,
                                }),
                        });

                        if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                throw new Error(errorData.message || "Login failed");
                        }

                        const data = await response.json();
                        console.log("Login successful:", data);
                        
                        localStorage.setItem("accessToken", data.accessToken);
                        localStorage.setItem("refreshToken", data.refreshToken);
                        localStorage.setItem("user", JSON.stringify(data.user));
                        
                        onClose?.();
                        
                        if (data.user.userRole === "CLIENT") {
                                navigate("/projects");
                        } else {
                                navigate("/findClients");
                        }
                } catch (err) {
                        console.error("Login error:", err);
                        setError(err.message || "Invalid email or password. Please try again.");
                } finally {
                        setLoading(false);
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
                                                <h1 className="auth-tagline">A Community Connecting Developers and Clients</h1>
                                        </div>
                                        <div className="auth-right-panel">
                                                <div className="auth-form-wrapper">
                                                        <h2>Welcome Back!</h2>
                                                        {error && <div className="auth-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                                                        <form className="auth-form" onSubmit={handleSubmit}>
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
                                                                                type="password"
                                                                                id="password"
                                                                                name="password"
                                                                                placeholder="Password"
                                                                                value={formData.password}
                                                                                onChange={handleChange}
                                                                                required
                                                                        />
                                                                </div>
                                                                <div className="form-options">
                                                                        <button
                                                                                type="button"
                                                                                onClick={() => onSwitchToForgotPassword?.()}
                                                                                className="forgot-password"
                                                                        >
                                                                                Forgot Password?
                                                                        </button>
                                                                        {onSwitchToResetPassword && (
                                                                                <button
                                                                                        type="button"
                                                                                        onClick={() => onSwitchToResetPassword?.()}
                                                                                        className="auth-link-btn"
                                                                                        style={{ padding: 0 }}
                                                                                >
                                                                                        Have a reset code?
                                                                                </button>
                                                                        )}
                                                                </div>
                                                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                                                        {loading ? "SIGNING IN..." : "SIGN IN"}
                                                                </button>
                                                        </form>
                                                        <p className="auth-redirect">
                                                                Don&apos;t have an account?
                                                                <button
                                                                        type="button"
                                                                        onClick={() => onSwitchToSignup?.()}
                                                                        className="auth-link-btn"
                                                                >
                                                                        SIGN UP
                                                                </button>
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
