// Updated MessagingPage.jsx with backend integration - Using new API utilities
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatList from '../components/Chat/ChatList';
import { ChatProvider } from '../context/ChatContext';
import ChatContainer from '../components/Chat/ChatContainer';
import api from '../utils/api';
import '../styles/MessagingLayout.css';

const MessagingPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get logged-in user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('devconnect_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          id: user.id || user.userId,
          username: user.username || user.email?.split('@')[0],
          email: user.email,
          role: user.role,
          avatar: user.avatar || null,
          status: 'online'
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // Redirect to login if no valid user
        navigate('/login');
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Auto-select chat if userId is in URL (e.g., /messages?userId=2)
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && currentUser) {
      // Load user details and auto-select
      const loadUser = async () => {
        try {
          const user = await api.getUserById(parseInt(userId));
          setSelectedChat({
            userId: user.id,
            userName: user.username || user.email?.split('@')[0],
            userAvatar: user.avatar,
            userRole: user.role,
            userStatus: 'online',
            projectId: searchParams.get('projectId') || 1
          });
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      };
      loadUser();
    }
  }, [searchParams, currentUser]);

  const handleSelectChat = (chat) => {
    console.log('🎯 Chat selected:', chat);
    console.log('userId:', chat.userId, 'userName:', chat.userName);
    console.log('Full chat object:', JSON.stringify(chat, null, 2));
    setSelectedChat(chat);
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading || !currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading messages...
      </div>
    );
  }

  return (
    <div>
      <div className="messaging-layout">
        {/* Back Button */}
        <button className="messaging-back-button" onClick={handleBackClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M19 12H5M5 12L12 19M5 12L12 5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {/* Middle Panel - Chat List */}
        <ChatList 
          currentUserId={currentUser.id}
          onSelectChat={handleSelectChat} 
          activeChat={selectedChat?.userId}
          userRole={currentUser.role}
        />

        {/* Right Panel - Chat Interface */}
        <div className="chat-main-area">
          {selectedChat && selectedChat.userId ? (
            <ChatProvider
              currentUserId={currentUser.id}
              otherUserId={selectedChat.userId}
              projectId={selectedChat.projectId || 1}
              otherUserName={selectedChat.userName}
            >
              <ChatContainer 
                otherUserName={selectedChat.userName}
                otherUserAvatar={selectedChat.userAvatar}
                otherUserStatus={selectedChat.userStatus || 'offline'}
              />
            </ChatProvider>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                    stroke="#ccc" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <h2>Welcome, {currentUser.username}!</h2>
                <p>
                  {currentUser.role === 'client'
                    ? 'Select a developer to start messaging'
                    : 'Select a client to start messaging'}
                </p>
                <p className="subtitle">
                  {currentUser.role === 'client'
                    ? 'Chat with developers working on your projects'
                    : 'Chat with clients about their projects'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
