// Updated ChatList component with backend integration
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/ChatList.css';

const ChatList = ({ onSelectChat, activeChat, currentUserId, userRole = 'client' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fallback
  const mockChats = [
    {
      userId: 2,
      userName: 'John Developer',
      userAvatar: null,
      userRole: 'developer',
      lastMessage: 'Sounds good! I can start working on it tomorrow.',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 2,
      userStatus: 'online',
      projectId: 1,
    },
    {
      userId: 3,
      userName: 'Sarah Designer',
      userAvatar: null,
      userRole: 'developer',
      lastMessage: 'I have some design mockups ready for review',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
      userStatus: 'offline',
      projectId: 2,
    },
    {
      userId: 4,
      userName: 'Mike Frontend',
      userAvatar: null,
      userRole: 'developer',
      lastMessage: 'The responsive design is complete',
      lastMessageTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
      userStatus: 'away',
      projectId: 3,
    },
  ];

  useEffect(() => {
    loadChats();
    
    // Refresh chats every 5 seconds
    const interval = setInterval(loadChats, 5000);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadChats = async () => {
    try {
      const userChats = await api.getUserChats(currentUserId);
      setChats(userChats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load chats:', error);
      // Use mock data as fallback
      console.log('Using mock chat data');
      setChats(mockChats);
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="chat-list-panel">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="loading">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-list-panel">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Messages</h2>
        <div className="header-actions">
          <button className="icon-btn" title="New chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="chat-search">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="chat-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Unread</button>
        <button className="filter-btn">Active Projects</button>
      </div>

      {/* Chat List */}
      <div className="chat-list-items">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>
              {userRole === 'client' 
                ? 'No developers on your projects yet' 
                : 'No clients for your projects yet'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.userId || chat.id}
              className={`chat-item ${activeChat === chat.userId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                {chat.userAvatar ? (
                  <img src={chat.userAvatar} alt={chat.userName} />
                ) : (
                  <div className="avatar-placeholder">
                    {chat.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                {chat.userStatus === 'online' && <span className="online-dot"></span>}
              </div>
              
              <div className="chat-info">
                <div className="chat-header-row">
                  <h3 className="chat-name">{chat.userName}</h3>
                  <span className="chat-time">{formatTimestamp(chat.lastMessageTime)}</span>
                </div>
                <div className="chat-message-row">
                  <p className="chat-last-message">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
