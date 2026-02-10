import React, { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import '../styles/ChatBox.css';

function ChatBox({
  selectedUser,
  messages,
  currentUser,
  onSendMessage,
  onDeleteMessage,
  onBack
}) {
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

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const handleImageClick = (imageUrl) => {
    setImagePreview(imageUrl);
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const key = new Date(msg.timestamp).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  };

  const getProfileImage = (user) =>
    user.profilePicture
      ? `https://chatwithlocalfriends.onrender.com${user.profilePicture}`
      : null;

  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-box">
      {showDeleteDialog && (
        <DeleteConfirmDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {imagePreview && (
        <div className="image-preview-overlay" onClick={() => setImagePreview(null)}>
          <div className="image-preview-container">
            <button className="close-preview">✕</button>
            <img src={imagePreview} alt="Preview" className="preview-image" />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="chat-box-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar-wrapper">
            {getProfileImage(selectedUser) ? (
              <img
                src={getProfileImage(selectedUser)}
                alt={selectedUser.name}
                className="chat-user-avatar-img"
              />
            ) : (
              <div className="chat-user-avatar">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`chat-status-dot ${selectedUser.isOnline ? 'online' : 'offline'}`} />
          </div>
          <div>
            <div className="chat-user-name">{selectedUser.name}</div>
            <div className={`chat-user-status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* 🔙 BACK → HOME */}
        <button className="info-btn" onClick={onBack} title="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 18l-6-6 6-6"
            />
          </svg>
        </button>
      </div>

      {/* MESSAGES */}
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

              {messageGroups[dateKey].map((msg, i) => {
                const isOwn = msg.senderId === currentUser._id;
                return (
                  <div
                    key={msg._id || i}
                    className={`message ${isOwn ? 'own-message' : 'other-message'}`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="message-content">
                      {!isOwn && <div className="message-sender">{msg.senderName}</div>}

                      {msg.messageType === 'image' && msg.mediaUrl && (
                        <div className="message-media">
                          <img
                            src={`https://chatwithlocalfriends.onrender.com${msg.mediaUrl}`}
                            alt="media"
                            className="message-image"
                            onClick={() =>
                              handleImageClick(
                                `https://chatwithlocalfriends.onrender.com${msg.mediaUrl}`
                              )
                            }
                          />
                        </div>
                      )}

                      {msg.message && <div className="message-text">{msg.message}</div>}

                      <div className="message-footer">
                        <span className="message-time">{formatTime(msg.timestamp)}</span>

                        {isOwn && hoveredMessageId === msg._id && (
                          <button
                            className="delete-message-btn"
                            onClick={() => handleDeleteClick(msg._id)}
                          >
                            🗑
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
