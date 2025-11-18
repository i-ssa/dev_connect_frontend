import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";
import { registerUser } from "../API/userAPI";

export default function SignupModal({ isOpen, onClose, onSwitchToSignin }) {
	const navigate = useNavigate();
	const [step, setStep] = useState("signup"); // "signup" or "role"
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		telephone: "",
		password: "",
		terms: false,
	});

	useEffect(() => {
		if (!isOpen) {
			setStep("signup");
			setFormData({ firstName: "", lastName: "", email: "", telephone: "", password: "", terms: false });
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

	const handleProceed = (event) => {
		event.preventDefault();
		if (!formData.terms) {
			alert("You must accept the Terms & Condition.");
			return;
		}
		if (formData.password.length < 8) {
			alert("Password must be at least 8 characters long.");
			return;
		}
		// Move to role selection step
		setStep("role");
	};

	const handleRoleSelection = async (role) => {
		try {
			const registrationData = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				telephone: formData.telephone,
				password: formData.password,
				userRole: role, // "DEVELOPER" or "CLIENT"
			};

			console.log("Sending registration data:", registrationData);
			const result = await registerUser(registrationData);
			console.log("Registration successful:", result);
			
			// Store authentication data with consistent keys
			if (result.accessToken) {
				localStorage.setItem('devconnect_token', result.accessToken);
				localStorage.setItem('token', result.accessToken); // Also store as 'token' for backward compatibility
			}
			if (result.refreshToken) {
				localStorage.setItem('devconnect_refresh_token', result.refreshToken);
			}
			if (result.user || result.id) {
				// Ensure user object has proper structure for projects API
				const user = result.user || result;
				const userWithId = {
					...user,
					id: user.userId || user.id,
					userId: user.userId || user.id,
					userRole: role
				};
				localStorage.setItem('devconnect_user', JSON.stringify(userWithId));
			}
			
			alert(`Welcome, ${formData.firstName}! Registration successful as ${role === 'CLIENT' ? 'Client' : 'Developer'}.`);
			onClose?.();
			
			// Navigate to appropriate dashboard based on role
			if (role === 'DEVELOPER') {
				navigate('/dashboard-developer');
			} else if (role === 'CLIENT') {
				navigate('/dashboard-client');
			} else {
				navigate('/');
			}
		} catch (error) {
			console.error("Registration error:", error);
			const errorMessage = error.message || "Registration failed. Please try again.";
			alert(errorMessage);
		}
	};

	const renderSignupForm = () => (
		<>
			<h2>Join &amp; Connect the Fastest Growing Online Community</h2>
			<form className="auth-form" onSubmit={handleProceed}>
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
						type="tel"
						id="telephone"
						name="telephone"
						placeholder="Telephone Number"
						value={formData.telephone}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="input-group">
					<input
						type="password"
						id="password"
						name="password"
						placeholder="Password (min. 8 characters)"
						value={formData.password}
						onChange={handleChange}
						minLength={8}
						required
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
						Accept the Terms &amp; Condition
					</label>
				</div>
				<button type="submit" className="auth-submit-btn">
					PROCEED
				</button>
			</form>
			<p className="auth-redirect">
				I have an Account?
				<button type="button" onClick={onSwitchToSignin} className="auth-link-btn">
					SIGN IN
				</button>
			</p>
		</>
	);

	const renderRoleSelection = () => (
		<div style={{ textAlign: "center", padding: "20px" }}>
			<h2 style={{ marginBottom: "16px" }}>Choose Your Role</h2>
			<p style={{ color: "#6b7280", marginBottom: "32px" }}>
				Select how you want to use DevConnect
			</p>
			
			<div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px", margin: "0 auto" }}>
				<button
					type="button"
					onClick={() => handleRoleSelection("CLIENT")}
					style={{
						padding: "20px",
						border: "2px solid #6366f1",
						borderRadius: "12px",
						background: "#fff",
						cursor: "pointer",
						transition: "all 0.3s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#f0f1ff";
						e.currentTarget.style.transform = "translateY(-2px)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "#fff";
						e.currentTarget.style.transform = "translateY(0)";
					}}
				>
					<div style={{ fontSize: "32px", marginBottom: "8px" }}>💼</div>
					<div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
						I'm a Client
					</div>
					<div style={{ fontSize: "14px", color: "#6b7280" }}>
						I have a project and need a developer
					</div>
				</button>

				<button
					type="button"
					onClick={() => handleRoleSelection("DEVELOPER")}
					style={{
						padding: "20px",
						border: "2px solid #6366f1",
						borderRadius: "12px",
						background: "#fff",
						cursor: "pointer",
						transition: "all 0.3s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#f0f1ff";
						e.currentTarget.style.transform = "translateY(-2px)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "#fff";
						e.currentTarget.style.transform = "translateY(0)";
					}}
				>
					<div style={{ fontSize: "32px", marginBottom: "8px" }}>👨‍💻</div>
					<div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
						I'm a Developer
					</div>
					<div style={{ fontSize: "14px", color: "#6b7280" }}>
						I want to work on client projects
					</div>
				</button>
			</div>

			<button
				type="button"
				onClick={() => setStep("signup")}
				style={{
					marginTop: "24px",
					color: "#6366f1",
					background: "transparent",
					border: "none",
					cursor: "pointer",
					fontSize: "14px",
				}}
			>
				← Go Back
			</button>
		</div>
	);

	return (
		<div className="auth-modal-overlay" onClick={onClose}>
			<div className="auth-page-container" onClick={(event) => event.stopPropagation()}>
				<button type="button" className="auth-modal-close" onClick={onClose}>
					×
				</button>
				<div className="auth-card">
					<div className="auth-left-panel">
						<div className="auth-logo">{`{•}`} DevConnect</div>
						<img
							src={authIllustration}
							alt="Community illustration"
							className="auth-illustration"
						/>
						<h1 className="auth-tagline">A Community Connecting Developers and Clients</h1>
					</div>
					<div className="auth-right-panel">
						<div className="auth-form-wrapper">
							{renderSignupForm()}
						</div>
					</div>
				</div>
				
				{/* Role Selection Overlay */}
				{step === "role" && (
					<div 
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(0, 0, 0, 0.75)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 1000,
						}}
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								setStep("signup");
							}
						}}
					>
						<div 
							style={{
								background: "white",
								borderRadius: "16px",
								padding: "40px",
								maxWidth: "500px",
								width: "90%",
								boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{renderRoleSelection()}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
