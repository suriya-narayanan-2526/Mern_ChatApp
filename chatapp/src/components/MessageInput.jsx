import React, { useState, useRef } from 'react';
import '../styles/MessageInput.css';
import { API_BASE_URL } from '../config';

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '👍', '👎', '👊', '✊', '🤞', '✌️', '🤟', '🤘',
    '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋',
    '🔥', '⭐', '🌟', '✨', '⚡', '💥', '💫', '🌈',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, 'text', null);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    inputRef.current?.focus();
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Send message with image URL from backend
        onSendMessage('', 'image', data.mediaUrl);
      } else {
        alert(data.message || 'Failed to upload media');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to connect to server for media upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="message-input-wrapper">
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <span>Pick an emoji</span>
            <button
              className="emoji-close-btn"
              onClick={() => setShowEmojiPicker(false)}
            >
              ✕
            </button>
          </div>
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-btn"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="message-input-container" onSubmit={handleSubmit}>
        <button
          type="button"
          className="input-action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Send image"
        >
          {uploading ? (
            <span className="loading-spinner-small"></span>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleMediaUpload}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="input-action-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Add emoji"
        >
          😊
        </button>

        <input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder="Send a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={uploading}
        />

        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || uploading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default MessageInput;