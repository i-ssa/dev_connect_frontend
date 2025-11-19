// API service for REST endpoints
import { API_BASE_URL } from '../config/constants';

class ApiService {
  constructor() {
    this.tokenExpiryBufferMs = 30 * 1000; // refresh 30s before expiry
    this.refreshPromise = null;
  }

  getStoredTokens() {
    let storedUser = {};
    try {
      const userStr = localStorage.getItem('devconnect_user');
      storedUser = userStr ? JSON.parse(userStr) : {};
    } catch {
      storedUser = {};
    }

    const accessToken =
      localStorage.getItem('devconnect_token') ||
      localStorage.getItem('token') ||
      storedUser.accessToken ||
      storedUser.token;

    const refreshToken =
      localStorage.getItem('devconnect_refresh_token') ||
      localStorage.getItem('refreshToken') ||
      storedUser.refreshToken;

    const storedExpiry = Number(localStorage.getItem('devconnect_access_expires_at') || storedUser.accessExpiresAt || 0);
    const decodedExpiry = accessToken ? this.decodeTokenExpiry(accessToken) : 0;

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: storedExpiry || decodedExpiry || 0
    };
  }

  decodeTokenExpiry(token) {
    try {
      if (!token || token.split('.').length < 2) {
        return 0;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.exp ? payload.exp * 1000 : 0;
    } catch {
      return 0;
    }
  }

  persistTokens({ accessToken, refreshToken, user }) {
    if (accessToken) {
      localStorage.setItem('devconnect_token', accessToken);
      localStorage.setItem('token', accessToken);
      const expiresAt = this.decodeTokenExpiry(accessToken);
      if (expiresAt) {
        localStorage.setItem('devconnect_access_expires_at', String(expiresAt));
      }
    }

    if (refreshToken) {
      localStorage.setItem('devconnect_refresh_token', refreshToken);
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (user) {
      const normalizedUser = {
        ...user,
        id: user.userId || user.id,
        userId: user.userId || user.id,
        accessToken: accessToken || user.accessToken,
        refreshToken: refreshToken || user.refreshToken,
        accessExpiresAt: Number(localStorage.getItem('devconnect_access_expires_at')) || user.accessExpiresAt
      };
      localStorage.setItem('devconnect_user', JSON.stringify(normalizedUser));
    }
  }

  clearStoredAuth() {
    localStorage.removeItem('devconnect_token');
    localStorage.removeItem('token');
    localStorage.removeItem('devconnect_refresh_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('devconnect_access_expires_at');
    localStorage.removeItem('devconnect_user');
  }

  async ensureFreshAccessToken() {
    const { accessToken, refreshToken, accessExpiresAt } = this.getStoredTokens();

    if (!accessToken && refreshToken) {
      await this.refreshAccessToken();
      return;
    }

    if (!accessToken) {
      return;
    }

    if (accessExpiresAt && Date.now() >= accessExpiresAt - this.tokenExpiryBufferMs) {
      await this.refreshAccessToken();
    }
  }

  async refreshAccessToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const { refreshToken } = this.getStoredTokens();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/users/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      this.persistTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        user: data.user
      });

      return data;
    })()
      .catch((error) => {
        this.handleAuthFailure(error);
        throw error;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  handleAuthFailure(error) {
    this.clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
      window.location.href = '/';
    }
    return error;
  }

  async authorizedFetch(url, options = {}) {
    const {
      useAuth = true,
      setJson = true,
      ...fetchOptions
    } = options;
    const isFormData = fetchOptions.body instanceof FormData;

    if (useAuth) {
      await this.ensureFreshAccessToken();
    }

    const headers = {
      ...(fetchOptions.headers || {})
    };

    if (!isFormData && setJson) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (useAuth) {
      const { accessToken } = this.getStoredTokens();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    let response = await fetch(url, {
      ...fetchOptions,
      headers
    });

    if (useAuth && response.status === 401) {
      try {
        await this.refreshAccessToken();
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${this.getStoredTokens().accessToken}`
        };

        response = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders
        });
      } catch (error) {
        throw this.handleAuthFailure(error);
      }
    }

    return response;
  }

  /**
   * Legacy helper retained for backward compatibility (synchronous callers)
   */
  getAuthHeaders() {
    const { accessToken } = this.getStoredTokens();
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }
  /**
   * Register a new user
   */
  async register(username, email, password, role) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return response.json();
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId) {
    const response = await fetch(`${API_BASE_URL}/messages/chats/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    
    return response.json();
  }

  /**
   * Get conversation between two users
   */
  async getConversation(userId1, userId2) {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation?userId1=${userId1}&userId2=${userId2}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    
    return response.json();
  }

  /**
   * Send a message via REST API (alternative to WebSocket)
   */
  async sendMessage(senderId, receiverId, text, projectId) {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, text, projectId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  }

  /**
   * Get user status
   */
  async getUserStatus(userId) {
    const response = await fetch(`${API_BASE_URL}/messages/status/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user status');
    }
    
    const data = await response.json();
    return data.status;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(receiverId, senderId) {
    const response = await fetch(
      `${API_BASE_URL}/messages/read?senderId=${senderId}&receiverId=${receiverId}`,
      { method: 'PUT' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
    
    return response.json();
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Get all projects for a specific client
   */
  async getProjectsByClient(clientId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/client/${clientId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch client projects');
    }
    
    return response.json();
  }

  /**
   * Get all projects for a specific developer
   */
  async getProjectsByDeveloper(devId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/developer/${devId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch developer projects');
    }
    
    return response.json();
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/${projectId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch project');
    }
    
    return response.json();
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch projects');
    }
    
    return response.json();
  }

  async getUnclaimedProjects() {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/unclaimed`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch unclaimed projects');
    }

    return response.json();
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/status/${status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch projects by status');
    }
    
    return response.json();
  }

  /**
   * Create a new project
   * @param {Object} projectData - ProjectRequestDTO shape: { projectName, description, projectBudget, timeline, clientId, devId }
   */
  async createProject(projectData) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/create`, {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create project');
    }
    
    return response.json();
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId, projectData) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/update/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update project');
    }
    
    return response.json();
  }

  /**
   * Update project status
   */
  async updateProjectStatus(projectId, status) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/${projectId}/status?status=${status}`, {
      method: 'PATCH'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update project status');
    }
    
    return response.json();
  }

  /**
   * Mark project as completed
   */
  async markProjectCompleted(projectId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/${projectId}/complete`, {
      method: 'PATCH'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to mark project as completed');
    }
    
    return response.json();
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/delete/${projectId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete project');
    }
    
    return response.ok;
  }

  /**
   * Claim a project (atomic operation)
   * @param {number} projectId 
   * @param {number} devId 
   */
  async claimProject(projectId, devId) {
    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/${projectId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ devId })
    });
    
    if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Project already claimed by another developer');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to claim project');
    }
    
    return response.json();
  }

  /**
   * Upload files for a project (stub - requires backend endpoint)
   * @param {number} projectId 
   * @param {File[]} files 
   */
  async uploadProjectFiles(projectId, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await this.authorizedFetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
      setJson: false
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload project files');
    }
    
    return response.json();
  }
}

export default new ApiService();
