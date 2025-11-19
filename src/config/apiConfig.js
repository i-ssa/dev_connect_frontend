// API configuration helpers kept for backward compatibility with legacy API modules
import ApiService from '../services/ApiService';
import { API_BASE_URL } from './constants';

export { API_BASE_URL } from './constants';

/**
 * Get authorization headers with JWT token
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => ApiService.getAuthHeaders();

/**
 * Refresh the access token using refresh token
 * @returns {Promise<Object>} New tokens and user data
 */
export const refreshAccessToken = async () => ApiService.refreshAccessToken();

/**
 * Fetch wrapper that includes JWT token and handles token refresh
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const authenticatedFetch = async (url, options = {}) => ApiService.authorizedFetch(url, options);

/**
 * Parse error response from API
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed error object
 */
export const parseErrorResponse = async (response) => {
    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            const text = await response.text();
            return { message: text || 'An error occurred' };
        }
    } catch (error) {
        return { message: 'Failed to parse error response' };
    }
};
