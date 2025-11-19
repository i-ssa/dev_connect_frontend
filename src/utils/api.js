// ==============================================
// COMPLETE API HELPER - ALL ENDPOINTS
// ==============================================

const API_BASE_URL = 'http://localhost:8081/api';

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ============ AUTHENTICATION ============
async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return await response.json();
}

async function login(email, password) {
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
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('userId', data.user.userId);
  return data;
}

// ============ USERS ============
async function getAllUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return await response.json();
}

async function getUserById(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return await response.json();
}

async function updateUser(userId, userData) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  return await response.json();
}

async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.ok;
}

async function getCurrentDeveloperProfile() {
  const response = await fetch(`${API_BASE_URL}/users/me/developer`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch developer profile');
  }
  
  return await response.json();
}

// ============ PROJECTS ============
async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create project');
  }
  
  return await response.json();
}

async function getAllProjects() {
  const response = await fetch(`${API_BASE_URL}/projects/all`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return await response.json();
}

async function getPendingProjects() {
  const response = await fetch(`${API_BASE_URL}/projects/pending`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending projects');
  }
  
  return await response.json();
}

async function getProjectById(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  
  return await response.json();
}

async function getMyDeveloperProjects() {
  const response = await fetch(`${API_BASE_URL}/projects/my-developer-projects`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch developer projects');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

async function getProjectsByDeveloperId(devId) {
  const response = await fetch(`${API_BASE_URL}/projects/developer/${devId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return await response.json();
}

async function getProjectsByClientId(clientId) {
  const response = await fetch(`${API_BASE_URL}/projects/client/${clientId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

async function claimProject(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/claim`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to claim project');
  }
  
  return await response.json();
}

async function updateProjectStatus(projectId, status) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update project status');
  }
  
  return await response.json();
}

async function updateProject(projectId, projectData) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  
  return await response.json();
}

async function deleteProject(projectId) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  return response.ok;
}

// ============ DEVELOPERS ============
async function getAllDevelopers() {
  const response = await fetch(`${API_BASE_URL}/developers/all`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch developers');
  }
  
  return await response.json();
}

async function getAllDevelopersWithStats() {
  const response = await fetch(`${API_BASE_URL}/developers/all-with-stats`);
  
  if (!response.ok) {
    // Fallback to basic endpoint if stats endpoint doesn't exist yet
    console.warn('Stats endpoint not available, using basic developer endpoint');
    return getAllDevelopers();
  }
  
  return await response.json();
}

// ============ RATINGS ============
async function createRating(clientId, developerId, rating, comment) {
  const response = await fetch(`${API_BASE_URL}/ratings/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ clientId, developerId, rating, comment })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create rating');
  }
  
  return await response.json();
}

async function getDeveloperRatings(developerId) {
  const response = await fetch(`${API_BASE_URL}/ratings/developer/${developerId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch developer ratings');
  }
  
  return await response.json();
}

async function getDeveloperAverageRating(developerId) {
  const response = await fetch(`${API_BASE_URL}/ratings/developer/${developerId}/average`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch average rating');
  }
  
  return await response.json();
}

// ============ MESSAGES ============
async function getUserChats(userId) {
  const response = await fetch(`${API_BASE_URL}/messages/chats/${userId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  
  return await response.json();
}

async function getConversation(userId1, userId2) {
  const response = await fetch(`${API_BASE_URL}/messages/conversation?userId1=${userId1}&userId2=${userId2}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  
  return await response.json();
}

async function getConversationMessages(conversationId, userId) {
  const response = await fetch(`${API_BASE_URL}/messages/conversation/${conversationId}?userId=${userId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversation messages');
  }
  
  return await response.json();
}

async function sendMessage(senderId, receiverId, text) {
  const response = await fetch(`${API_BASE_URL}/messages/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ senderId, receiverId, text })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return await response.json();
}

async function markMessagesAsRead(conversationId, readerId) {
  const response = await fetch(`${API_BASE_URL}/messages/read?conversationId=${conversationId}&readerId=${readerId}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark messages as read');
  }
  
  return await response.json();
}

async function updateUserStatus(userId, status) {
  const response = await fetch(`${API_BASE_URL}/messages/status/${userId}?status=${status}`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user status');
  }
  
  return await response.json();
}

async function getUserStatus(userId) {
  const response = await fetch(`${API_BASE_URL}/messages/status/${userId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user status');
  }
  
  const data = await response.json();
  return data.status;
}

// ============ EXPORT ALL FUNCTIONS ============
const api = {
  // Auth
  register,
  login,
  
  // Users
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentDeveloperProfile,
  
  // Projects
  createProject,
  getAllProjects,
  getPendingProjects,
  getProjectById,
  getMyDeveloperProjects,
  getProjectsByDeveloperId,
  getProjectsByClientId,
  claimProject,
  updateProjectStatus,
  updateProject,
  deleteProject,
  
  // Developers
  getAllDevelopers,
  getAllDevelopersWithStats,
  
  // Ratings
  createRating,
  getDeveloperRatings,
  getDeveloperAverageRating,
  
  // Messages
  getUserChats,
  getConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  updateUserStatus,
  getUserStatus
};

export default api;
