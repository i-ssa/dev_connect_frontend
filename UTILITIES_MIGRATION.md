# API & WebSocket Utilities Migration

## ✅ Completed Changes

### 1. Created `/src/utils/api.js`
**New centralized API helper** that exports all backend endpoints:

```javascript
import api from '../utils/api';

// Usage examples:
await api.login(email, password);
await api.getUserChats(userId);
await api.sendMessage(senderId, receiverId, text);
await api.createProject(projectData);
```

**Features:**
- ✅ All endpoints from your backend API reference
- ✅ Automatic JWT token in headers (`Authorization: Bearer ${token}`)
- ✅ Clean function names
- ✅ Error handling
- ✅ Consistent response parsing

**Available Methods:**
- **Auth:** `register`, `login`
- **Users:** `getAllUsers`, `getUserById`, `updateUser`, `deleteUser`, `getCurrentDeveloperProfile`
- **Projects:** `createProject`, `getAllProjects`, `getPendingProjects`, `getProjectById`, `getMyDeveloperProjects`, `getProjectsByDeveloperId`, `getProjectsByClientId`, `claimProject`, `updateProjectStatus`, `updateProject`, `deleteProject`
- **Developers:** `getAllDevelopers`, `getAllDevelopersWithStats`
- **Ratings:** `createRating`, `getDeveloperRatings`, `getDeveloperAverageRating`
- **Messages:** `getUserChats`, `getConversation`, `getConversationMessages`, `sendMessage`, `markMessagesAsRead`, `updateUserStatus`, `getUserStatus`

### 2. Created `/src/utils/websocket.js`
**New WebSocket connection utility** with clean callbacks:

```javascript
import { connectWebSocket } from '../utils/websocket';

// Usage:
const ws = connectWebSocket({
  onMessage: (msg) => console.log('Received:', msg),
  onTyping: (data) => console.log('Typing:', data),
  onUserStatus: (status) => console.log('Status:', status),
  onConnect: () => console.log('Connected!'),
  onDisconnect: () => console.log('Disconnected'),
  onError: (err) => console.error('Error:', err)
});

// Send message
ws.sendMessage(receiverId, 'Hello!');

// Send typing indicator
ws.sendTypingIndicator(receiverId, true);

// Mark as read
ws.markAsRead(senderId);

// Disconnect
ws.disconnect();
```

**Features:**
- ✅ Automatic JWT token authentication
- ✅ Auto-reconnect on disconnect
- ✅ Subscribes to all message queues
- ✅ Clean callback-based API
- ✅ Helper methods for common actions

### 3. Updated `/src/components/Login.jsx`
**Now properly stores tokens:**

```javascript
// BEFORE (missing userId)
localStorage.setItem('token', result.accessToken);

// AFTER (complete)
localStorage.setItem('token', result.accessToken);
localStorage.setItem('userId', String(userWithId.userId));
```

### 4. Updated `/src/pages/MessagingPage.jsx`
**Now uses new API utility:**

```javascript
// BEFORE
import ApiService from '../services/ApiService';
const user = await ApiService.getUser(userId);

// AFTER
import api from '../utils/api';
const user = await api.getUserById(userId);
```

---

## 📦 File Structure

```
src/
├── utils/
│   ├── api.js              ← NEW: Centralized API helper
│   ├── websocket.js        ← NEW: WebSocket connection utility
│   └── chatHelpers.js      (existing)
├── services/
│   ├── ApiService.js       (can be deprecated/removed)
│   └── WebSocketService.js (can be deprecated/removed)
├── components/
│   └── Login.jsx           ✅ Updated to store userId
└── pages/
    └── MessagingPage.jsx   ✅ Updated to use new api utility
```

---

## 🔑 localStorage Keys

The app now uses consistent localStorage keys:

| Key | Value | Used By |
|-----|-------|---------|
| `token` | JWT access token | **PRIMARY** - All API calls |
| `userId` | User ID (string) | WebSocket, API calls |
| `devconnect_user` | Full user object (JSON) | UI display, role checks |
| `devconnect_token` | JWT access token | Backward compatibility |
| `devconnect_refresh_token` | Refresh token | Token refresh |

**On Login:**
```javascript
localStorage.setItem('token', data.accessToken);           // ← PRIMARY
localStorage.setItem('userId', String(data.user.userId));  // ← REQUIRED
localStorage.setItem('devconnect_user', JSON.stringify(user));
```

---

## 🚀 Migration Guide for Other Components

### Before (Old Way):
```javascript
import ApiService from '../services/ApiService';
import WebSocketService from '../services/WebSocketService';

// API calls
const user = await ApiService.getUser(userId);
const projects = await ApiService.getProjectsByClient(clientId);

// WebSocket
WebSocketService.connect(userId);
WebSocketService.subscribe('onMessage', handleMessage);
WebSocketService.sendMessage(receiverId, text, projectId);
```

### After (New Way):
```javascript
import api from '../utils/api';
import { connectWebSocket } from '../utils/websocket';

// API calls - cleaner names
const user = await api.getUserById(userId);
const projects = await api.getProjectsByClientId(clientId);

// WebSocket - callback based
const ws = connectWebSocket({
  onMessage: handleMessage
});
ws.sendMessage(receiverId, text);
```

---

## ✅ What's Working Now

1. ✅ **Centralized API** - All endpoints in one place
2. ✅ **JWT Authentication** - Automatic token in all requests
3. ✅ **WebSocket with Auth** - Token sent in connect headers
4. ✅ **Clean Callbacks** - No more manual subscription management
5. ✅ **Proper Token Storage** - Both `token` and `userId` saved on login
6. ✅ **Consistent Naming** - `getUserById` instead of `getUser`

---

## 🔄 Next Steps (Optional)

1. **Migrate remaining components** to use `api` utility:
   - `FindDevelopers.jsx`
   - `MyProjectClient.jsx`
   - `DashboardClient.jsx`
   - `DashboardDeveloper.jsx`

2. **Remove old services** (after migration):
   ```bash
   # Once all components migrated:
   rm src/services/ApiService.js
   rm src/services/WebSocketService.js
   ```

3. **Update ChatContext** to use new WebSocket utility (optional)

---

## 📝 Example: Complete Messaging Component

```javascript
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { connectWebSocket } from '../utils/websocket';

function MessagingComponent() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    // Load initial messages
    api.getUserChats(userId).then(chats => {
      console.log('Chats:', chats);
    });
    
    // Connect WebSocket
    const websocket = connectWebSocket({
      onMessage: (msg) => {
        setMessages(prev => [...prev, msg]);
      },
      onConnect: () => console.log('Connected!'),
      onDisconnect: () => console.log('Disconnected')
    });
    
    setWs(websocket);
    
    return () => websocket.disconnect();
  }, [userId]);
  
  const sendMessage = (receiverId, text) => {
    if (ws?.isConnected()) {
      ws.sendMessage(receiverId, text);
    } else {
      // Fallback to REST API
      api.sendMessage(userId, receiverId, text);
    }
  };
  
  return (
    <div>
      {/* Your messaging UI */}
    </div>
  );
}
```

---

## 🎯 Summary

**Created:**
- ✅ `src/utils/api.js` - All backend endpoints
- ✅ `src/utils/websocket.js` - WebSocket connection utility

**Updated:**
- ✅ `src/components/Login.jsx` - Now stores `userId`
- ✅ `src/pages/MessagingPage.jsx` - Uses new `api` utility

**Result:**
- Cleaner code
- Consistent API usage
- Proper authentication
- Easy to maintain
- Ready for real backend integration! 🚀
