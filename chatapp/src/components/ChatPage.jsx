import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import UserList from './UserList';
import ChatBox from './ChatBox';
import ProfilePage from './ProfilePage';
import '../styles/ChatPage.css';

const socket = io('https://chatwithlocalfriends.onrender.com', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

function ChatPage({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(currentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});

  /* ===================================================== */
  /* ✅ SINGLE MOBILE BACK BUTTON HANDLER (FIXED) */
  /* ===================================================== */
  useEffect(() => {
    const handleBackButton = () => {
      // 1️⃣ Profile open → go back to Home
      if (showProfile) {
        setShowProfile(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }

      // 2️⃣ Chat open → go back to UserList
      if (selectedUser) {
        setSelectedUser(null);
        window.history.pushState(null, '', window.location.href);
        return;
      }

      // 3️⃣ Otherwise → allow browser default
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [selectedUser, showProfile]);
  /* ===================================================== */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          'https://chatwithlocalfriends.onrender.com/api/auth/users'
        );
        const data = await response.json();
        setUsers(data.filter(user => user._id !== currentUser._id));
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();

    socket.on('connect', () => {
      setTimeout(() => {
        socket.emit('user_login', currentUser._id);
      }, 100);
    });

    socket.on('user_list_updated', (userList) => {
      setUsers(userList.filter(user => user._id !== currentUser._id));
    });

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);

      if (message.senderId !== currentUser._id) {
        const otherUserId = message.senderId;
        if (!selectedUser || selectedUser._id !== otherUserId) {
          setUnreadMessages(prev => ({
            ...prev,
            [otherUserId]: (prev[otherUserId] || 0) + 1
          }));
        }
      }
    });

    socket.on('load_messages', setMessages);

    socket.on('message_deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    return () => {
      socket.off('connect');
      socket.off('user_list_updated');
      socket.off('receive_message');
      socket.off('load_messages');
      socket.off('message_deleted');
    };
  }, [currentUser._id, selectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    setShowProfile(false);

    setUnreadMessages(prev => {
      const copy = { ...prev };
      delete copy[user._id];
      return copy;
    });

    socket.emit('join_private_room', {
      currentUserId: currentUser._id,
      otherUserId: user._id
    });
  };

  const handleSendMessage = (message, messageType, mediaUrl) => {
    if (!selectedUser) return;

    socket.emit('send_message', {
      senderId: currentUser._id,
      senderName: currentUser.name,
      receiverId: selectedUser._id,
      message: message || '',
      messageType: messageType || 'text',
      mediaUrl: mediaUrl || null
    });
  };

  const handleDeleteMessage = (messageId) => {
    if (!selectedUser) return;

    socket.emit('delete_message', {
      messageId,
      senderId: currentUser._id,
      receiverId: selectedUser._id
    });
  };

  const handleLogout = () => {
    socket.disconnect();
    onLogout();
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setSelectedUser(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUserProfile(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="app-branding">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4C13.5 4 5 12.5 5 23C5 28.5 7.5 33.5 11.5 37L8 44L15.5 41C18.5 42.5 21.5 43 24 43C34.5 43 43 34.5 43 23C43 12.5 34.5 4 24 4Z"
                fill="#8B5CF6"
              />
            </svg>
            <span className="app-name">QuickChat</span>
          </div>
          <button className="menu-btn" onClick={handleShowProfile}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="5" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="15" r="1.5" />
            </svg>
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search User..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <UserList
          users={filteredUsers}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          unreadMessages={unreadMessages}
        />
      </div>

      <div className="chat-main">
        {showProfile ? (
          <ProfilePage
            currentUser={currentUserProfile}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
            onClose={() => setShowProfile(false)}
          />
        ) : selectedUser ? (
          <ChatBox
            selectedUser={selectedUser}
            messages={messages}
            currentUser={currentUserProfile}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="no-chat-icon">💬</div>
              <h3>Welcome to QuickChat</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
