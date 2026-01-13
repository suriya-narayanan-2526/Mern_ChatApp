import React, { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import '../styles/ChatBox.css';

function ChatBox({ selectedUser, messages, currentUser, onSendMessage, onDeleteMessage }) {
  const messagesEndRef = useRef(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      onDeleteMessage(messageToDelete);
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setMessageToDelete(null);
  };

  const handleImageClick = (imageUrl) => {
    setImagePreview(imageUrl);
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const getProfileImage = (user) => {
    if (user.profilePicture) {
      return `http://localhost:5000${user.profilePicture}`;
    }
    return null;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-box">
      {showDeleteDialog && (
        <DeleteConfirmDialog
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {imagePreview && (
        <div className="image-preview-overlay" onClick={() => setImagePreview(null)}>
          <div className="image-preview-container">
            <button className="close-preview" onClick={() => setImagePreview(null)}>
              ✕
            </button>
            <img src={imagePreview} alt="Preview" className="preview-image" />
          </div>
        </div>
      )}

      <div className="chat-box-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar-wrapper">
            {getProfileImage(selectedUser) ? (
              <img src={getProfileImage(selectedUser)} alt={selectedUser.name} className="chat-user-avatar-img" />
            ) : (
              <div className="chat-user-avatar">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`chat-status-dot ${selectedUser.isOnline ? 'online' : 'offline'}`}></span>
          </div>
          <div>
            <div className="chat-user-name">{selectedUser.name}</div>
            <div className={`chat-user-status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <button className="info-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2C5.59 2 2 5.59 2 10C2 14.41 5.59 18 10 18C14.41 18 18 14.41 18 10C18 5.59 14.41 2 10 2ZM10 14C9.45 14 9 13.55 9 13V9C9 8.45 9.45 8 10 8C10.55 8 11 8.45 11 9V13C11 13.55 10.55 14 10 14ZM11 6H9V4H11V6Z"/>
          </svg>
        </button>
      </div>

      <div className="messages-container">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.keys(messageGroups).map(dateKey => (
            <div key={dateKey}>
              <div className="date-divider">
                <span>{formatDate(new Date(dateKey))}</span>
              </div>
              {messageGroups[dateKey].map((message, index) => {
                const isOwnMessage = message.senderId === currentUser._id;
                return (
                  <div
                    key={message._id || index}
                    className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                    onMouseEnter={() => setHoveredMessageId(message._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="message-content">
                      {!isOwnMessage && (
                        <div className="message-sender">{message.senderName}</div>
                      )}
                      
                      {message.messageType === 'image' && message.mediaUrl ? (
                        <div className="message-media">
                          <img 
                            src={`http://localhost:5000${message.mediaUrl}`} 
                            alt="Sent media" 
                            className="message-image"
                            onClick={() => handleImageClick(`http://localhost:5000${message.mediaUrl}`)}
                          />
                        </div>
                      ) : null}
                      
                      {message.message && (
                        <div className="message-text">{message.message}</div>
                      )}
                      
                      <div className="message-footer">
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                        {isOwnMessage && hoveredMessageId === message._id && (
                          <button 
                            className="delete-message-btn"
                            onClick={() => handleDeleteClick(message._id)}
                            title="Delete message"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}

export default ChatBox;