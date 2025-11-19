import ReadReceipts from './ReadReceipts';
import { formatMessageTime } from '../../utils/chatHelpers';
import '../../styles/Chat.css';

const MessageBubble = ({ message, isSent, showTime = true }) => {
  const isFileMessage = message.metadata?.type === 'file';
  const isImage = message.metadata?.fileType?.startsWith('image/');

  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isSent ? 'bubble-sent' : 'bubble-received'}`}>
        {isFileMessage && (
          <div className="message-file-attachment">
            {isImage ? (
              <div className="message-image-container">
                <img 
                  src={message.metadata.fileUrl} 
                  alt={message.metadata.fileName}
                  className="message-image"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="message-file-info">
                <span className="file-icon">
                  {message.metadata.fileType?.includes('pdf') ? '📄' : '📎'}
                </span>
                <div className="file-meta">
                  <span className="file-name">{message.metadata.fileName}</span>
                  <span className="file-size">
                    {(message.metadata.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <a 
                  href={message.metadata.fileUrl} 
                  download={message.metadata.fileName}
                  className="file-download-btn"
                >
                  ⬇️
                </a>
              </div>
            )}
          </div>
        )}
        {message.text && <p className="message-text">{message.text}</p>}
        <div className="message-meta">
          <span className="message-time">{formatMessageTime(message.timestamp)}</span>
          {isSent && <ReadReceipts status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
