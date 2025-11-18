import { useEffect, useState } from "react";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";
import { registerUser } from "../api/userAPI";
import { verifyAccount, resendVerificationCode } from "../api/verificationAPI";

export default function SignupModal({ isOpen, onClose, onSwitchToSignin }) {
	const [step, setStep] = useState("signup"); // "signup", "role", or "verify"
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		telephone: "",
		password: "",
		terms: false,
	});
	const [verificationCode, setVerificationCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setStep("signup");
			setFormData({ firstName: "", lastName: "", username: "", email: "", telephone: "", password: "", terms: false });
			setVerificationCode("");
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
		setError("");
	};

	const handleProceed = (event) => {
		event.preventDefault();
		if (!formData.terms) {
			setError("You must accept the Terms & Condition.");
			return;
		}
		if (formData.password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}
		// Move to role selection step
		setStep("role");
	};

	const handleRoleSelection = async (role) => {
		setIsLoading(true);
		setError("");

		try {
			const registrationData = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				username: formData.username,
				email: formData.email,
				telephone: formData.telephone,
				password: formData.password,
				userRole: role, // "DEVELOPER" or "CLIENT"
			};

			console.log("Sending registration data:", registrationData);
			const result = await registerUser(registrationData);
			console.log("Registration successful:", result);
			
			// Backend automatically sends verification email
			// Move to verification step
			setStep("verify");
		} catch (error) {
			console.error("Registration error:", error);
			
			// Handle validation errors from backend
			if (error.validationErrors) {
				const validationMessages = Object.entries(error.validationErrors)
					.map(([field, message]) => `${field}: ${message}`)
					.join('\n');
				setError(validationMessages);
			} else {
				setError(error.message || "Registration failed. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyCode = async (event) => {
		event.preventDefault();
		setIsLoading(true);
		setError("");

		if (verificationCode.length !== 6) {
			setError("Please enter the 6-digit verification code");
			setIsLoading(false);
			return;
		}

		try {
			console.log("Verifying code for:", formData.email);
			await verifyAccount(formData.email, verificationCode);
			console.log("Account verified successfully");
			
			// Show success message and redirect to login
			alert(`Welcome, ${formData.firstName}! Your account has been verified. Please sign in to continue.`);
			onClose?.();
			onSwitchToSignin?.();
		} catch (error) {
			console.error("Verification error:", error);
			const errorMessage = error.message || "Invalid verification code. Please try again.";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		setIsLoading(true);
		setError("");

		try {
			console.log("Resending verification code to:", formData.email);
			await resendVerificationCode(formData.email);
			console.log("Verification code resent successfully");
			alert("Verification code resent to your email!");
		} catch (error) {
			console.error("Resend error:", error);
			setError(error.message || "Failed to resend code. Please try again.");
		} finally {
			setIsLoading(false);
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
						type="text"
						id="username"
						name="username"
						placeholder="Username"
						value={formData.username}
						onChange={handleChange}
						required
						disabled={isLoading}
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
							disabled={isLoading}
						/>
						Accept the Terms &amp; Condition
					</label>
				</div>
				{error && (
					<div style={{ 
						color: "#ef4444", 
						fontSize: "14px", 
						marginBottom: "16px",
						whiteSpace: "pre-line",
						padding: "12px",
						backgroundColor: "#fee2e2",
						borderRadius: "8px",
						border: "1px solid #ef4444"
					}}>
						{error}
					</div>
				)}
				<button type="submit" className="auth-submit-btn" disabled={isLoading}>
					{isLoading ? "PROCESSING..." : "PROCEED"}
				</button>
			</form>
			<p className="auth-redirect">
				I have an Account?
				<button type="button" onClick={onSwitchToSignin} className="auth-link-btn" disabled={isLoading}>
					SIGN IN
				</button>
			</p>
		</>
	);

	const renderVerificationForm = () => (
		<>
			<h2>Verify Your Email</h2>
			<p style={{ color: "#6b7280", marginBottom: "24px" }}>
				We've sent a 6-digit verification code to <strong>{formData.email}</strong>. 
				Please check your email and enter the code below.
			</p>
			<form className="auth-form" onSubmit={handleVerifyCode}>
				<div className="input-group">
					<input
						type="text"
						placeholder="Enter 6-digit code"
						value={verificationCode}
						onChange={(e) => {
							const value = e.target.value.replace(/\D/g, "").slice(0, 6);
							setVerificationCode(value);
							setError("");
						}}
						maxLength="6"
						pattern="[0-9]{6}"
						required
						disabled={isLoading}
						style={{ 
							textAlign: "center", 
							fontSize: "24px", 
							letterSpacing: "8px",
							fontWeight: "bold"
						}}
					/>
				</div>
				{error && (
					<div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>
						{error}
					</div>
				)}
				<button type="submit" className="auth-submit-btn" disabled={isLoading}>
					{isLoading ? "VERIFYING..." : "VERIFY ACCOUNT"}
				</button>
				<div style={{ textAlign: "center", marginTop: "16px" }}>
					<button
						type="button"
						onClick={handleResendCode}
						className="auth-link-btn"
						disabled={isLoading}
						style={{ fontSize: "14px" }}
					>
						Didn't receive the code? Resend
					</button>
				</div>
			</form>
			<p className="auth-redirect">
				Wrong email address?
				<button 
					type="button" 
					onClick={() => setStep("signup")} 
					className="auth-link-btn"
					disabled={isLoading}
				>
					GO BACK
				</button>
			</p>
		</>
	);

	const renderRoleSelection = () => (
		<>
			<h2>Choose Your Role</h2>
			<p style={{ color: "#6b7280", marginBottom: "32px", textAlign: "center" }}>
				Select how you want to use DevConnect
			</p>
			
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<button
					type="button"
					onClick={() => handleRoleSelection("CLIENT")}
					disabled={isLoading}
					style={{
						padding: "20px",
						border: "2px solid #6366f1",
						borderRadius: "12px",
						background: "#fff",
						cursor: isLoading ? "not-allowed" : "pointer",
						transition: "all 0.3s ease",
						opacity: isLoading ? 0.6 : 1,
					}}
					onMouseEnter={(e) => {
						if (!isLoading) {
							e.currentTarget.style.background = "#f0f1ff";
							e.currentTarget.style.transform = "translateY(-2px)";
						}
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
					disabled={isLoading}
					style={{
						padding: "20px",
						border: "2px solid #6366f1",
						borderRadius: "12px",
						background: "#fff",
						cursor: isLoading ? "not-allowed" : "pointer",
						transition: "all 0.3s ease",
						opacity: isLoading ? 0.6 : 1,
					}}
					onMouseEnter={(e) => {
						if (!isLoading) {
							e.currentTarget.style.background = "#f0f1ff";
							e.currentTarget.style.transform = "translateY(-2px)";
						}
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

			{error && (
				<div style={{ color: "#ef4444", fontSize: "14px", marginTop: "16px" }}>
					{error}
				</div>
			)}

			{isLoading && (
				<div style={{ marginTop: "24px", color: "#6b7280" }}>
					Creating your account and sending verification code...
				</div>
			)}

			<p className="auth-redirect" style={{ marginTop: "24px" }}>
				Need to change your details?
				<button
					type="button"
					onClick={() => setStep("signup")}
					disabled={isLoading}
					className="auth-link-btn"
				>
					GO BACK
				</button>
			</p>
		</>
	);

	return (
		<div className="auth-modal-overlay" onClick={onClose}>
			<div className="auth-page-container" onClick={(event) => event.stopPropagation()}>
				<button type="button" className="auth-modal-close" onClick={onClose} disabled={isLoading}>
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
						<h1 className="auth-tagline">
							{step === "signup" && "A Community Connecting Developers and Clients"}
							{step === "role" && "Choose Your Path"}
							{step === "verify" && "Almost There!"}
						</h1>
					</div>
					<div className="auth-right-panel">
						<div className="auth-form-wrapper">
							{step === "signup" && renderSignupForm()}
							{step === "verify" && renderVerificationForm()}
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
							if (e.target === e.currentTarget && !isLoading) {
								setStep("signup");
							}
						}}
					>
						<div 
							className="auth-card"
							style={{
								maxWidth: "900px",
								width: "90%",
								boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="auth-left-panel">
								<div className="auth-logo">{`{•}`} DevConnect</div>
								<img
									src={authIllustration}
									alt="Role selection"
									className="auth-illustration"
								/>
								<h1 className="auth-tagline">Choose Your Path</h1>
							</div>
							<div className="auth-right-panel">
								<div className="auth-form-wrapper">
									{renderRoleSelection()}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
