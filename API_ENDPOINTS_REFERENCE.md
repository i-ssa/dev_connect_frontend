# Backend API Endpoints Reference

Complete reference for all backend endpoints implemented in `ApiService.js`.

## Base URL
```
http://localhost:8081/api
```

## Authentication Pattern
All endpoints except `register` and `login` require JWT authentication:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${token}'
}
```

Token is stored in: `localStorage.getItem('token')`
User ID is stored in: `localStorage.getItem('userId')`

---

## 📝 Authentication Endpoints

### Register User
```javascript
POST /users/register
Body: { username, email, password, role }
Response: { user, accessToken }
```

### Login
```javascript
POST /users/login
Body: { email, password }
Response: { user: { userId, username, email, role }, accessToken }
```

**Note:** Frontend automatically saves:
- `accessToken` → `localStorage.setItem('token')`
- `user.userId` → `localStorage.setItem('userId')`

---

## 👤 User Endpoints

### Get All Users
```javascript
GET /users
Headers: Authorization Required
Response: [ { userId, username, email, role, ... }, ... ]
```

### Get User by ID
```javascript
GET /users/{userId}
Headers: Authorization Required
Response: { userId, username, email, role, ... }
```

### Update User
```javascript
PUT /users/{userId}
Headers: Authorization Required
Body: { username?, email?, ... }
Response: Updated user object
```

### Delete User
```javascript
DELETE /users/{userId}
Headers: Authorization Required
Response: 200 OK
```

### Get Current Developer Profile
```javascript
GET /users/me/developer
Headers: Authorization Required
Response: Developer profile with user info
```

---

## 📂 Project Endpoints

### Create Project
```javascript
POST /projects/create
Headers: Authorization Required
Body: { 
  projectName, 
  description, 
  projectBudget, 
  timeline, 
  clientId, 
  devId? // Optional - can be null initially
}
Response: Created project object
```

**Important:** Database column `dev_id` must be **NULLABLE** for clients to create projects without assigning a developer.

### Get All Projects
```javascript
GET /projects/all
Response: Array of all projects
```

### Get Pending Projects
```javascript
GET /projects/pending
Response: Array of projects with status = PENDING (not yet claimed)
```

### Get Project by ID
```javascript
GET /projects/{projectId}
Response: Project object
```

### Get My Developer Projects
```javascript
GET /projects/my-developer-projects
Headers: Authorization Required (uses JWT to identify developer)
Response: Array of projects for authenticated developer
```

### Get Projects by Developer ID
```javascript
GET /projects/developer/{devId}
Headers: Authorization Required
Response: Array of projects for specific developer
```

### Get Projects by Client ID
```javascript
GET /projects/client/{clientId}
Headers: Authorization Required
Response: Array of projects for specific client
```

### Claim Project
```javascript
POST /projects/{projectId}/claim
Headers: Authorization Required (uses JWT to identify developer)
Response: Updated project with devId assigned
```

### Update Project Status
```javascript
PUT /projects/{projectId}/status
Headers: Authorization Required
Body: { status } // e.g., "IN_PROGRESS", "COMPLETED", "PENDING"
Response: Updated project
```

### Update Project
```javascript
PUT /projects/{projectId}
Headers: Authorization Required
Body: { projectName?, description?, budget?, ... }
Response: Updated project
```

### Delete Project
```javascript
DELETE /projects/{projectId}
Headers: Authorization Required
Response: 200 OK
```

---

## 👨‍💻 Developer Endpoints

### Get All Developers
```javascript
GET /developers/all
Response: Array of all developers (basic info)
```

### Get All Developers with Stats
```javascript
GET /developers/all-with-stats
Response: Array of developers with:
  - completedProjects count
  - averageRating
  - other stats
```

**Note:** Falls back to `/developers/all` if stats endpoint not implemented yet.

---

## ⭐ Rating Endpoints

### Create Rating
```javascript
POST /ratings/create
Headers: Authorization Required
Body: { clientId, developerId, rating, comment }
Response: Created rating object
```

### Get Developer Ratings
```javascript
GET /ratings/developer/{developerId}
Headers: Authorization Required
Response: Array of all ratings for developer
```

### Get Developer Average Rating
```javascript
GET /ratings/developer/{developerId}/average
Headers: Authorization Required
Response: { averageRating: number }
```

---

## 💬 Message Endpoints

### Get User Chats
```javascript
GET /messages/chats/{userId}
Headers: Authorization Required
Response: Array of chat/conversation objects with:
  - conversationId
  - otherUser info
  - lastMessage
  - unreadCount
```

### Get Conversation (by users)
```javascript
GET /messages/conversation?userId1={userId1}&userId2={userId2}
Headers: Authorization Required
Response: { 
  conversationId, 
  messages: [ { id, senderId, receiverId, text, timestamp, status }, ... ] 
}
```

### Get Conversation Messages (by conversationId)
```javascript
GET /messages/conversation/{conversationId}?userId={userId}
Headers: Authorization Required
Response: Array of messages in conversation
```

### Send Message (REST API)
```javascript
POST /messages/send
Headers: Authorization Required
Body: { senderId, receiverId, text }
Response: Created message object
```

**Note:** Real-time messaging uses WebSocket (see below), this is fallback/sync.

### Mark Messages as Read
```javascript
PUT /messages/read?conversationId={conversationId}&readerId={readerId}
Headers: Authorization Required
Response: Updated messages
```

### Update User Status
```javascript
PUT /messages/status/{userId}?status={status}
Headers: Authorization Required
Status values: ONLINE, OFFLINE, AWAY
Response: Updated status
```

### Get User Status
```javascript
GET /messages/status/{userId}
Headers: Authorization Required
Response: { status: "ONLINE" | "OFFLINE" | "AWAY" }
```

---

## 🔌 WebSocket Messaging

### Connect to WebSocket
```javascript
URL: ws://localhost:8081/ws
Protocol: SockJS + STOMP

// Connect with JWT token
const socket = new SockJS('http://localhost:8081/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: `Bearer ${token}` },  // Connect headers
  onConnectCallback,
  onErrorCallback
);
```

### Subscribe to Private Messages
```javascript
stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
  const msg = JSON.parse(message.body);
  // Handle received message
});
```

### Subscribe to Typing Indicators
```javascript
stompClient.subscribe(`/user/${userId}/queue/typing`, (message) => {
  const typingData = JSON.parse(message.body);
  // { senderId, receiverId, isTyping }
});
```

### Subscribe to Read Receipts
```javascript
stompClient.subscribe(`/user/${userId}/queue/read-receipts`, (message) => {
  const receipt = JSON.parse(message.body);
  // Handle read receipt
});
```

### Subscribe to User Status Updates (Public Topic)
```javascript
stompClient.subscribe('/topic/user-status', (message) => {
  const status = JSON.parse(message.body);
  // { userId, status: "ONLINE" | "OFFLINE" | "AWAY" }
});
```

### Send Message (WebSocket)
```javascript
stompClient.publish({
  destination: '/app/chat',
  body: JSON.stringify({
    senderId: currentUserId,
    receiverId: otherUserId,
    text: messageText,
    projectId: projectId
  })
});
```

### Send Typing Indicator
```javascript
stompClient.publish({
  destination: '/app/typing',
  body: JSON.stringify({
    senderId: currentUserId,
    receiverId: otherUserId,
    isTyping: true
  })
});
```

### Mark Messages as Read (WebSocket)
```javascript
stompClient.publish({
  destination: '/app/messages-read',
  body: JSON.stringify({
    senderId: senderId,
    receiverId: currentUserId
  })
});
```

---

## 📁 File Upload Endpoints

### Upload Project Files
```javascript
POST /projects/{projectId}/files
Headers: Authorization Required (no Content-Type, uses FormData)
Body: FormData with files
Response: Array of uploaded file URLs/info
```

**Note:** This endpoint may need backend implementation.

---

## ❌ Error Handling

All endpoints follow consistent error pattern:
```javascript
// Success (200-299)
{ ...data }

// Error (400-599)
{
  message: "Error description",
  status: 400,
  timestamp: "2024-01-01T12:00:00"
}
```

Frontend `ApiService` automatically:
- Throws errors with message
- Handles empty responses
- Adds authentication headers

---

## 🔧 Frontend Usage Examples

### Login and Store Token
```javascript
const data = await ApiService.login('user@example.com', 'password');
// Token and userId automatically saved to localStorage
```

### Create Project
```javascript
const project = await ApiService.createProject({
  projectName: 'My App',
  description: 'Build a mobile app',
  projectBudget: 5000,
  timeline: '3 months',
  clientId: 123,
  devId: null  // Can be null initially
});
```

### Send Message
```javascript
const message = await ApiService.sendMessage(
  currentUserId,
  recipientUserId,
  'Hello!'
);
```

### Get Conversation
```javascript
const conversation = await ApiService.getConversation(userId1, userId2);
const messages = conversation.messages || [];
const conversationId = conversation.conversationId;

// Mark as read
await ApiService.markMessagesAsRead(conversationId, currentUserId);
```

### Rate Developer
```javascript
await ApiService.createRating(
  clientId,
  developerId,
  5,  // rating (1-5)
  'Great work!'
);
```

---

## 📋 Required Backend Database Fixes

### 1. Make `dev_id` Nullable
```sql
ALTER TABLE projects ALTER COLUMN dev_id DROP NOT NULL;
```

Or in JPA Entity:
```java
@Column(name = "dev_id", nullable = true)
private Long devId;
```

### 2. Implement Missing Endpoints (Priority)
- `GET /developers/all-with-stats` - Returns developers with completedProjects and averageRating
- `POST /ratings/create` - Create rating for developer
- `GET /ratings/developer/{id}/average` - Get average rating

---

## 🔑 localStorage Keys Used

- `token` - JWT access token
- `userId` - Current user's ID
- `devconnect_user` - Full user object (for backward compatibility)
- `client_transactions` - Client payment history (demo data)
- `developer_transactions` - Developer payment history (demo data)
- `client_balance` - Client account balance (demo data)
- `developer_balance` - Developer account balance (demo data)

---

## ✅ Status Summary

### ✅ Fully Implemented Endpoints
- Authentication (register, login)
- User management (CRUD)
- Project management (CRUD + claim, status updates)
- Basic developer list
- Messaging (REST API + WebSocket)
- User status management

### 🔄 Partially Implemented
- Developer stats endpoint (falls back to basic list)
- Rating endpoints (UI ready, needs backend)
- File upload (frontend ready, needs backend)

### ⏳ Pending Backend Implementation
- `GET /developers/all-with-stats`
- `POST /ratings/create`
- `GET /ratings/developer/{id}/average`
- `POST /projects/{projectId}/files`

---

## 📞 Contact
For backend API questions, refer to:
- Backend repository
- OpenAPI/Swagger docs (if available)
- Spring Boot controller implementations
