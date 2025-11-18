/**
 * User API Service
 * Base URL: /api/users
 * All user-related API requests
 */

import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/users`;

/**
 * Register a new user
 * POST /api/users/register
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.telephone - User's telephone number
 * @param {string} userData.password - User's password
 * @param {string} userData.userRole - User's role (DEVELOPER or CLIENT)
 * @returns {Promise<Object>} Response with user data
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

		// Check if response has content
		const contentType = response.headers.get("content-type");
		let data = null;
		
		if (contentType && contentType.includes("application/json")) {
			const text = await response.text();
			if (text) {
				data = JSON.parse(text);
			}
		}

		if (!response.ok) {
			throw new Error(data?.message || data?.error || `Registration failed with status ${response.status}`);
		}

		return data || { success: true };
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
 * @returns {Promise<Object>} Response with user data and tokens (accessToken, refreshToken)
 */
export const loginUser = async (credentials) => {
	try {
		console.log('Attempting login to:', `${BASE_URL}/login`);
		console.log('With credentials:', { email: credentials.email, password: '***' });
		
		const response = await fetch(`${BASE_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: 'include', // Include cookies for CSRF token
			body: JSON.stringify(credentials),
		});

		console.log('Response status:', response.status);
		console.log('Response headers:', Object.fromEntries(response.headers.entries()));

		// Check if response has content
		const contentType = response.headers.get("content-type");
		let data = null;
		
		if (contentType && contentType.includes("application/json")) {
			const text = await response.text();
			console.log('Response text:', text);
			if (text) {
				data = JSON.parse(text);
			}
		} else {
			// Try to read as text for error messages
			const text = await response.text();
			console.log('Non-JSON response:', text);
			if (text) {
				data = { message: text };
			}
		}

		if (!response.ok) {
			const errorMsg = data?.message || data?.error || data?.status || `Login failed with status ${response.status}`;
			console.error('Login failed:', errorMsg);
			throw new Error(errorMsg);
		}

		console.log('Login successful, data:', data);
		return data || { success: true };
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to fetch user");
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} User data
 */
export const getUserByEmail = async (email, token) => {
	try {
		const response = await fetch(`${BASE_URL}/email/${email}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to fetch user");
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
 * @param {string} role - User role (DEVELOPER or CLIENT)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Array>} List of users with specified role
 */
export const getUsersByRole = async (role, token) => {
	try {
		const response = await fetch(`${BASE_URL}/role/${role}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Array>} List of all users
 */
export const getAllUsers = async (token) => {
	try {
		const response = await fetch(`${BASE_URL}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, userData, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} status - User status (ACTIVE, INACTIVE, SUSPENDED, DELETED)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const updateUserStatus = async (userId, status, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}/status?status=${status}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const updateLastSeen = async (userId, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}/last-seen`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, passwordData, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}/change-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify(passwordData),
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const activateUser = async (userId, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}/activate`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const deactivateUser = async (userId, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}/deactivate`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to deactivate user");
		}
	} catch (error) {
		console.error("Deactivate user error:", error);
		throw error;
	}
};

/**
 * Delete user
 * DELETE /api/users/{id}
 * @param {number} userId - User ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId, token) => {
	try {
		const response = await fetch(`${BASE_URL}/${userId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
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
