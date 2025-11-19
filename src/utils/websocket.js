// ==============================================
// WEBSOCKET CONNECTION UTILITY
// ==============================================

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Connect to WebSocket server
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onMessage - Called when message received
 * @param {Function} callbacks.onTyping - Called when typing indicator received
 * @param {Function} callbacks.onUserStatus - Called when user status changes
 * @param {Function} callbacks.onReadReceipt - Called when read receipt received
 * @param {Function} callbacks.onConnect - Called when connected
 * @param {Function} callbacks.onDisconnect - Called when disconnected
 * @param {Function} callbacks.onError - Called on error
 * @returns {Object} WebSocket client instance with helper methods
 */
export function connectWebSocket(callbacks = {}) {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userId) {
    console.error('No token or userId found. Cannot connect to WebSocket.');
    return null;
  }

  const socket = new SockJS('http://localhost:8081/ws');
  const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    
    onConnect: (frame) => {
      console.log('✅ Connected to WebSocket:', frame);
      
      // Subscribe to private message queue
      stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const msg = JSON.parse(message.body);
        console.log('📨 Received message:', msg);
        if (callbacks.onMessage) {
          callbacks.onMessage(msg);
        }
      });
      
      // Subscribe to typing indicators
      stompClient.subscribe(`/user/${userId}/queue/typing`, (message) => {
        const typingData = JSON.parse(message.body);
        console.log('⌨️ Typing indicator:', typingData);
        if (callbacks.onTyping) {
          callbacks.onTyping(typingData);
        }
      });
      
      // Subscribe to read receipts
      stompClient.subscribe(`/user/${userId}/queue/read-receipts`, (message) => {
        const receipt = JSON.parse(message.body);
        console.log('📖 Read receipt:', receipt);
        if (callbacks.onReadReceipt) {
          callbacks.onReadReceipt(receipt);
        }
      });
      
      // Subscribe to user status updates (public topic)
      stompClient.subscribe('/topic/user-status', (message) => {
        const status = JSON.parse(message.body);
        console.log('👤 User status:', status);
        if (callbacks.onUserStatus) {
          callbacks.onUserStatus(status);
        }
      });
      
      if (callbacks.onConnect) {
        callbacks.onConnect(frame);
      }
    },
    
    onDisconnect: () => {
      console.log('❌ Disconnected from WebSocket');
      if (callbacks.onDisconnect) {
        callbacks.onDisconnect();
      }
    },
    
    onStompError: (frame) => {
      console.error('❌ WebSocket STOMP error:', frame);
      if (callbacks.onError) {
        callbacks.onError(frame);
      }
    }
  });
  
  stompClient.activate();
  
  // Return helper methods
  return {
    client: stompClient,
    
    /**
     * Send a chat message
     */
    sendMessage: (receiverId, text, projectId = null) => {
      if (!stompClient.connected) {
        console.error('WebSocket not connected');
        return false;
      }
      
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          senderId: parseInt(userId),
          receiverId: parseInt(receiverId),
          text: text,
          projectId: projectId
        })
      });
      return true;
    },
    
    /**
     * Send typing indicator
     */
    sendTypingIndicator: (receiverId, isTyping) => {
      if (!stompClient.connected) {
        return false;
      }
      
      stompClient.publish({
        destination: '/app/typing',
        body: JSON.stringify({
          senderId: parseInt(userId),
          receiverId: parseInt(receiverId),
          isTyping: isTyping
        })
      });
      return true;
    },
    
    /**
     * Mark messages as read
     */
    markAsRead: (senderId) => {
      if (!stompClient.connected) {
        return false;
      }
      
      stompClient.publish({
        destination: '/app/messages-read',
        body: JSON.stringify({
          senderId: parseInt(senderId),
          receiverId: parseInt(userId)
        })
      });
      return true;
    },
    
    /**
     * Disconnect from WebSocket
     */
    disconnect: () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    },
    
    /**
     * Check if connected
     */
    isConnected: () => {
      return stompClient && stompClient.connected;
    }
  };
}

export default connectWebSocket;
