// API service for REST endpoints
import { API_BASE_URL } from '../config/apiConfig';

class ApiService {
  /**
   * Get auth headers including token if available
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Get token from localStorage - backend expects 'token' key with accessToken
    const token = localStorage.getItem('token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ No token found! Authorization header NOT added.');
      console.log('Storage check:', {
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId')
      });
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
    
    const data = await response.json();
    
    // Save token and userId to localStorage (matching backend pattern)
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    if (data.user && data.user.userId) {
      localStorage.setItem('userId', data.user.userId);
    }
    
    return data;
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
    const response = await fetch(`${API_BASE_URL}/messages/chats/${userId}`, {
      headers: this.getAuthHeaders()
    });
    
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
      `${API_BASE_URL}/messages/conversation?userId1=${userId1}&userId2=${userId2}`,
      {
        headers: this.getAuthHeaders()
      }
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
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ senderId, receiverId, text })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  }

  /**
   * Update user status (for messaging)
   */
  async updateUserStatus(userId, status) {
    const response = await fetch(`${API_BASE_URL}/messages/status/${userId}?status=${status}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
    
    return response.json();
  }

  /**
   * Get user status
   */
  async getUserStatus(userId) {
    const response = await fetch(`${API_BASE_URL}/messages/status/${userId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user status');
    }
    
    const data = await response.json();
    return data.status;
  }

  /**
   * Mark messages as read
   * @param {number} conversationId - The conversation ID
   * @param {number} readerId - The user marking messages as read
   */
  async markMessagesAsRead(conversationId, readerId) {
    const response = await fetch(
      `${API_BASE_URL}/messages/read?conversationId=${conversationId}&readerId=${readerId}`,
      { 
        method: 'PUT',
        headers: this.getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
    
    return response.json();
  }

  /**
   * Get conversation messages by conversation ID
   * @param {number} conversationId - The conversation ID
   * @param {number} userId - The current user ID
   */
  async getConversationMessages(conversationId, userId) {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversation/${conversationId}?userId=${userId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation messages');
    }
    
    return response.json();
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Get all projects for a specific client
   */
  async getProjectsByClient(clientId) {
    const response = await fetch(`${API_BASE_URL}/projects/client/${clientId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch client projects');
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  /**
   * Get all projects for the current logged-in developer
   */
  async getProjectsByDeveloper(devId) {
    const response = await fetch(`${API_BASE_URL}/projects/my-developer-projects`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch developer projects');
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: this.getAuthHeaders()
    });
    
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
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch projects');
    }
    
    return response.json();
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status) {
    const response = await fetch(`${API_BASE_URL}/projects/status/${status}`, {
      headers: this.getAuthHeaders()
    });
    
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
    const response = await fetch(`${API_BASE_URL}/projects/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create project');
    }
    
    return response.json();
  }

  /**
   * Get pending projects (not yet claimed)
   */
  async getPendingProjects() {
    const response = await fetch(`${API_BASE_URL}/projects/pending`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch pending projects');
    }
    
    return response.json();
  }

  /**
   * Claim a project (developer claims a pending project)
   */
  async claimProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/claim`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to claim project');
    }
    
    return response.json();
  }

  /**
   * Update project status
   */
  async updateProjectStatus(projectId, status) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update project status');
    }
    
    return response.json();
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId, projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update project');
    }
    
    return response.json();
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete project');
    }
    
    return response.ok;
  }

  // ==================== DEVELOPER METHODS ====================

  /**
   * Get all developers
   */
  async getAllDevelopers() {
    const response = await fetch(`${API_BASE_URL}/developers/all`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch developers');
    }
    
    return response.json();
  }

  /**
   * Get all developers with stats (completed projects and average rating)
   * This is a more efficient endpoint than fetching developers + stats separately
   */
  async getAllDevelopersWithStats() {
    const response = await fetch(`${API_BASE_URL}/developers/all-with-stats`);
    
    if (!response.ok) {
      // Fallback to basic endpoint if stats endpoint doesn't exist yet
      console.warn('Stats endpoint not available, using basic developer endpoint');
      return this.getAllDevelopers();
    }
    
    return response.json();
  }

  /**
   * Get current developer profile
   */
  async getCurrentDeveloperProfile() {
    const response = await fetch(`${API_BASE_URL}/users/me/developer`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch developer profile');
    }
    
    return response.json();
  }

  // ==================== RATING METHODS ====================

  /**
   * Create a rating for a developer
   */
  async createRating(clientId, developerId, rating, comment) {
    const response = await fetch(`${API_BASE_URL}/ratings/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ clientId, developerId, rating, comment })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create rating');
    }
    
    return response.json();
  }

  /**
   * Get all ratings for a developer
   */
  async getDeveloperRatings(developerId) {
    const response = await fetch(`${API_BASE_URL}/ratings/developer/${developerId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch developer ratings');
    }
    
    return response.json();
  }

  /**
   * Get average rating for a developer
   */
  async getDeveloperAverageRating(developerId) {
    const response = await fetch(`${API_BASE_URL}/ratings/developer/${developerId}/average`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch average rating');
    }
    
    return response.json();
  }

  /**
   * Update user (for profile updates)
   */
  async markProjectCompleted(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/complete`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
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
    const response = await fetch(`${API_BASE_URL}/projects/delete/${projectId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
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
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/claim`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
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
   * Update project status
   * @param {number} projectId 
   * @param {string} status - New status (e.g., 'COMPLETED', 'IN_PROGRESS')
   */
  async updateProjectStatus(projectId, status) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update project status');
    }
    
    return response.json();
  }

  /**
   * Get all developers with their stats (optimized - single call)
   * Backend should return developers with completedProjects and averageRating
   */
  async getAllDevelopers() {
    const response = await fetch(`${API_BASE_URL}/developers/all-with-stats`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      // Fallback to basic endpoint if stats endpoint doesn't exist
      const basicResponse = await fetch(`${API_BASE_URL}/developers/all`, {
        headers: this.getAuthHeaders()
      });
      
      if (!basicResponse.ok) {
        const errorData = await basicResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch developers');
      }
      
      const developers = await basicResponse.json();
      // Return with default stats if backend doesn't support stats endpoint yet
      return developers.map(dev => ({
        ...dev,
        completedProjects: 0,
        averageRating: 0
      }));
    }
    
    return response.json();
  }

  /**
   * Submit a rating for a developer
   */
  async rateDeveloper(ratingData) {
    const response = await fetch(`${API_BASE_URL}/ratings/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ratingData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit rating');
    }
    
    return response.json();
  }

  /**
   * Get ratings for a developer
   */
  async getDeveloperRatings(developerId) {
    const response = await fetch(`${API_BASE_URL}/ratings/developer/${developerId}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch ratings');
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

    const headers = {};
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('devconnect_token') ||
                  (JSON.parse(localStorage.getItem('devconnect_user') || '{}').token) ||
                  (JSON.parse(localStorage.getItem('devconnect_user') || '{}').accessToken);
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload project files');
    }
    
    return response.json();
  }
}

export default new ApiService();
