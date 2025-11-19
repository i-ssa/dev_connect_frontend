import { useState } from 'react';
import '../../styles/Chat.css';

const ChatHeader = ({ userName, userStatus, userAvatar, onSearch }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  console.log('💬 ChatHeader rendered:', { userName, userStatus, userAvatar });

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      onSearch?.('');
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Provide default values
  const displayName = userName || 'Unknown User';
  const displayStatus = userStatus || 'offline';

  return (
    <div className="chat-header">
      {!showSearch ? (
        <>
          <div className="user-info">
            <div className="user-avatar">
              {userAvatar ? (
                <img src={userAvatar} alt={displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`status-indicator ${displayStatus}`}></span>
            </div>
            <div className="user-details">
              <h3 className="user-name">{displayName}</h3>
              <span className="user-status-text">
                {displayStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" title="Search messages" onClick={handleSearchToggle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icon-button" title="More options">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="chat-search-bar">
          <button className="icon-button" onClick={handleSearchToggle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search in conversation..."
            autoFocus
            className="chat-search-input"
          />
          {searchQuery && (
            <button className="icon-button" onClick={() => { setSearchQuery(''); onSearch?.(''); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
