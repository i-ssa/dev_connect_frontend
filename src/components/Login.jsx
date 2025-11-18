import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";
import authIllustration from "../assets/authlogo.png";
import { loginUser } from "../API/userAPI";

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

			// Store authentication data with consistent keys
			if (result.accessToken) {
				localStorage.setItem('devconnect_token', result.accessToken);
				localStorage.setItem('token', result.accessToken); // Also store as 'token' for backward compatibility
				console.log('✅ Token stored:', result.accessToken.substring(0, 20) + '...');
			} else {
				console.error('❌ No accessToken in response!');
			}
			if (result.refreshToken) {
				localStorage.setItem('devconnect_refresh_token', result.refreshToken);
			}
			if (result.user) {
				// Ensure user object has 'id' field for projects API
				const userWithId = {
					...result.user,
					id: result.user.userId || result.user.id, // Ensure 'id' exists
					userId: result.user.userId || result.user.id, // Keep userId too
					role: result.user.userRole?.toLowerCase() || result.user.role?.toLowerCase() // Normalize role to lowercase
				};
				localStorage.setItem('devconnect_user', JSON.stringify(userWithId));
				console.log('✅ User stored:', userWithId);
			}
			
			// Verify storage
			console.log('=== Stored Data Verification ===');
			console.log('token:', localStorage.getItem('token')?.substring(0, 20) + '...');
			console.log('devconnect_token:', localStorage.getItem('devconnect_token')?.substring(0, 20) + '...');
			console.log('devconnect_user:', localStorage.getItem('devconnect_user'));

			alert(`Welcome back, ${result.user?.firstName || 'User'}!`);
			onClose?.();

			// Redirect based on user role (handle both uppercase and lowercase)
			const userRole = result.user?.userRole?.toUpperCase() || result.user?.role?.toUpperCase();
			if (userRole === 'DEVELOPER') {
				navigate('/dashboard-developer');
			} else if (userRole === 'CLIENT') {
				navigate('/dashboard-client');
			} else {
				navigate('/');
			}
		} catch (error) {
			console.error("Login error:", error);
			const errorMessage = error.message || "Login failed. Please check your credentials.";
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
