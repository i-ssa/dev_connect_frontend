// Updated ChatContext.jsx with proper message sending and WebSocket integration
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import WebSocketService from '../services/WebSocketService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children, currentUserId, otherUserId, projectId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState('offline');
  const [conversationId, setConversationId] = useState(null);

  // Debug props
  useEffect(() => {
    console.log('🔧 ChatProvider props:', { currentUserId, otherUserId, projectId, otherUserName });
  }, [currentUserId, otherUserId, projectId, otherUserName]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show desktop notification
  const showDesktopNotification = (message, userName) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        const notification = new Notification(`New message from ${userName}`, {
          body: message.text || 'Sent a file',
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `chat-${message.senderId}`,
          requireInteraction: false
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  };

  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    if (!currentUserId) return;

    console.log(`🔌 Attempting to connect to WebSocket for user ${currentUserId}...`);
    
    try {
      WebSocketService.connect(currentUserId);
      console.log('✅ WebSocket connection initiated');
    } catch (error) {
      console.warn('⚠️ WebSocket connection failed - will use REST API fallback:', error.message);
      // Continue without WebSocket - REST API will work
    }

    return () => {
      try {
        console.log('🔌 Disconnecting WebSocket...');
        WebSocketService.disconnect();
      } catch (error) {
        console.warn('⚠️ WebSocket disconnect error (safe to ignore):', error.message);
      }
    };
  }, [currentUserId]);

  // Mock messages for fallback
  const mockMessages = [
    {
      id: 1,
      senderId: otherUserId,
      receiverId: currentUserId,
      text: 'Hi! I saw your project and I\'m interested in working on it.',
      content: 'Hi! I saw your project and I\'m interested in working on it.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: 'READ'
    },
    {
      id: 2,
      senderId: currentUserId,
      receiverId: otherUserId,
      text: 'Great! When can you start?',
      content: 'Great! When can you start?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'READ'
    },
    {
      id: 3,
      senderId: otherUserId,
      receiverId: currentUserId,
      text: 'I can start tomorrow. Should we discuss the requirements first?',
      content: 'I can start tomorrow. Should we discuss the requirements first?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'READ'
    }
  ];

  // Load conversation when component mounts or users change
  useEffect(() => {
    if (!currentUserId || !otherUserId) {
      setLoading(false);
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        console.log(`🔄 Loading conversation between user ${currentUserId} and ${otherUserId}...`);
        
        // Get conversation object which contains messages
        const conversationData = await api.getConversation(currentUserId, otherUserId);
        console.log('✅ Loaded conversation from backend:', conversationData);
        
        // Extract messages and conversationId from conversation object
        // Backend returns: { conversationId, messages: [...] }
        const messages = Array.isArray(conversationData) 
          ? conversationData  // If it's already an array of messages
          : conversationData.messages || [];  // Otherwise extract from object
        
        const convId = conversationData.conversationId || conversationData.id || null;
        
        setMessages(messages);
        setConversationId(convId);
        
        // Mark messages as read if we have a conversationId
        if (convId) {
          await api.markMessagesAsRead(convId, currentUserId);
        }
      } catch (error) {
        console.error('❌ Failed to load conversation from backend:', error);
        console.log('📝 Using mock message data instead');
        
        // Use mock data as fallback
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [currentUserId, otherUserId]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    try {
      // Subscribe to new messages
      const handleMessage = (message) => {
        console.log('📨 Received message via WebSocket:', message);
        
        // Only add message if it's part of this conversation
        if ((message.senderId === otherUserId && message.receiverId === currentUserId) ||
            (message.senderId === currentUserId && message.receiverId === otherUserId)) {
          
          console.log('✅ Message is for this conversation, adding to UI');
          
          setMessages(prev => {
            // Avoid duplicates - check if message already exists
            const exists = prev.some(m => m.id === message.id);
            if (exists) {
              console.log('⚠️ Duplicate message, skipping');
              return prev;
            }
            console.log('✨ New message added to chat');
            return [...prev, message];
          });

          // Show desktop notification if message is from other user
          if (message.receiverId === currentUserId && message.senderId === otherUserId) {
            console.log('📬 Showing desktop notification');
            showDesktopNotification(message, otherUserName || 'User');
          }

          // Mark as read if we received it
          if (message.receiverId === currentUserId && conversationId) {
            console.log('📖 Marking message as read');
            api.markMessagesAsRead(conversationId, currentUserId).catch(err => 
              console.error('Failed to mark as read:', err)
            );
          }
        } else {
          console.log('⏭️ Message is for different conversation, ignoring');
        }
      };

      // Subscribe to typing indicators
      const handleTyping = (indicator) => {
        console.log('⌨️ Typing indicator received:', indicator);
        if (indicator.senderId === otherUserId && indicator.receiverId === currentUserId) {
          setTyping(indicator.isTyping);
          console.log(`${indicator.isTyping ? '✍️ User is typing...' : '✅ User stopped typing'}`);
          
          // Auto-clear typing after 3 seconds
          if (indicator.isTyping) {
            setTimeout(() => setTyping(false), 3000);
          }
        }
      };

      // Subscribe to user status changes
      const handleStatus = (status) => {
        if (status.userId === otherUserId) {
          setOtherUserStatus(status.status.toLowerCase());
        }
      };

      // Subscribe to read receipts
      const handleRead = (receipt) => {
        if (receipt.senderId === otherUserId) {
          // Update message statuses to 'read'
          setMessages(prev => prev.map(msg => 
            msg.senderId === currentUserId && msg.receiverId === otherUserId
              ? { ...msg, status: 'READ' }
              : msg
          ));
        }
      };

      // Subscribe using the correct WebSocketService API
      WebSocketService.subscribe('onMessage', handleMessage);
      WebSocketService.subscribe('onTyping', handleTyping);
      WebSocketService.subscribe('onUserStatus', handleStatus);
      WebSocketService.subscribe('onReadReceipt', handleRead);

      // Cleanup subscriptions
      return () => {
        WebSocketService.unsubscribe('onMessage', handleMessage);
        WebSocketService.unsubscribe('onTyping', handleTyping);
        WebSocketService.unsubscribe('onUserStatus', handleStatus);
        WebSocketService.unsubscribe('onReadReceipt', handleRead);
      };
    } catch (error) {
      console.error('❌ WebSocket subscription error:', error);
      // Continue without WebSocket if it fails
      return () => {}; // Return empty cleanup function
    }
  }, [currentUserId, otherUserId]);

  // Send a message
  const sendMessage = async (content, metadata = null) => {
    console.log('🔍 sendMessage called with:', { content, metadata, currentUserId, otherUserId });
    
    if ((!content || !content.trim()) && !metadata) {
      console.error('❌ Cannot send message: missing content');
      return;
    }

    if (!currentUserId || !otherUserId) {
      console.error('❌ Cannot send message: missing user IDs', { currentUserId, otherUserId });
      return;
    }

    try {
      console.log(`📤 Sending message from user ${currentUserId} to user ${otherUserId}:`, content);
      
      // Create message object
      const messageData = {
        senderId: currentUserId,
        receiverId: otherUserId,
        text: content?.trim() || '',
        content: content?.trim() || '',
        timestamp: new Date().toISOString(),
        status: 'SENT',
        metadata: metadata,
        id: Date.now() // Temporary ID until backend responds
      };

      console.log('✅ Adding message optimistically to UI:', messageData);
      
      // Optimistically add to UI for instant feedback
      setMessages(prev => {
        const newMessages = [...prev, messageData];
        console.log('📝 Updated messages array:', newMessages.length, 'messages');
        return newMessages;
      });

      // Send via API if available
      try {
        const sentMessage = await api.sendMessage(
          currentUserId,
          otherUserId,
          content?.trim() || ''
        );
        
        console.log('✅ Message sent successfully via API:', sentMessage);

        // Update with real message from backend
        setMessages(prev => prev.map(m => 
          m.id === messageData.id ? { ...sentMessage, metadata } : m
        ));

        return sentMessage;
      } catch (apiError) {
        console.error('❌ API send failed, message saved locally only:', apiError);
        return messageData;
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (isTyping) => {
    if (!currentUserId || !otherUserId) return;
    
    try {
      WebSocketService.sendTypingIndicator(otherUserId, isTyping);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  };

  const value = {
    messages,
    loading,
    typing,
    otherUserStatus,
    sendMessage,
    sendTypingIndicator,
    currentUserId,
    otherUserId,
    projectId
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
