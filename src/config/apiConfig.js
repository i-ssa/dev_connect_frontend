// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

/**
 * Get authorization headers with JWT token
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<Object>} New tokens and user data
 */
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        
        // Update stored tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    } catch (error) {
        // Refresh failed, clear everything and redirect to login
        localStorage.clear();
        window.location.href = '/';
        throw error;
    }
};

/**
 * Fetch wrapper that includes JWT token and handles token refresh
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const authenticatedFetch = async (url, options = {}) => {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers
    };

    let response = await fetch(url, {
        ...options,
        headers
    });

    // Handle token expiration - try to refresh
    if (response.status === 401) {
        try {
            await refreshAccessToken();
            
            // Retry the request with new token
            const newHeaders = {
                ...getAuthHeaders(),
                ...options.headers
            };
            
            response = await fetch(url, {
                ...options,
                headers: newHeaders
            });
        } catch (error) {
            // Refresh failed, user will be redirected to login
            throw error;
        }
    }

    return response;
};

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
