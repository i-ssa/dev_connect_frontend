// WebSocket service for real-time messaging
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.currentUserId = null;
    this.isConnected = false;
    this.subscribers = {
      onMessage: [],
      onTyping: [],
      onUserStatus: [],
      onReadReceipt: [],
      onConnect: [],
      onDisconnect: []
    };
  }

  /**
   * Connect to WebSocket server
   * @param {number} userId - Current user's ID
   */
  connect(userId) {
    if (this.isConnected) {
      console.log('Already connected');
      return;
    }

    this.currentUserId = userId;
    
    // Get token from localStorage for authentication
    const token = localStorage.getItem('token');
    
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      connectHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        this.isConnected = true;
        
        // Subscribe to private message queue
        this.client.subscribe(`/user/${userId}/queue/messages`, (message) => {
          const messageData = JSON.parse(message.body);
          this._notifySubscribers('onMessage', messageData);
        });
        
        // Subscribe to typing indicators
        this.client.subscribe(`/user/${userId}/queue/typing`, (message) => {
          const typingData = JSON.parse(message.body);
          this._notifySubscribers('onTyping', typingData);
        });
        
        // Subscribe to read receipts
        this.client.subscribe(`/user/${userId}/queue/read-receipts`, (message) => {
          const receiptData = JSON.parse(message.body);
          this._notifySubscribers('onReadReceipt', receiptData);
        });
        
        // Subscribe to user status updates (public topic)
        this.client.subscribe('/topic/user-status', (message) => {
          const statusData = JSON.parse(message.body);
          this._notifySubscribers('onUserStatus', statusData);
        });
        
        // Update user status to online
        this.updateUserStatus('ONLINE');
        
        // Notify connection subscribers
        this._notifySubscribers('onConnect');
      },
      
      onDisconnect: () => {
        console.log('❌ Disconnected from WebSocket');
        this.isConnected = false;
        this._notifySubscribers('onDisconnect');
      },
      
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      }
    });
    
    this.client.activate();
  }

  /**
   * Send a chat message
   * @param {number} receiverId 
   * @param {string} text 
   * @param {number} projectId 
   */
  sendMessage(receiverId, text, projectId) {
    if (!this.isConnected || !this.client) {
      console.error('Not connected to WebSocket');
      return;
    }

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify({
        senderId: this.currentUserId,
        receiverId: receiverId,
        text: text,
        projectId: projectId
      })
    });
  }

  /**
   * Send typing indicator
   * @param {number} receiverId 
   * @param {boolean} isTyping 
   */
  sendTypingIndicator(receiverId, isTyping) {
    if (!this.isConnected || !this.client) return;

    this.client.publish({
      destination: '/app/typing',
      body: JSON.stringify({
        senderId: this.currentUserId,
        receiverId: receiverId,
        isTyping: isTyping
      })
    });
  }

  /**
   * Mark messages as read
   * @param {number} senderId - ID of the user who sent the messages
   */
  markMessagesAsRead(senderId) {
    if (!this.isConnected || !this.client) return;

    this.client.publish({
      destination: '/app/messages-read',
      body: JSON.stringify({
        senderId: senderId,
        receiverId: this.currentUserId
      })
    });

    // Also call REST API to update database
    fetch(`http://localhost:8081/api/messages/read?senderId=${senderId}&receiverId=${this.currentUserId}`, {
      method: 'PUT'
    }).catch(err => console.error('Error marking as read:', err));
  }

  /**
   * Update user online/offline status
   * @param {string} status - 'ONLINE' or 'OFFLINE'
   */
  updateUserStatus(status) {
    if (!this.currentUserId) return;

    fetch(`http://localhost:8081/api/messages/status/${this.currentUserId}?status=${status}`, {
      method: 'PUT'
    }).catch(err => console.error('Error updating status:', err));
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      this.updateUserStatus('OFFLINE');
      this.client.deactivate();
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  /**
   * Subscribe to WebSocket events
   * @param {string} event - Event name: 'onMessage', 'onTyping', 'onUserStatus', 'onConnect', 'onDisconnect'
   * @param {function} callback 
   */
  subscribe(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(callback);
    }
  }

  /**
   * Unsubscribe from WebSocket events
   */
  unsubscribe(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify all subscribers of an event
   */
  _notifySubscribers(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export default new WebSocketService();
