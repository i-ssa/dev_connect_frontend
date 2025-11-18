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

    // Try to get token from localStorage (multiple possible keys)
    let token = localStorage.getItem('token') || 
                localStorage.getItem('devconnect_token');
    
    // Fallback: check if token is inside devconnect_user object
    if (!token) {
      try {
        const userStr = localStorage.getItem('devconnect_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          token = user.token || user.accessToken;
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ No token found! Authorization header NOT added.');
      console.log('Storage check:', {
        token: localStorage.getItem('token'),
        devconnect_token: localStorage.getItem('devconnect_token'),
        devconnect_user: localStorage.getItem('devconnect_user')
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
    const response = await fetch(`${API_BASE_URL}/projects/client/${clientId}`, {
      headers: this.getAuthHeaders()
    });
    
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
    const response = await fetch(`${API_BASE_URL}/projects/developer/${devId}`, {
      headers: this.getAuthHeaders()
    });
    
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
   * Update an existing project
   */
  async updateProject(projectId, projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/update/${projectId}`, {
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
   * Update project status
   */
  async updateProjectStatus(projectId, status) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status?status=${status}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
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
