import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { groupMessagesByDate, scrollToBottom } from '../../utils/chatHelpers';
import '../../styles/Chat.css';

const ChatContainer = ({ otherUserName, otherUserAvatar, otherUserStatus: propUserStatus }) => {
  const { 
    messages, 
    sendMessage, 
    currentUserId, 
    otherUserStatus: contextUserStatus,
    typing
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Use prop status if available, fallback to context
  const userStatus = propUserStatus || contextUserStatus;

  // Debug logging
  useEffect(() => {
    console.log('📊 ChatContainer rendered with:');
    console.log('  - otherUserName:', otherUserName);
    console.log('  - otherUserAvatar:', otherUserAvatar);
    console.log('  - userStatus:', userStatus);
    console.log('  - messages:', messages.length, 'messages');
  }, [otherUserName, otherUserAvatar, userStatus, messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom(messageContainerRef);
  }, [messages]);

  // Filter messages based on search query
  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const groupedMessages = groupMessagesByDate(filteredMessages);

  return (
    <div className="chat-container">
      <ChatHeader 
        userName={otherUserName || "User"} 
        userStatus={userStatus}
        userAvatar={otherUserAvatar}
        onSearch={setSearchQuery}
      />

      {searchQuery && (
        <div className="search-results-info">
          Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="messages-container" ref={messageContainerRef}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="message-group">
            <div className="date-separator">
              <span>{date}</span>
            </div>
            {msgs.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSent={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}

        {typing && !searchQuery && (
          <div className="typing-indicator">
            <div className="typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
