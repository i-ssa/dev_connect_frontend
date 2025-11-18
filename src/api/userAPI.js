/**
 * User API Service
 * Base URL: /api/users
 * All user-related API requests
 */

import { API_BASE_URL, authenticatedFetch, parseErrorResponse } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/users`;

/**
 * Register a new user
 * POST /api/users/register
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name (max 127 chars)
 * @param {string} userData.lastName - User's last name (max 127 chars)
 * @param {string} userData.username - User's username (3-50 chars)
 * @param {string} userData.email - User's email (valid email, max 255 chars)
 * @param {string} userData.telephone - User's telephone number (optional, max 15 chars)
 * @param {string} userData.password - User's password (min 8 chars)
 * @param {string} userData.userRole - User's role (CLIENT, DEVELOPER, or ADMIN)
 * @returns {Promise<Object>} Response with user data (201 CREATED)
 */
export const registerUser = async (userData) => {
	try {
		const response = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			// Return error with validation details if present
			throw {
				status: response.status,
				message: error.message || 'Registration failed',
				validationErrors: error.validationErrors || null
			};
		}

		return await response.json();
	} catch (error) {
		console.error("Registration error:", error);
		throw error;
	}
};

/**
 * Login user
 * POST /api/users/login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response with accessToken, refreshToken, user, tokenType (200 OK)
 */
export const loginUser = async (credentials) => {
	try {
		try {
		const response = await fetch(`${BASE_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: 'include', // Include cookies for CSRF token
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || 'Invalid email or password');
		}

		return await response.json();
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
};

/**
 * Refresh authentication token
 * POST /api/users/refresh
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Response with new access token and refresh token
 */
export const refreshToken = async (refreshToken) => {
	try {
		const response = await fetch(`${BASE_URL}/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Token refresh failed");
		}

		return await response.json();
	} catch (error) {
		console.error("Refresh token error:", error);
		throw error;
	}
};

/**
 * Get user by ID
 * GET /api/users/{id}
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data (200 OK)
 */
export const getUserById = async (userId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "User not found");
		}

		return await response.json();
	} catch (error) {
		console.error("Get user error:", error);
		throw error;
	}
};

/**
 * Get user by email
 * GET /api/users/email/{email}
 * @param {string} email - User's email
 * @returns {Promise<Object>} User data (200 OK)
 */
export const getUserByEmail = async (email) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/email/${email}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "User not found");
		}

		return await response.json();
	} catch (error) {
		console.error("Get user by email error:", error);
		throw error;
	}
};

/**
 * Get users by role
 * GET /api/users/role/{role}
 * @param {string} role - User role (CLIENT, DEVELOPER, or ADMIN)
 * @returns {Promise<Array>} List of users with specified role (200 OK)
 */
export const getUsersByRole = async (role) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/role/${role}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to fetch users");
		}

		return await response.json();
	} catch (error) {
		console.error("Get users by role error:", error);
		throw error;
	}
};

/**
 * Check if email exists
 * GET /api/users/exists/{email}
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 */
export const emailExists = async (email) => {
	try {
		const response = await fetch(`${BASE_URL}/exists/${email}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to check email");
		}

		return await response.json();
	} catch (error) {
		console.error("Email exists check error:", error);
		throw error;
	}
};

/**
 * Get all users
 * GET /api/users
 * @returns {Promise<Array>} List of all users (200 OK)
 */
export const getAllUsers = async () => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to fetch users");
		}

		return await response.json();
	} catch (error) {
		console.error("Get all users error:", error);
		throw error;
	}
};

/**
 * Update user profile
 * PUT /api/users/{id}
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @param {string} userData.firstName - User's first name (max 127 chars)
 * @param {string} userData.lastName - User's last name (max 127 chars)
 * @param {string} userData.username - User's username (3-50 chars)
 * @param {string} userData.email - User's email (valid email, max 255 chars)
 * @param {string} userData.telephone - User's telephone (optional, max 15 chars)
 * @returns {Promise<Object>} Updated user data (200 OK)
 */
export const updateUser = async (userId, userData) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}`, {
			method: "PUT",
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to update user");
		}

		return await response.json();
	} catch (error) {
		console.error("Update user error:", error);
		throw error;
	}
};

/**
 * Update user status
 * PATCH /api/users/{id}/status
 * @param {number} userId - User ID
 * @param {string} status - User status (ONLINE or OFFLINE)
 * @returns {Promise<void>} (200 OK, no content)
 */
export const updateUserStatus = async (userId, status) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}/status?status=${status}`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to update user status");
		}
	} catch (error) {
		console.error("Update user status error:", error);
		throw error;
	}
};

/**
 * Update user's last seen timestamp
 * PATCH /api/users/{id}/last-seen
 * @param {number} userId - User ID
 * @returns {Promise<void>} (200 OK, no content)
 */
export const updateLastSeen = async (userId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}/last-seen`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to update last seen");
		}
	} catch (error) {
		console.error("Update last seen error:", error);
		throw error;
	}
};

/**
 * Change user password
 * POST /api/users/{id}/change-password
 * @param {number} userId - User ID
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} passwordData.confirmNewPassword - Confirm new password
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, passwordData) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}/change-password`, {
			method: "POST",
			body: JSON.stringify(passwordData),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to change password");
		}
	} catch (error) {
		console.error("Change password error:", error);
		throw error;
	}
};

/**
 * Activate user account
 * PATCH /api/users/{id}/activate
 * @param {number} userId - User ID
 * @returns {Promise<void>} (200 OK, no content)
 */
export const activateUser = async (userId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}/activate`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to activate user");
		}
	} catch (error) {
		console.error("Activate user error:", error);
		throw error;
	}
};

/**
 * Deactivate user account
 * PATCH /api/users/{id}/deactivate
 * @param {number} userId - User ID
 * @returns {Promise<void>} (200 OK, no content)
 */
export const deactivateUser = async (userId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}/deactivate`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to deactivate user");
		}
	} catch (error) {
		console.error("Deactivate user error:", error);
		throw error;
	}
};

/**
 * Delete user (soft delete)
 * DELETE /api/users/{id}
 * @param {number} userId - User ID
 * @returns {Promise<void>} (204 NO CONTENT)
 */
export const deleteUser = async (userId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${userId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to delete user");
		}
	} catch (error) {
		console.error("Delete user error:", error);
		throw error;
	}
};

export default {
	registerUser,
	loginUser,
	refreshToken,
	getUserById,
	getUserByEmail,
	getUsersByRole,
	emailExists,
	getAllUsers,
	updateUser,
	updateUserStatus,
	updateLastSeen,
	changePassword,
	activateUser,
	deactivateUser,
	deleteUser,
};
