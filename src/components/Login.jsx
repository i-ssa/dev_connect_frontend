import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";
import { loginUser } from "../api/userAPI";

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
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setFormData({ email: "", password: "" });
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
		setIsLoading(true);
		
		try {
			const credentials = {
				email: formData.email,
				password: formData.password,
			};

			console.log("Signing in with:", credentials);
			const result = await loginUser(credentials);
			console.log("Login successful:", result);

			// Store authentication data (matching documentation format)
			if (result.accessToken) {
				localStorage.setItem('accessToken', result.accessToken);
			}
			if (result.refreshToken) {
				localStorage.setItem('refreshToken', result.refreshToken);
			}
			if (result.user) {
				localStorage.setItem('user', JSON.stringify(result.user));
			}

			// Close modal first
			onClose?.();

			// Small delay to ensure modal closes before navigation
			setTimeout(() => {
				// Redirect to dashboard (App.jsx handles which dashboard to show based on role)
				navigate('/dashboard');
			}, 100);
		} catch (error) {
			console.error("Login error:", error);
			const errorMessage = error.message || "Invalid email or password";
			alert(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

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
							<h2>Welcome Back!</h2>
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
								<button type="submit" className="auth-submit-btn" disabled={isLoading}>
									{isLoading ? 'SIGNING IN...' : 'SIGN IN'}
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
