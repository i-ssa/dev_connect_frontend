/**
 * Project API Service
 * Base URL: /api/projects
 * All project-related API requests
 */

import { API_BASE_URL, authenticatedFetch, parseErrorResponse } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/projects`;

/**
 * Create a new project
 * POST /api/projects/create
 * @param {Object} projectData - Project data
 * @param {string} projectData.projectName - Project name (required, cannot be empty)
 * @param {number} projectData.devId - Developer user ID (required)
 * @param {number} projectData.clientId - Client user ID (required)
 * @param {string} projectData.description - Project description (optional)
 * @param {number} projectData.projectBudget - Project budget (optional, decimal)
 * @param {string} projectData.timeline - Project timeline (optional, ISO 8601 format)
 * @returns {Promise<Object>} Created project data (201 CREATED)
 */
export const createProject = async (projectData) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/create`, {
			method: "POST",
			body: JSON.stringify(projectData),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to create project");
		}

		return await response.json();
	} catch (error) {
		console.error("Create project error:", error);
		throw error;
	}
};

/**
 * Update an existing project
 * PUT /api/projects/update/{projectId}
 * @param {number} projectId - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise<Object>} Updated project data (200 OK)
 */
export const updateProject = async (projectId, projectData) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/update/${projectId}`, {
			method: "PUT",
			body: JSON.stringify(projectData),
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to update project");
		}

		return await response.json();
	} catch (error) {
		console.error("Update project error:", error);
		throw error;
	}
};

/**
 * Delete a project
 * DELETE /api/projects/delete/{projectId}
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Success message (200 OK)
 */
export const deleteProject = async (projectId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/delete/${projectId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to delete project");
		}

		return await response.json();
	} catch (error) {
		console.error("Delete project error:", error);
		throw error;
	}
};

/**
 * Get project by ID
 * GET /api/projects/{projectId}
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Project data (200 OK)
 */
export const getProjectById = async (projectId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${projectId}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Project not found");
		}

		return await response.json();
	} catch (error) {
		console.error("Get project error:", error);
		throw error;
	}
};

/**
 * Get all projects
 * GET /api/projects
 * @returns {Promise<Array>} List of all projects (200 OK)
 */
export const getAllProjects = async () => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to fetch projects");
		}

		return await response.json();
	} catch (error) {
		console.error("Get all projects error:", error);
		throw error;
	}
};

/**
 * Get projects by developer ID
 * GET /api/projects/developer/{devId}
 * @param {number} devId - Developer user ID
 * @returns {Promise<Array>} List of developer's projects (200 OK)
 */
export const getProjectsByDeveloper = async (devId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/developer/${devId}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "No projects found for this developer");
		}

		return await response.json();
	} catch (error) {
		console.error("Get projects by developer error:", error);
		throw error;
	}
};

/**
 * Get projects by client ID
 * GET /api/projects/client/{clientId}
 * @param {number} clientId - Client user ID
 * @returns {Promise<Array>} List of client's projects (200 OK)
 */
export const getProjectsByClient = async (clientId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/client/${clientId}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "No projects found for this client");
		}

		return await response.json();
	} catch (error) {
		console.error("Get projects by client error:", error);
		throw error;
	}
};

/**
 * Get projects by status
 * GET /api/projects/status/{status}
 * @param {string} status - Project status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Promise<Array>} List of projects with specified status (200 OK)
 */
export const getProjectsByStatus = async (status) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/status/${status}`, {
			method: "GET",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "No projects found with this status");
		}

		return await response.json();
	} catch (error) {
		console.error("Get projects by status error:", error);
		throw error;
	}
};

/**
 * Mark project as completed
 * PATCH /api/projects/{projectId}/complete
 * @param {number} projectId - Project ID
 * @returns {Promise<Object>} Updated project data (200 OK)
 */
export const markProjectComplete = async (projectId) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${projectId}/complete`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to mark project as completed");
		}

		return await response.json();
	} catch (error) {
		console.error("Mark project complete error:", error);
		throw error;
	}
};

/**
 * Update project status
 * PATCH /api/projects/{projectId}/status
 * @param {number} projectId - Project ID
 * @param {string} status - New status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Promise<Object>} Updated project data (200 OK)
 */
export const updateProjectStatus = async (projectId, status) => {
	try {
		const response = await authenticatedFetch(`${BASE_URL}/${projectId}/status?status=${status}`, {
			method: "PATCH",
		});

		if (!response.ok) {
			const error = await parseErrorResponse(response);
			throw new Error(error.message || "Failed to update project status");
		}

		return await response.json();
	} catch (error) {
		console.error("Update project status error:", error);
		throw error;
	}
};

export default {
	createProject,
	updateProject,
	deleteProject,
	getProjectById,
	getAllProjects,
	getProjectsByDeveloper,
	getProjectsByClient,
	getProjectsByStatus,
	markProjectComplete,
	updateProjectStatus,
};
