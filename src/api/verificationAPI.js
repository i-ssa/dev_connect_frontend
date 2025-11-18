/**
 * Verification API Service
 * Base URL: /api/account-verification
 * All account verification related API requests
 */

import { API_BASE_URL, parseErrorResponse } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/account-verification`;

/**
 * Verify account with verification code
 * POST /api/account-verification/verify
 * @param {string} email - User's email
 * @param {string} verificationCode - 6-digit verification code
 * @returns {Promise<string>} Success message (200 OK)
 * @throws Error with message from backend (400 BAD REQUEST)
 *   - "Invalid verification code."
 *   - "Verification code has expired. Please request a new code."
 *   - "Account is already verified"
 */
export const verifyAccount = async (email, verificationCode) => {
	try {
		const response = await fetch(`${BASE_URL}/verify`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, verificationCode }),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || 'Verification failed');
		}

		// Backend returns plain text for this endpoint
		return await response.text();
	} catch (error) {
		console.error('Verification error:', error);
		throw error;
	}
};

/**
 * Resend verification code
 * POST /api/account-verification/resend-code
 * @param {string} email - User's email
 * @returns {Promise<string>} Success message (200 OK)
 * @throws Error with message "Account is already verified" (400 BAD REQUEST)
 * Note: New code expires in 15 minutes (vs 30 minutes for initial code)
 */
export const resendVerificationCode = async (email) => {
	try {
		const response = await fetch(`${BASE_URL}/resend-code`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || 'Failed to resend verification code');
		}

		// Backend returns plain text for this endpoint
		return await response.text();
	} catch (error) {
		console.error('Resend verification code error:', error);
		throw error;
	}
};

export default {
	verifyAccount,
	resendVerificationCode,
};
