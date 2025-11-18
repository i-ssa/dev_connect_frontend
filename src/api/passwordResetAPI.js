/**
 * Password Reset API Service
 * Base URL: /api/password-reset
 * All password reset related API requests
 */

import { API_BASE_URL, parseErrorResponse } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/password-reset`;

/**
 * Request a password reset code
 * POST /api/password-reset/request-code
 * @param {string} email - User's email address
 * @returns {Promise<string>} Success message (200 OK)
 */
export const requestResetCode = async (email) => {
	try {
		const response = await fetch(`${BASE_URL}/request-code`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to request reset code");
		}

		// Response is plain text
		return await response.text();
	} catch (error) {
		console.error("Request reset code error:", error);
		throw error;
	}
};

/**
 * Verify password reset code
 * POST /api/password-reset/verify-code
 * @param {string} email - User's email address
 * @param {string} verificationCode - 6-digit verification code
 * @returns {Promise<string>} Success message (200 OK)
 */
export const verifyResetCode = async (email, verificationCode) => {
	try {
		const response = await fetch(`${BASE_URL}/verify-code`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, verificationCode }),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Invalid or expired verification code");
		}

		// Response is plain text
		return await response.text();
	} catch (error) {
		console.error("Verify reset code error:", error);
		throw error;
	}
};

/**
 * Reset password using verification code
 * POST /api/password-reset/reset-password
 * @param {string} email - User's email address
 * @param {string} newPassword - New password (min 8 chars)
 * @param {string} confirmPassword - Confirm new password (must match newPassword)
 * @returns {Promise<string>} Success message (200 OK)
 */
export const resetPassword = async (email, newPassword, confirmPassword) => {
	try {
		const response = await fetch(`${BASE_URL}/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ 
				email, 
				newPassword, 
				confirmPassword 
			}),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to reset password");
		}

		// Response is plain text
		return await response.text();
	} catch (error) {
		console.error("Reset password error:", error);
		throw error;
	}
};

export default {
	requestResetCode,
	verifyResetCode,
	resetPassword,
};
