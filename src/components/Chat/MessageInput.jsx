// Updated MessageInput with typing indicator and file sharing
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import '../../styles/Chat.css';

const MessageInput = ({ disabled }) => {
  const { sendMessage, sendTypingIndicator } = useChat();
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup: send "not typing" when component unmounts
      if (isTypingRef.current) {
        sendTypingIndicator(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sendTypingIndicator]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Send typing indicator
    if (!isTypingRef.current && e.target.value.trim()) {
      sendTypingIndicator(true);
      isTypingRef.current = true;
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTypingIndicator(false);
        isTypingRef.current = false;
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((text.trim() || selectedFile) && !disabled) {
      if (selectedFile) {
        // Send file message with metadata
        sendMessage(text || selectedFile.name, {
          type: 'file',
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          fileUrl: URL.createObjectURL(selectedFile)
        });
        setSelectedFile(null);
      } else {
        sendMessage(text);
      }
      setText('');
      
      // Stop typing indicator
      if (isTypingRef.current) {
        sendTypingIndicator(false);
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      {selectedFile && (
        <div className="selected-file-preview">
          <div className="file-info">
            <span className="file-icon">
              {selectedFile.type.startsWith('image/') ? '🖼️' : 
               selectedFile.type.includes('pdf') ? '📄' : '📎'}
            </span>
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <button type="button" onClick={removeFile} className="remove-file-btn">
            ×
          </button>
        </div>
      )}
      <div className="input-wrapper">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <button 
          type="button" 
          onClick={handleAttachClick}
          disabled={disabled}
          className="attach-button"
          title="Attach file"
        >
          📎
        </button>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
          disabled={disabled}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={(!text.trim() && !selectedFile) || disabled}
          className="send-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
